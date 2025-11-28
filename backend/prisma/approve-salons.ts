import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Starting approval process...');

    // 1. Approve Salons
    const salonResult = await prisma.salon.updateMany({
        where: {
            approvalStatus: 'PENDING',
        },
        data: {
            approvalStatus: 'APPROVED',
            isVerified: true, // Also mark as verified
        },
    });
    console.log(`Approved ${salonResult.count} salons.`);

    // 2. Approve Services
    const serviceResult = await prisma.service.updateMany({
        where: {
            approvalStatus: 'PENDING',
        },
        data: {
            approvalStatus: 'APPROVED',
        },
    });
    console.log(`Approved ${serviceResult.count} services.`);

    console.log('Approval process finished.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
