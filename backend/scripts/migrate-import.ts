import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

async function importData() {
    console.log('🚀 Starting database import to Supabase...\n');

    const inputPath = path.join(__dirname, '..', 'migration-data.json');

    if (!fs.existsSync(inputPath)) {
        console.error('❌ Migration data file not found!');
        process.exit(1);
    }

    console.log('📖 Reading data file...');
    const rawData = fs.readFileSync(inputPath, 'utf-8');
    const data = JSON.parse(rawData);
    console.log(`✅ Loaded data (${(rawData.length / 1024 / 1024).toFixed(2)} MB)\n`);

    try {
        await prisma.$connect();
        console.log('✅ Connected to Supabase database\n');

        const importModel = async (name: string, records: any[], model: any) => {
            if (!records || records.length === 0) {
                console.log(`⏭️  Skipping ${name} (no records)`);
                return;
            }

            console.log(`📥 Importing ${name} (${records.length} records)...`);
            try {
                // Use createMany for bulk insert (much faster)
                await model.createMany({
                    data: records,
                    skipDuplicates: true,
                });
                console.log(`   ✓ Imported ${records.length} records\n`);
            } catch (e: any) {
                console.error(`   ✗ Failed: ${e.message}\n`);
                // Log first few failed records for debugging
                if (e.message.includes('Unique constraint')) {
                    console.log('   Some records may already exist, continuing...\n');
                }
            }
        };

        // Import in dependency order
        console.log('📦 PHASE 1: Base models\n');
        await importModel('users', data.users, prisma.user);
        await importModel('plans', data.plans, prisma.plan);
        await importModel('serviceCategories', data.serviceCategories, prisma.serviceCategory);
        await importModel('seoKeywords', data.seoKeywords, prisma.seoKeyword);
        await importModel('seoLocations', data.seoLocations, prisma.seoLocation);
        await importModel('trends', data.trends, prisma.trend);

        console.log('\n📦 PHASE 2: User-dependent models\n');
        await importModel('salons', data.salons, prisma.salon);
        await importModel('products', data.products, prisma.product);
        await importModel('blogs', data.blogs, prisma.blog);
        await importModel('oauthAccounts', data.oauthAccounts, prisma.oAuthAccount);

        console.log('\n📦 PHASE 3: Salon-dependent models\n');
        await importModel('services', data.services, prisma.service);
        await importModel('galleryImages', data.galleryImages, prisma.galleryImage);
        await importModel('beforeAfterPhotos', data.beforeAfterPhotos, prisma.beforeAfterPhoto);
        await importModel('serviceVideos', data.serviceVideos, prisma.serviceVideo);
        await importModel('salonViews', data.salonViews, prisma.salonView);
        await importModel('salonTrendzProfiles', data.salonTrendzProfiles, prisma.salonTrendzProfile);
        await importModel('serviceProviderAvailabilities', data.serviceProviderAvailabilities, prisma.serviceProviderAvailability);

        console.log('\n📦 PHASE 4: Interaction models\n');
        await importModel('favorites', data.favorites, prisma.favorite);
        await importModel('bookings', data.bookings, prisma.booking);
        // await importModel('conversations', data.conversations, prisma.conversation); // Model removed
        await importModel('notifications', data.notifications, prisma.notification);
        await importModel('serviceLikes', data.serviceLikes, prisma.serviceLike);
        await importModel('promotions', data.promotions, prisma.promotion);

        console.log('\n📦 PHASE 5: Deeply nested models\n');
        await importModel('reviews', data.reviews, prisma.review);
        // await importModel('messages', data.messages, prisma.message); // Model removed
        await importModel('productOrders', data.productOrders, prisma.productOrder);
        await importModel('trendLikes', data.trendLikes, prisma.trendLike);
        await importModel('trendViews', data.trendViews, prisma.trendView);

        console.log('\n📦 PHASE 6: System data\n');
        await importModel('deletedSalonArchives', data.deletedSalonArchives, prisma.deletedSalonArchive);
        await importModel('deletedSellerArchives', data.deletedSellerArchives, prisma.deletedSellerArchive);
        await importModel('adminActionLogs', data.adminActionLogs, prisma.adminActionLog);
        await importModel('seoPageCaches', data.seoPageCaches, prisma.seoPageCache);

        console.log('\n✅ Import complete!\n');

    } catch (e: any) {
        console.error('❌ Import failed:', e.message);
        throw e;
    }
}

importData()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
