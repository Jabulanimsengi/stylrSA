const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('Checking Operating Hours...\n');

  // Get all salons with their operating hours
  const salons = await prisma.salon.findMany({
    select: {
      id: true,
      name: true,
      operatingHours: true,
      operatingDays: true,
      owner: {
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
    take: 10,
  });

  console.log(`Found ${salons.length} salons:\n`);

  salons.forEach((salon, index) => {
    console.log(`${index + 1}. ${salon.name}`);
    console.log(`   Owner: ${salon.owner.firstName} ${salon.owner.lastName} (${salon.owner.email})`);
    console.log(`   Operating Hours Type: ${typeof salon.operatingHours}`);
    console.log(`   Operating Hours:`, JSON.stringify(salon.operatingHours, null, 2));
    console.log(`   Operating Days:`, salon.operatingDays);
    console.log('');
  });

  await prisma.$disconnect();
}

main()
  .catch((error) => {
    console.error('Error:', error);
    process.exit(1);
  });
