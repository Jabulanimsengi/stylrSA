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
    .replace(/\s*\([^)]*\)/g, '')
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
}

function determineLocationType(locationName: string): LocationType {
  const majorCities = ['Johannesburg', 'Pretoria', 'Tshwane'];
  
  const knownSuburbs = [
    'Alexandra', 'Soweto', 'Sandton', 'Randburg', 'Roodepoort', 'Benoni', 'Boksburg',
    'Kempton Park', 'Germiston', 'Alberton', 'Edenvale', 'Bedfordview',
    'Katlehong', 'Tembisa', 'Vosloorus', 'Tokoza', 'Tsakane', 'Duduza', 'KwaThema',
    'Diepsloot', 'Orange Farm', 'Ennerdale', 'Lenz', 'Lenasia',
    'Mamelodi', 'Atteridgeville', 'Soshanguve', 'Ga-Rankuwa', 'Mabopane',
    'Centurion', 'Irene', 'Bronkhorstspruit', 'Midrand', 'Fourways',
    'Rosebank', 'Bryanston', 'Sunninghill', 'Rivonia', 'Woodmead',
    'Melville', 'Parkhurst', 'Greenside', 'Norwood', 'Rosebank',
    'Yeoville', 'Berea', 'Hillbrow', 'Braamfontein', 'Newtown',
    'Sophiatown', 'Westdene', 'Northcliff', 'Florida', 'Roodepoort West',
    'Krugersdorp', 'Randfontein', 'Westonaria', 'Carletonville',
    'Springs', 'Brakpan', 'Nigel', 'Heidelberg', 'Vereeniging',
    'Vanderbijlpark', 'Sasolburg', 'Sebokeng', 'Evaton', 'Sharpeville',
    'Meyerton', 'Walkerville', 'De Deur', 'Vaal Marina',
    'Ekangala', 'Cullinan', 'Rayton', 'Refilwe', 'Zithobeni',
    'Hammanskraal', 'Temba', 'Winterveld', 'Mabopane', 'Soshanguve',
    'Atteridgeville', 'Laudium', 'Mamelodi', 'Eersterust', 'Silverton',
    'Menlyn', 'Hatfield', 'Brooklyn', 'Arcadia', 'Sunnyside',
    'Pretoria West', 'Pretoria North', 'Pretoria East', 'Pretoria Central',
    'Akasia', 'Montana', 'Sinoville', 'Annlin', 'Wonderboom',
    'Rosslyn', 'Ga-Rankuwa', 'Mabopane', 'Soshanguve', 'Winterveld'
  ];
  
  if (majorCities.some(city => locationName.includes(city) || city.includes(locationName))) {
    return LocationType.CITY;
  }
  
  if (knownSuburbs.some(suburb => locationName.includes(suburb) || suburb.includes(locationName))) {
    return LocationType.SUBURB;
  }
  
  if (locationName.includes('Township') || locationName.startsWith('Kwa') || 
      locationName.startsWith('Ga-') || locationName.includes('Location')) {
    return LocationType.SUBURB;
  }
  
  return LocationType.TOWN;
}

function findParentCity(locationName: string, allLocations: LocationData[]): string | undefined {
  const suburbToCityMap: { [key: string]: string } = {
    // Johannesburg suburbs
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
    'Midrand': 'Johannesburg',
    'Fourways': 'Johannesburg',
    'Rosebank': 'Johannesburg',
    'Bryanston': 'Johannesburg',
    'Sunninghill': 'Johannesburg',
    'Rivonia': 'Johannesburg',
    'Woodmead': 'Johannesburg',
    'Melville': 'Johannesburg',
    'Parkhurst': 'Johannesburg',
    'Greenside': 'Johannesburg',
    'Norwood': 'Johannesburg',
    'Yeoville': 'Johannesburg',
    'Berea': 'Johannesburg',
    'Hillbrow': 'Johannesburg',
    'Braamfontein': 'Johannesburg',
    'Newtown': 'Johannesburg',
    'Sophiatown': 'Johannesburg',
    'Westdene': 'Johannesburg',
    'Northcliff': 'Johannesburg',
    'Florida': 'Johannesburg',
    
    // East Rand suburbs
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
    'Springs': 'Johannesburg',
    'Brakpan': 'Johannesburg',
    'Nigel': 'Johannesburg',
    
    // Pretoria/Tshwane suburbs
    'Mamelodi': 'Pretoria',
    'Atteridgeville': 'Pretoria',
    'Soshanguve': 'Pretoria',
    'Ga-Rankuwa': 'Pretoria',
    'Mabopane': 'Pretoria',
    'Centurion': 'Pretoria',
    'Irene': 'Pretoria',
    'Ekangala': 'Pretoria',
    'Cullinan': 'Pretoria',
    'Rayton': 'Pretoria',
    'Refilwe': 'Pretoria',
    'Zithobeni': 'Pretoria',
    'Hammanskraal': 'Pretoria',
    'Temba': 'Pretoria',
    'Winterveld': 'Pretoria',
    'Laudium': 'Pretoria',
    'Eersterust': 'Pretoria',
    'Silverton': 'Pretoria',
    'Menlyn': 'Pretoria',
    'Hatfield': 'Pretoria',
    'Brooklyn': 'Pretoria',
    'Arcadia': 'Pretoria',
    'Sunnyside': 'Pretoria',
    'Pretoria West': 'Pretoria',
    'Pretoria North': 'Pretoria',
    'Pretoria East': 'Pretoria',
    'Pretoria Central': 'Pretoria',
    'Akasia': 'Pretoria',
    'Montana': 'Pretoria',
    'Sinoville': 'Pretoria',
    'Annlin': 'Pretoria',
    'Wonderboom': 'Pretoria',
    'Rosslyn': 'Pretoria',
  };
  
  const parentCityName = suburbToCityMap[locationName];
  if (parentCityName) {
    const parentCity = allLocations.find(
      loc => loc.name === parentCityName && loc.type === LocationType.CITY
    );
    return parentCity?.slug;
  }
  
  return undefined;
}

async function importGautengLocations() {
  console.log('Starting Gauteng-only SEO location import...');
  console.log('🎯 Focus: Gauteng Province - Economic Hub Strategy\n');
  
  try {
    const allLocations: LocationData[] = [];
    const locationIdMap = new Map<string, string>();
    
    // Step 1: Create Gauteng province
    console.log('=== Step 1: Creating Gauteng Province ===');
    const provinceName = 'Gauteng';
    const provinceSlug = generateSlug(provinceName);
    
    const existing = await prisma.$queryRaw<any[]>`
      SELECT id FROM seo_locations WHERE slug = ${provinceSlug} AND type = 'PROVINCE'
    `;
    
    if (existing.length > 0) {
      locationIdMap.set(provinceSlug, existing[0].id);
      console.log(`✓ Province already exists: ${provinceName}`);
    } else {
      const result = await prisma.$queryRaw<any[]>`
        INSERT INTO seo_locations (id, name, slug, type, province, province_slug, created_at, updated_at)
        VALUES (gen_random_uuid(), ${provinceName}, ${provinceSlug}, 'PROVINCE', ${provinceName}, ${provinceSlug}, NOW(), NOW())
        RETURNING id
      `;
      locationIdMap.set(provinceSlug, result[0].id);
      console.log(`✓ Created province: ${provinceName}`);
    }
    
    allLocations.push({
      name: provinceName,
      slug: provinceSlug,
      type: LocationType.PROVINCE,
      province: provinceName,
      provinceSlug: provinceSlug,
    });
    
    // Step 2: Parse Gauteng locations only
    console.log('\n=== Step 2: Parsing Gauteng Locations ===');
    const gautengLocations = locationsData['Gauteng'] || [];
    console.log(`Found ${gautengLocations.length} locations in Gauteng`);
    
    const citiesAndTowns: LocationData[] = [];
    
    for (const locationName of gautengLocations) {
      const locationType = determineLocationType(locationName);
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
    
    // Step 3: Create cities and towns
    console.log('\n=== Step 3: Creating Cities and Towns ===');
    let citiesCreated = 0;
    let townsCreated = 0;
    
    for (const location of citiesAndTowns) {
      if (location.type === LocationType.CITY || location.type === LocationType.TOWN) {
        try {
          const existing = await prisma.$queryRaw<any[]>`
            SELECT id FROM seo_locations 
            WHERE slug = ${location.slug} AND province_slug = ${location.provinceSlug}
          `;
          
          if (existing.length === 0) {
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
              console.log(`✓ Created city: ${location.name}`);
            } else {
              townsCreated++;
            }
          } else {
            locationIdMap.set(`${location.provinceSlug}:${location.slug}`, existing[0].id);
          }
        } catch (error) {
          console.error(`Error creating location "${location.name}":`, error);
        }
      }
    }
    
    console.log(`\n✓ Cities created: ${citiesCreated}`);
    console.log(`✓ Towns created: ${townsCreated}`);
    
    // Step 4: Create suburbs with parent relationships
    console.log('\n=== Step 4: Creating Suburbs and Townships ===');
    let suburbsCreated = 0;
    let suburbsWithParent = 0;
    
    for (const location of citiesAndTowns) {
      if (location.type === LocationType.SUBURB) {
        try {
          const parentCitySlug = findParentCity(location.name, allLocations);
          let parentLocationId: string | undefined = undefined;
          
          if (parentCitySlug) {
            parentLocationId = locationIdMap.get(`${location.provinceSlug}:${parentCitySlug}`);
            if (parentLocationId) {
              suburbsWithParent++;
            }
          }
          
          const existing = await prisma.$queryRaw<any[]>`
            SELECT id FROM seo_locations 
            WHERE slug = ${location.slug} AND province_slug = ${location.provinceSlug}
          `;
          
          if (existing.length === 0) {
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
            
            if (suburbsCreated % 20 === 0) {
              console.log(`Progress: ${suburbsCreated} suburbs created...`);
            }
          }
        } catch (error) {
          console.error(`Error creating suburb "${location.name}":`, error);
        }
      }
    }
    
    console.log(`\n✓ Suburbs/Townships created: ${suburbsCreated}`);
    console.log(`✓ Suburbs with parent city links: ${suburbsWithParent}`);
    
    // Step 5: Summary
    console.log('\n=== Import Summary ===');
    
    const totalCount = await prisma.$queryRaw<any[]>`
      SELECT COUNT(*) as count FROM seo_locations WHERE province_slug = ${provinceSlug}
    `;
    console.log(`Total Gauteng locations: ${totalCount[0].count}`);
    
    const cityCount = await prisma.$queryRaw<any[]>`
      SELECT COUNT(*) as count FROM seo_locations WHERE type = 'CITY' AND province_slug = ${provinceSlug}
    `;
    console.log(`Cities: ${cityCount[0].count}`);
    
    const townCount = await prisma.$queryRaw<any[]>`
      SELECT COUNT(*) as count FROM seo_locations WHERE type = 'TOWN' AND province_slug = ${provinceSlug}
    `;
    console.log(`Towns: ${townCount[0].count}`);
    
    const suburbCount = await prisma.$queryRaw<any[]>`
      SELECT COUNT(*) as count FROM seo_locations WHERE type = 'SUBURB' AND province_slug = ${provinceSlug}
    `;
    console.log(`Suburbs/Townships: ${suburbCount[0].count}`);
    
    console.log('\n=== Sample Gauteng Locations ===');
    const sampleCities = await prisma.$queryRaw<any[]>`
      SELECT name FROM seo_locations 
      WHERE province_slug = ${provinceSlug} AND type = 'CITY'
      LIMIT 5
    `;
    console.log('\nMajor Cities:');
    sampleCities.forEach(loc => console.log(`  - ${loc.name}`));
    
    const sampleSuburbs = await prisma.$queryRaw<any[]>`
      SELECT name FROM seo_locations 
      WHERE province_slug = ${provinceSlug} AND type = 'SUBURB'
      LIMIT 10
    `;
    console.log('\nSample Suburbs/Townships:');
    sampleSuburbs.forEach(loc => console.log(`  - ${loc.name}`));
    
  } catch (error) {
    console.error('Error during import:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

importGautengLocations()
  .then(() => {
    console.log('\n✅ Gauteng location import completed successfully!');
    console.log('🚀 Ready for pragmatic SEO focused on Gauteng market');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Gauteng location import failed:', error);
    process.exit(1);
  });
