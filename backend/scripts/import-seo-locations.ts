import { PrismaClient } from '@prisma/client';
import { locationsData } from '../src/locations/locations.data';

const prisma = new PrismaClient();

enum LocationType {
  PROVINCE = 'PROVINCE',
  CITY = 'CITY',
  TOWN = 'TOWN',
  SUBURB = 'SUBURB',
}

interface LocationData {
  name: string;
  slug: string;
  type: LocationType;
  province: string;
  provinceSlug: string;
  parentLocationId?: string;
}

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    // Remove content in parentheses
    .replace(/\s*\([^)]*\)/g, '')
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
}

function determineLocationType(locationName: string, province: string): LocationType {
  // Major cities (population > 500k or provincial capitals)
  const majorCities = [
    'Johannesburg', 'Cape Town', 'Durban', 'Pretoria', 'Port Elizabeth', 'Gqeberha',
    'Pietermaritzburg', 'Bloemfontein', 'Nelspruit', 'Mbombela', 'Polokwane',
    'Kimberley', 'Rustenburg', 'East London', 'Makhanda', 'Grahamstown',
    'Mafikeng', 'Mmabatho', 'Mahikeng'
  ];
  
  // Known suburbs/townships (typically part of larger cities)
  const knownSuburbs = [
    'Alexandra', 'Soweto', 'Sandton', 'Randburg', 'Roodepoort', 'Benoni', 'Boksburg',
    'Kempton Park', 'Germiston', 'Alberton', 'Edenvale', 'Bedfordview',
    'Katlehong', 'Tembisa', 'Vosloorus', 'Tokoza', 'Tsakane', 'Duduza', 'KwaThema',
    'Diepsloot', 'Orange Farm', 'Ennerdale', 'Lenz', 'Lenasia',
    'Mamelodi', 'Atteridgeville', 'Soshanguve', 'Ga-Rankuwa', 'Mabopane',
    'Centurion', 'Irene', 'Bronkhorstspruit',
    'Khayelitsha', 'Mitchells Plain', 'Mitchell\'s Plain', 'Gugulethu', 'Langa', 'Nyanga',
    'Bellville', 'Parow', 'Goodwood', 'Brackenfell', 'Kraaifontein', 'Kuils River',
    'Somerset West', 'Strand', 'Gordon\'s Bay', 'Milnerton', 'Blouberg',
    'Hout Bay', 'Fish Hoek', 'Simon\'s Town', 'Muizenberg', 'Noordhoek',
    'KwaMashu', 'Umlazi', 'Phoenix', 'Chatsworth', 'Pinetown', 'Westville',
    'Umbumbulu', 'Inanda', 'Ntuzuma', 'Clermont', 'Verulam', 'Tongaat',
    'Umhlanga', 'uMhlanga', 'Ballito', 'Hillcrest', 'Kloof', 'Queensburgh',
    'Mdantsane', 'Bisho', 'Gonubie',
    'Botshabelo', 'Thaba Nchu',
    'Seshego', 'Lebowakgomo',
    'Thulamahashe', 'Bushbuckridge'
  ];
  
  // Check if it's a major city
  if (majorCities.some(city => locationName.includes(city) || city.includes(locationName))) {
    return LocationType.CITY;
  }
  
  // Check if it's a known suburb
  if (knownSuburbs.some(suburb => locationName.includes(suburb) || suburb.includes(locationName))) {
    return LocationType.SUBURB;
  }
  
  // Default classification based on name patterns
  // Townships often have specific naming patterns
  if (locationName.includes('Township') || locationName.startsWith('Kwa') || 
      locationName.startsWith('Ga-') || locationName.includes('Location')) {
    return LocationType.SUBURB;
  }
  
  // Smaller places are typically towns
  return LocationType.TOWN;
}

function findParentCity(locationName: string, province: string, allLocations: LocationData[]): string | undefined {
  // Map suburbs to their parent cities
  const suburbToCityMap: { [key: string]: string } = {
    // Gauteng - Johannesburg suburbs
    'Alexandra': 'Johannesburg',
    'Soweto': 'Johannesburg',
    'Sandton': 'Johannesburg',
    'Randburg': 'Johannesburg',
    'Roodepoort': 'Johannesburg',
    'Diepsloot': 'Johannesburg',
    'Orange Farm': 'Johannesburg',
    'Ennerdale': 'Johannesburg',
    'Lenz': 'Johannesburg',
    'Lenasia': 'Johannesburg',
    
    // Gauteng - Pretoria suburbs
    'Mamelodi': 'Pretoria',
    'Atteridgeville': 'Pretoria',
    'Soshanguve': 'Pretoria',
    'Ga-Rankuwa': 'Pretoria',
    'Mabopane': 'Pretoria',
    'Centurion': 'Pretoria',
    
    // Gauteng - East Rand suburbs
    'Benoni': 'Johannesburg',
    'Boksburg': 'Johannesburg',
    'Kempton Park': 'Johannesburg',
    'Germiston': 'Johannesburg',
    'Alberton': 'Johannesburg',
    'Edenvale': 'Johannesburg',
    'Bedfordview': 'Johannesburg',
    'Katlehong': 'Johannesburg',
    'Tembisa': 'Johannesburg',
    'Vosloorus': 'Johannesburg',
    'Tokoza': 'Johannesburg',
    'Tsakane': 'Johannesburg',
    'Duduza': 'Johannesburg',
    'KwaThema': 'Johannesburg',
    
    // Western Cape - Cape Town suburbs
    'Khayelitsha': 'Cape Town',
    'Mitchells Plain': 'Cape Town',
    'Mitchell\'s Plain': 'Cape Town',
    'Gugulethu': 'Cape Town',
    'Langa': 'Cape Town',
    'Nyanga': 'Cape Town',
    'Bellville': 'Cape Town',
    'Parow': 'Cape Town',
    'Goodwood': 'Cape Town',
    'Brackenfell': 'Cape Town',
    'Kraaifontein': 'Cape Town',
    'Kuils River': 'Cape Town',
    'Somerset West': 'Cape Town',
    'Gordon\'s Bay': 'Cape Town',
    'Milnerton': 'Cape Town',
    'Blouberg': 'Cape Town',
    'Hout Bay': 'Cape Town',
    'Fish Hoek': 'Cape Town',
    'Simon\'s Town': 'Cape Town',
    'Muizenberg': 'Cape Town',
    'Noordhoek': 'Cape Town',
    
    // KwaZulu-Natal - Durban suburbs
    'KwaMashu': 'Durban',
    'Umlazi': 'Durban',
    'Phoenix': 'Durban',
    'Chatsworth': 'Durban',
    'Pinetown': 'Durban',
    'Westville': 'Durban',
    'Umbumbulu': 'Durban',
    'Inanda': 'Durban',
    'Ntuzuma': 'Durban',
    'Clermont': 'Durban',
    'Verulam': 'Durban',
    'Tongaat': 'Durban',
    'Umhlanga': 'Durban',
    'uMhlanga': 'Durban',
    'Queensburgh': 'Durban',
    
    // Eastern Cape - Port Elizabeth suburbs
    'Mdantsane': 'East London',
    'Bisho': 'East London',
    'Gonubie': 'East London',
    
    // Free State - Bloemfontein suburbs
    'Botshabelo': 'Bloemfontein',
    'Thaba Nchu': 'Bloemfontein',
    
    // Limpopo - Polokwane suburbs
    'Seshego': 'Polokwane',
    'Lebowakgomo': 'Polokwane',
    
    // Mpumalanga - Nelspruit suburbs
    'Thulamahashe': 'Nelspruit',
    'Bushbuckridge': 'Nelspruit',
  };
  
  // Check if this suburb has a known parent city
  const parentCityName = suburbToCityMap[locationName];
  if (parentCityName) {
    // Find the parent city in the locations list
    const parentCity = allLocations.find(
      loc => loc.name === parentCityName && loc.province === province && loc.type === LocationType.CITY
    );
    return parentCity?.slug;
  }
  
  return undefined;
}

async function importLocations() {
  console.log('Starting SEO location import...');
  
  try {
    const allLocations: LocationData[] = [];
    const locationIdMap = new Map<string, string>(); // slug -> id
    
    // Step 1: Create all provinces first
    console.log('\n=== Step 1: Creating Provinces ===');
    const provinces = Object.keys(locationsData);
    
    for (const provinceName of provinces) {
      const provinceSlug = generateSlug(provinceName);
      
      try {
        // Check if province already exists
        const existing = await prisma.$queryRaw<any[]>`
          SELECT id FROM seo_locations WHERE slug = ${provinceSlug} AND type = 'PROVINCE'
        `;
        
        if (existing.length > 0) {
          locationIdMap.set(provinceSlug, existing[0].id);
          console.log(`Province already exists: ${provinceName}`);
        } else {
          const result = await prisma.$queryRaw<any[]>`
            INSERT INTO seo_locations (id, name, slug, type, province, province_slug, created_at, updated_at)
            VALUES (gen_random_uuid(), ${provinceName}, ${provinceSlug}, 'PROVINCE', ${provinceName}, ${provinceSlug}, NOW(), NOW())
            RETURNING id
          `;
          locationIdMap.set(provinceSlug, result[0].id);
          console.log(`Created province: ${provinceName}`);
        }
        
        allLocations.push({
          name: provinceName,
          slug: provinceSlug,
          type: LocationType.PROVINCE,
          province: provinceName,
          provinceSlug: provinceSlug,
        });
      } catch (error) {
        console.error(`Error creating province "${provinceName}":`, error);
      }
    }
    
    console.log(`\nProvinces created: ${locationIdMap.size}`);
    
    // Step 2: Parse all cities, towns, and suburbs
    console.log('\n=== Step 2: Parsing Cities, Towns, and Suburbs ===');
    const citiesAndTowns: LocationData[] = [];
    
    for (const [provinceName, locations] of Object.entries(locationsData)) {
      const provinceSlug = generateSlug(provinceName);
      
      for (const locationName of locations) {
        const locationType = determineLocationType(locationName, provinceName);
        const locationSlug = generateSlug(locationName);
        
        citiesAndTowns.push({
          name: locationName,
          slug: locationSlug,
          type: locationType,
          province: provinceName,
          provinceSlug: provinceSlug,
        });
        
        allLocations.push({
          name: locationName,
          slug: locationSlug,
          type: locationType,
          province: provinceName,
          provinceSlug: provinceSlug,
        });
      }
    }
    
    console.log(`Total locations parsed: ${citiesAndTowns.length}`);
    
    // Step 3: Create cities and towns first (no parent dependencies)
    console.log('\n=== Step 3: Creating Cities and Towns ===');
    let citiesCreated = 0;
    let townsCreated = 0;
    let citiesUpdated = 0;
    let townsUpdated = 0;
    
    for (const location of citiesAndTowns) {
      if (location.type === LocationType.CITY || location.type === LocationType.TOWN) {
        try {
          // Check if location already exists
          const existing = await prisma.$queryRaw<any[]>`
            SELECT id FROM seo_locations 
            WHERE slug = ${location.slug} AND province_slug = ${location.provinceSlug}
          `;
          
          if (existing.length > 0) {
            // Update existing location
            await prisma.$queryRaw`
              UPDATE seo_locations 
              SET name = ${location.name}, 
                  type = ${location.type}, 
                  province = ${location.province},
                  updated_at = NOW()
              WHERE id = ${existing[0].id}
            `;
            locationIdMap.set(`${location.provinceSlug}:${location.slug}`, existing[0].id);
            
            if (location.type === LocationType.CITY) {
              citiesUpdated++;
            } else {
              townsUpdated++;
            }
          } else {
            // Create new location
            const result = await prisma.$queryRaw<any[]>`
              INSERT INTO seo_locations (
                id, name, slug, type, province, province_slug, created_at, updated_at
              )
              VALUES (
                gen_random_uuid(), ${location.name}, ${location.slug}, ${location.type},
                ${location.province}, ${location.provinceSlug}, NOW(), NOW()
              )
              RETURNING id
            `;
            locationIdMap.set(`${location.provinceSlug}:${location.slug}`, result[0].id);
            
            if (location.type === LocationType.CITY) {
              citiesCreated++;
            } else {
              townsCreated++;
            }
          }
          
          if ((citiesCreated + townsCreated + citiesUpdated + townsUpdated) % 50 === 0) {
            console.log(`Progress: ${citiesCreated + townsCreated + citiesUpdated + townsUpdated} locations processed`);
          }
        } catch (error) {
          console.error(`Error creating location "${location.name}":`, error);
        }
      }
    }
    
    console.log(`\nCities created: ${citiesCreated}, updated: ${citiesUpdated}`);
    console.log(`Towns created: ${townsCreated}, updated: ${townsUpdated}`);
    
    // Step 4: Create suburbs with parent relationships
    console.log('\n=== Step 4: Creating Suburbs with Parent Relationships ===');
    let suburbsCreated = 0;
    let suburbsUpdated = 0;
    let suburbsWithParent = 0;
    
    for (const location of citiesAndTowns) {
      if (location.type === LocationType.SUBURB) {
        try {
          // Find parent city
          const parentCitySlug = findParentCity(location.name, location.province, allLocations);
          let parentLocationId: string | undefined = undefined;
          
          if (parentCitySlug) {
            parentLocationId = locationIdMap.get(`${location.provinceSlug}:${parentCitySlug}`);
            if (parentLocationId) {
              suburbsWithParent++;
            }
          }
          
          // Check if suburb already exists
          const existing = await prisma.$queryRaw<any[]>`
            SELECT id FROM seo_locations 
            WHERE slug = ${location.slug} AND province_slug = ${location.provinceSlug}
          `;
          
          if (existing.length > 0) {
            // Update existing suburb
            if (parentLocationId) {
              await prisma.$queryRaw`
                UPDATE seo_locations 
                SET name = ${location.name}, 
                    type = ${location.type}, 
                    province = ${location.province},
                    parent_location_id = ${parentLocationId},
                    updated_at = NOW()
                WHERE id = ${existing[0].id}
              `;
            } else {
              await prisma.$queryRaw`
                UPDATE seo_locations 
                SET name = ${location.name}, 
                    type = ${location.type}, 
                    province = ${location.province},
                    updated_at = NOW()
                WHERE id = ${existing[0].id}
              `;
            }
            suburbsUpdated++;
          } else {
            // Create new suburb
            if (parentLocationId) {
              await prisma.$queryRaw`
                INSERT INTO seo_locations (
                  id, name, slug, type, province, province_slug, parent_location_id, created_at, updated_at
                )
                VALUES (
                  gen_random_uuid(), ${location.name}, ${location.slug}, ${location.type},
                  ${location.province}, ${location.provinceSlug}, ${parentLocationId}, NOW(), NOW()
                )
              `;
            } else {
              await prisma.$queryRaw`
                INSERT INTO seo_locations (
                  id, name, slug, type, province, province_slug, created_at, updated_at
                )
                VALUES (
                  gen_random_uuid(), ${location.name}, ${location.slug}, ${location.type},
                  ${location.province}, ${location.provinceSlug}, NOW(), NOW()
                )
              `;
            }
            suburbsCreated++;
          }
          
          if ((suburbsCreated + suburbsUpdated) % 50 === 0) {
            console.log(`Progress: ${suburbsCreated + suburbsUpdated} suburbs processed`);
          }
        } catch (error) {
          console.error(`Error creating suburb "${location.name}":`, error);
        }
      }
    }
    
    console.log(`\nSuburbs created: ${suburbsCreated}, updated: ${suburbsUpdated}`);
    console.log(`Suburbs with parent relationships: ${suburbsWithParent}`);
    
    // Step 5: Verify import
    console.log('\n=== Import Summary ===');
    
    const totalCount = await prisma.$queryRaw<any[]>`
      SELECT COUNT(*) as count FROM seo_locations
    `;
    console.log(`Total locations in database: ${totalCount[0].count}`);
    
    const provinceCount = await prisma.$queryRaw<any[]>`
      SELECT COUNT(*) as count FROM seo_locations WHERE type = 'PROVINCE'
    `;
    console.log(`Provinces: ${provinceCount[0].count}`);
    
    const cityCount = await prisma.$queryRaw<any[]>`
      SELECT COUNT(*) as count FROM seo_locations WHERE type = 'CITY'
    `;
    console.log(`Cities: ${cityCount[0].count}`);
    
    const townCount = await prisma.$queryRaw<any[]>`
      SELECT COUNT(*) as count FROM seo_locations WHERE type = 'TOWN'
    `;
    console.log(`Towns: ${townCount[0].count}`);
    
    const suburbCount = await prisma.$queryRaw<any[]>`
      SELECT COUNT(*) as count FROM seo_locations WHERE type = 'SUBURB'
    `;
    console.log(`Suburbs: ${suburbCount[0].count}`);
    
    const withParentCount = await prisma.$queryRaw<any[]>`
      SELECT COUNT(*) as count FROM seo_locations WHERE parent_location_id IS NOT NULL
    `;
    console.log(`Locations with parent relationships: ${withParentCount[0].count}`);
    
    // Show sample locations by province
    console.log('\n=== Sample Locations by Province ===');
    for (const provinceName of provinces.slice(0, 3)) {
      const provinceSlug = generateSlug(provinceName);
      const sampleLocations = await prisma.$queryRaw<any[]>`
        SELECT name, type FROM seo_locations 
        WHERE province_slug = ${provinceSlug} AND type != 'PROVINCE'
        LIMIT 5
      `;
      console.log(`\n${provinceName}:`);
      sampleLocations.forEach(loc => {
        console.log(`  - ${loc.name} (${loc.type})`);
      });
    }
    
  } catch (error) {
    console.error('Error during import:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the import
importLocations()
  .then(() => {
    console.log('\n✅ Location import completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Location import failed:', error);
    process.exit(1);
  });
