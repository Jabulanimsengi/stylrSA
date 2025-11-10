import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔍 Checking keyword slugs...\n');

  // Get first 20 keywords with their slugs
  const keywords = await prisma.seoKeyword.findMany({
    take: 20,
    orderBy: { priority: 'asc' },
    select: {
      keyword: true,
      slug: true,
      category: true,
    },
  });

  console.log('Sample keywords and their slugs:');
  keywords.forEach((k) => {
    console.log(`  "${k.keyword}" -> slug: "${k.slug}" (${k.category})`);
  });

  // Get first 10 locations with their slugs
  console.log('\n🗺️  Sample locations and their slugs:\n');
  
  const provinces = await prisma.seoLocation.findMany({
    where: { type: 'PROVINCE' },
    select: {
      name: true,
      slug: true,
      provinceSlug: true,
    },
  });

  console.log('Provinces:');
  provinces.forEach((p) => {
    console.log(`  "${p.name}" -> slug: "${p.slug}", provinceSlug: "${p.provinceSlug}"`);
  });

  const cities = await prisma.seoLocation.findMany({
    where: { type: { in: ['CITY', 'TOWN'] } },
    take: 10,
    orderBy: { population: 'desc' },
    select: {
      name: true,
      slug: true,
      provinceSlug: true,
      type: true,
    },
  });

  console.log('\nTop Cities:');
  cities.forEach((c) => {
    console.log(`  "${c.name}" -> slug: "${c.slug}", province: "${c.provinceSlug}" (${c.type})`);
  });

  // Build sample URLs
  console.log('\n✅ Valid test URLs:\n');
  const sampleKeyword = keywords[0];
  const sampleProvince = provinces[0];
  const sampleCity = cities[0];

  console.log(`Province level: /${sampleKeyword.slug}/${sampleProvince.provinceSlug}`);
  console.log(`City level: /${sampleKeyword.slug}/${sampleCity.provinceSlug}/${sampleCity.slug}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
