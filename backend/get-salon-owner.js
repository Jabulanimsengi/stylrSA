const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  // Get a salon owner with their salon
  const owner = await prisma.user.findFirst({
    where: { role: 'SALON_OWNER' },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      role: true,
    },
  });

  if (owner) {
    console.log('Found salon owner:');
    console.log(JSON.stringify(owner, null, 2));
    console.log('\nNote: You may need to know their password or register a new one.');
  } else {
    console.log('No salon owners found. Creating test user...');
  }

  await prisma.$disconnect();
}

main().catch(console.error);
