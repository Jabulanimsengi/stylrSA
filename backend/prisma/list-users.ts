import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Fetching registered users...');

    const users = await prisma.user.findMany({
        orderBy: {
            createdAt: 'desc',
        },
        select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            role: true,
            createdAt: true,
        },
    });

    console.table(users.map(u => ({
        Email: u.email,
        Name: `${u.firstName} ${u.lastName}`,
        Role: u.role,
        Created: u.createdAt.toISOString(),
        ID: u.id
    })));

    console.log(`Total Users: ${users.length}`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
