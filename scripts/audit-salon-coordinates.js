// Script to audit salon coordinates and identify salons without location data
// Run with: node scripts/audit-salon-coordinates.js

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function auditCoordinates() {
  try {
    console.log('🔍 Auditing salon coordinates...\n');

    // Get total salons
    const totalSalons = await prisma.salon.count();
    console.log(`📊 Total Salons: ${totalSalons}`);

    // Get approved salons
    const approvedSalons = await prisma.salon.count({
      where: { status: 'APPROVED' }
    });
    console.log(`✅ Approved Salons: ${approvedSalons}`);

    // Get salons with both coordinates
    const salonsWithCoordinates = await prisma.salon.count({
      where: {
        AND: [
          { latitude: { not: null } },
          { longitude: { not: null } }
        ]
      }
    });
    console.log(`📍 Salons with Coordinates: ${salonsWithCoordinates}`);

    // Get salons without coordinates
    const salonsWithoutCoordinates = await prisma.salon.count({
      where: {
        OR: [
          { latitude: null },
          { longitude: null }
        ]
      }
    });
    console.log(`❌ Salons without Coordinates: ${salonsWithoutCoordinates}`);

    // Get approved salons without coordinates (most critical)
    const approvedWithoutCoordinates = await prisma.salon.count({
      where: {
        status: 'APPROVED',
        OR: [
          { latitude: null },
          { longitude: null }
        ]
      }
    });
    console.log(`🔴 CRITICAL - Approved Salons without Coordinates: ${approvedWithoutCoordinates}`);

    // Calculate percentages
    const percentWithCoordinates = totalSalons > 0 
      ? ((salonsWithCoordinates / totalSalons) * 100).toFixed(2)
      : 0;
    const percentApprovedWithoutCoords = approvedSalons > 0
      ? ((approvedWithoutCoordinates / approvedSalons) * 100).toFixed(2)
      : 0;

    console.log(`\n📈 Statistics:`);
    console.log(`   - ${percentWithCoordinates}% of all salons have coordinates`);
    console.log(`   - ${percentApprovedWithoutCoords}% of approved salons lack coordinates\n`);

    // Get details of approved salons without coordinates
    if (approvedWithoutCoordinates > 0) {
      console.log('📋 Approved Salons Missing Coordinates:\n');
      const salonsList = await prisma.salon.findMany({
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
          province: true,
          latitude: true,
          longitude: true
        },
        take: 20 // Show first 20
      });

      salonsList.forEach((salon, index) => {
        console.log(`${index + 1}. ${salon.name}`);
        console.log(`   ID: ${salon.id}`);
        console.log(`   Address: ${salon.address || 'N/A'}, ${salon.city}, ${salon.province}`);
        console.log(`   Coordinates: lat=${salon.latitude || 'NULL'}, lon=${salon.longitude || 'NULL'}`);
        console.log('');
      });

      if (approvedWithoutCoordinates > 20) {
        console.log(`... and ${approvedWithoutCoordinates - 20} more\n`);
      }
    }

    // Recommendations
    console.log('💡 Recommendations:');
    if (approvedWithoutCoordinates > 0) {
      console.log('   1. Run backfill script to geocode existing salons');
      console.log('   2. Contact salon owners to update their locations');
      console.log('   3. Consider making coordinates required in the schema');
    } else {
      console.log('   ✅ All approved salons have coordinates! Great job!');
    }

    // Check for invalid coordinates (outside South Africa bounds)
    const invalidCoordinates = await prisma.salon.count({
      where: {
        status: 'APPROVED',
        OR: [
          { latitude: { lt: -35 } },  // South of South Africa
          { latitude: { gt: -22 } },  // North of South Africa
          { longitude: { lt: 16 } },  // West of South Africa
          { longitude: { gt: 33 } }   // East of South Africa
        ]
      }
    });

    if (invalidCoordinates > 0) {
      console.log(`\n⚠️  Warning: ${invalidCoordinates} salons have coordinates outside South Africa bounds`);
      console.log('   These may need manual review.');
    }

  } catch (error) {
    console.error('❌ Error auditing coordinates:', error);
  } finally {
    await prisma.$disconnect();
  }
}

auditCoordinates();
