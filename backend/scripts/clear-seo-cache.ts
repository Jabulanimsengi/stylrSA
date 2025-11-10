import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL + (process.env.DATABASE_URL?.includes('sslmode') ? '' : '?sslmode=require')
    }
  }
});

async function clearSeoCache() {
  try {
    console.log('Connecting to database...');
    
    const result = await prisma.seoPageCache.deleteMany({});
    
    console.log(`✅ Successfully deleted ${result.count} SEO cache entries`);
  } catch (error) {
    console.error('❌ Error clearing SEO cache:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

clearSeoCache();
