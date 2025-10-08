// backend/prisma/seed.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Start seeding ...');
  
  const categories = [
    'Haircuts & Styling',
    'Hair Color & Treatments',
    'Nail Care',
    'Skin Care & Facials',
    'Massage & Body Treatments',
    'Makeup & Beauty',
    'Waxing & Hair Removal',
    'Braiding & Weaving',
    'Men\'s Grooming',
    'Bridal Services',
  ];

  for (const categoryName of categories) {
    await prisma.serviceCategory.upsert({
      where: { name: categoryName },
      update: {},
      create: {
        name: categoryName,
      },
    });
  }
  
  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });