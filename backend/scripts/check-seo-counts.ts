import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkCounts() {
  try {
    const keywordCount = await prisma.seoKeyword.count();
    const locationCount = await prisma.seoLocation.count();
    
    console.log('=== SEO Database Status ===');
    console.log(`Keywords: ${keywordCount}`);
    console.log(`Locations: ${locationCount}`);
    
    if (keywordCount === 0 || locationCount === 0) {
      console.log('\n⚠️  SEO data is missing! Run these commands:');
      console.log('npx ts-node scripts/import-seo-keywords.ts');
      console.log('npx ts-node scripts/import-seo-locations.ts');
    } else {
      console.log('\n✅ SEO data is populated!');
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkCounts();
