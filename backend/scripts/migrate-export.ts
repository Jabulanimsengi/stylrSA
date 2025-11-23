import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

async function exportData() {
  console.log('🚀 Starting database export from Railway...\n');

  const data: any = {};

  try {
    // Test connection
    await prisma.$connect();
    console.log('✅ Connected to database\n');

    // Export each model with progress
    const exportModel = async (name: string, model: any) => {
      try {
        console.log(`📦 Exporting ${name}...`);
        const records = await model.findMany();
        data[name] = records;
        console.log(`   ✓ ${records.length} records\n`);
      } catch (e: any) {
        console.error(`   ✗ Failed to export ${name}: ${e.message}\n`);
        data[name] = [];
      }
    };

    // Base/independent models first
    await exportModel('users', prisma.user);
    await exportModel('plans', prisma.plan);
    await exportModel('serviceCategories', prisma.serviceCategory);
    await exportModel('seoKeywords', prisma.seoKeyword);
    await exportModel('seoLocations', prisma.seoLocation);
    await exportModel('trends', prisma.trend);

    // Dependent on users
    await exportModel('salons', prisma.salon);
    await exportModel('products', prisma.product);
    await exportModel('blogs', prisma.blog);
    await exportModel('oauthAccounts', prisma.oAuthAccount);

    // Dependent on salons
    await exportModel('services', prisma.service);
    await exportModel('galleryImages', prisma.galleryImage);
    await exportModel('beforeAfterPhotos', prisma.beforeAfterPhoto);
    await exportModel('serviceVideos', prisma.serviceVideo);
    await exportModel('salonViews', prisma.salonView);
    await exportModel('salonTrendzProfiles', prisma.salonTrendzProfile);
    await exportModel('serviceProviderAvailabilities', prisma.serviceProviderAvailability);

    // Dependent on users + salons
    await exportModel('favorites', prisma.favorite);
    await exportModel('bookings', prisma.booking);
    await exportModel('conversations', prisma.conversation);
    await exportModel('notifications', prisma.notification);

    // Dependent on services
    await exportModel('serviceLikes', prisma.serviceLike);
    await exportModel('promotions', prisma.promotion);

    // Dependent on bookings
    await exportModel('reviews', prisma.review);

    // Dependent on conversations
    await exportModel('messages', prisma.message);

    // Dependent on products
    await exportModel('productOrders', prisma.productOrder);

    // Dependent on trends
    await exportModel('trendLikes', prisma.trendLike);
    await exportModel('trendViews', prisma.trendView);

    // Archives and logs
    await exportModel('deletedSalonArchives', prisma.deletedSalonArchive);
    await exportModel('deletedSellerArchives', prisma.deletedSellerArchive);
    await exportModel('adminActionLogs', prisma.adminActionLog);

    // SEO cache
    await exportModel('seoPageCaches', prisma.seoPageCache);

    // Save to file
    const outputPath = path.join(__dirname, '..', 'migration-data.json');
    console.log(`💾 Saving to ${outputPath}...`);
    fs.writeFileSync(outputPath, JSON.stringify(data, null, 2));

    const stats = fs.statSync(outputPath);
    console.log(`\n✅ Export complete!`);
    console.log(`   File size: ${(stats.size / 1024 / 1024).toFixed(2)} MB`);
    console.log(`   Location: ${outputPath}\n`);

  } catch (e: any) {
    console.error('❌ Export failed:', e.message);
    throw e;
  }
}

exportData()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
