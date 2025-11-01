// Script to backfill coordinates for salons missing location data
// Uses OpenStreetMap Nominatim API (free, rate-limited to 1 req/sec)
// Run with: node scripts/backfill-salon-coordinates.js

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Rate limiting: Nominatim requires max 1 request per second
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function geocodeAddress(address, city, province) {
  const fullAddress = `${address}, ${city}, ${province}, South Africa`;
  const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(fullAddress)}&format=json&limit=1`;
  
  try {
    const response = await fetch(url, {
      headers: { 'User-Agent': 'HairProsDirectory-Backfill' }
    });
    const data = await response.json();
    
    if (data && data.length > 0 && data[0].lat && data[0].lon) {
      return {
        latitude: parseFloat(data[0].lat),
        longitude: parseFloat(data[0].lon),
        display_name: data[0].display_name
      };
    }
    return null;
  } catch (error) {
    console.error(`   Error geocoding: ${error.message}`);
    return null;
  }
}

async function backfillCoordinates(dryRun = true) {
  try {
    console.log('🔄 Backfilling salon coordinates...');
    console.log(`Mode: ${dryRun ? 'DRY RUN (no changes will be saved)' : 'LIVE (changes will be saved)'}\n`);

    // Get salons without coordinates
    const salons = await prisma.salon.findMany({
      where: {
        status: 'APPROVED',
        OR: [
          { latitude: null },
          { longitude: null }
        ]
      },
      select: {
        id: true,
        name: true,
        address: true,
        city: true,
        province: true
      }
    });

    console.log(`Found ${salons.length} salons without coordinates\n`);

    if (salons.length === 0) {
      console.log('✅ All approved salons already have coordinates!');
      return;
    }

    let successCount = 0;
    let failureCount = 0;

    for (let i = 0; i < salons.length; i++) {
      const salon = salons[i];
      console.log(`[${i + 1}/${salons.length}] Processing: ${salon.name}`);

      if (!salon.address || !salon.city || !salon.province) {
        console.log(`   ⚠️  Skipping - missing address information`);
        failureCount++;
        await delay(1000); // Respect rate limit even on skip
        continue;
      }

      const coords = await geocodeAddress(salon.address, salon.city, salon.province);

      if (coords) {
        console.log(`   ✓ Found coordinates: ${coords.latitude}, ${coords.longitude}`);
        console.log(`   Location: ${coords.display_name}`);

        if (!dryRun) {
          await prisma.salon.update({
            where: { id: salon.id },
            data: {
              latitude: coords.latitude,
              longitude: coords.longitude
            }
          });
          console.log(`   💾 Saved to database`);
        } else {
          console.log(`   [DRY RUN] Would save coordinates`);
        }
        successCount++;
      } else {
        console.log(`   ❌ Could not geocode address`);
        failureCount++;
      }

      console.log('');

      // Rate limiting: wait 1 second between requests
      if (i < salons.length - 1) {
        await delay(1000);
      }
    }

    console.log('\n📊 Summary:');
    console.log(`   ✅ Successfully geocoded: ${successCount}`);
    console.log(`   ❌ Failed to geocode: ${failureCount}`);
    console.log(`   📈 Success rate: ${((successCount / salons.length) * 100).toFixed(2)}%`);

    if (dryRun) {
      console.log('\n💡 To apply these changes, run:');
      console.log('   node scripts/backfill-salon-coordinates.js --live');
    } else {
      console.log('\n✅ Backfill complete! Coordinates have been saved to the database.');
    }

  } catch (error) {
    console.error('❌ Error during backfill:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Check if --live flag is passed
const isLive = process.argv.includes('--live');
backfillCoordinates(!isLive);
