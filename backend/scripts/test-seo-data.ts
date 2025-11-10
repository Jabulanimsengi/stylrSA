import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testSEOData() {
  console.log('🔍 Testing SEO Database...\n');

  // Test Keywords
  const keywordCount = await prisma.seoKeyword.count();
  const sampleKeywords = await prisma.seoKeyword.findMany({
    take: 5,
    select: { keyword: true, category: true }
  });
  
  console.log(`✅ Keywords: ${keywordCount}`);
  console.log('Sample keywords:', sampleKeywords.map(k => k.keyword).join(', '));
  console.log('');

  // Test Locations by Province
  const provinces = await prisma.seoLocation.findMany({
    where: { type: 'PROVINCE' },
    select: { name: true, slug: true }
  });

  console.log(`✅ Provinces: ${provinces.length}`);
  console.log('Provinces:', provinces.map(p => p.name).join(', '));
  console.log('');

  // Test each province's locations
  for (const province of provinces) {
    const cities = await prisma.seoLocation.count({
      where: { 
        type: 'CITY',
        provinceSlug: province.slug
      }
    });

    const towns = await prisma.seoLocation.count({
      where: { 
        type: 'TOWN',
        provinceSlug: province.slug
      }
    });

    const suburbs = await prisma.seoLocation.count({
      where: { 
        type: 'SUBURB',
        provinceSlug: province.slug
      }
    });

    console.log(`📍 ${province.name}:`);
    console.log(`   Cities: ${cities}, Towns: ${towns}, Suburbs: ${suburbs}`);
  }

  console.log('\n🎯 Testing Sample URLs:\n');

  // Test if we can generate pages for different provinces
  const testCombos = [
    { keyword: 'hair-salon', province: 'western-cape', city: 'cape-town' },
    { keyword: 'nail-salon', province: 'kwazulu-natal', city: 'durban' },
    { keyword: 'spa', province: 'gauteng', city: 'johannesburg' },
    { keyword: 'barber-shop', province: 'mpumalanga' },
    { keyword: 'makeup-artist', province: 'limpopo' },
  ];

  for (const combo of testCombos) {
    const keyword = await prisma.seoKeyword.findUnique({
      where: { keyword: combo.keyword }
    });

    const province = await prisma.seoLocation.findFirst({
      where: { slug: combo.province, type: 'PROVINCE' }
    });

    let city: any = null;
    if (combo.city) {
      city = await prisma.seoLocation.findFirst({
        where: { slug: combo.city, type: 'CITY' }
      });
    }

    const url = combo.city 
      ? `/${combo.keyword}/${combo.province}/${combo.city}`
      : `/${combo.keyword}/${combo.province}`;

    const status = keyword && province && (!combo.city || city) ? '✅' : '❌';
    console.log(`${status} ${url}`);
  }

  await prisma.$disconnect();
}

testSEOData().catch(console.error);
