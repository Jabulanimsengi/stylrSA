const { PrismaClient } = require('@prisma/client');

async function main() {
  const prisma = new PrismaClient();
  try {
    const user = await prisma.user.findFirst({ where: { role: 'SALON_OWNER' } });
    if (!user) {
      console.log('No SALON_OWNER user found');
      return;
    }
    const data = {
      ownerId: user.id,
      name: 'JS Test Salon',
      description: 'desc',
      address: 'addr',
      province: 'Gauteng',
      city: 'Johannesburg',
      town: 'TestTown',
      contactEmail: 't@example.com',
      phoneNumber: '+27123456789',
      heroImages: [],
      operatingDays: ['monday'],
      bookingType: 'ONSITE',
    };
    const salon = await prisma.salon.create({ data });
    console.log('Created salon', salon.id);
  } catch (e) {
    console.error('Error:', e.message, e.meta || '');
  } finally {
    await prisma.$disconnect();
  }
}

main();
