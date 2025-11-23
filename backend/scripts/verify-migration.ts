import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function verifyCounts() {
    console.log('🚀 Verifying record counts in Supabase...\n');

    try {
        await prisma.$connect();

        const counts: Record<string, number> = {};

        // Count all models
        counts.users = await prisma.user.count();
        counts.salons = await prisma.salon.count();
        counts.seoKeywords = await prisma.seoKeyword.count();
        counts.seoLocations = await prisma.seoLocation.count();
        counts.seoPageCaches = await prisma.seoPageCache.count();
        counts.services = await prisma.service.count();
        counts.bookings = await prisma.booking.count();
        counts.reviews = await prisma.review.count();

        console.log('📊 Current Database Counts:');
        console.log('---------------------------');
        Object.entries(counts).forEach(([model, count]) => {
            console.log(`${model.padEnd(20)}: ${count}`);
        });

        console.log('\n✅ Verification complete.');

    } catch (e: any) {
        console.error('❌ Verification failed:', e.message);
    } finally {
        await prisma.$disconnect();
    }
}

verifyCounts();
