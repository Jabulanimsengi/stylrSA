
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Fetching categories...');
    const categories = await prisma.serviceCategory.findMany();
    console.log('Categories found:', categories.length);
    categories.forEach(cat => {
        console.log(`- "${cat.name}" (ID: ${cat.id})`);
    });
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
