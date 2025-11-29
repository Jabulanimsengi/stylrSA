
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkLocations() {
    try {
        const locations = await prisma.seoLocation.findMany({
            where: {
                slug: {
                    in: ['midrand', 'fourways']
                }
            },
            select: {
                name: true,
                slug: true
            }
        });

        console.log('Found locations:', JSON.stringify(locations, null, 2));
    } catch (error) {
        console.error('Error checking locations:', error);
    } finally {
        await prisma.$disconnect();
    }
}

checkLocations();
