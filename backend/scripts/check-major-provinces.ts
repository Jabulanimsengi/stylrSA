import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkMajorProvinces() {
  console.log('🔍 Checking SEO page coverage for major provinces...\n');

  const majorProvinces = [
    { name: 'Gauteng', slug: 'gauteng' },
    { name: 'Western Cape', slug: 'western-cape' },
    { name: 'KwaZulu-Natal', slug: 'kwazulu-natal' },
  ];

  const majorCities = [
    'Johannesburg',
    'Pretoria',
    'Cape Town',
    'Durban',
    'Sandton',
    'Centurion',
    'Stellenbosch',
    'Pietermaritzburg',
  ];

  try {
    // Check total pages
    const totalPages = await prisma.seoPageCache.count();
    console.log(`📊 Total SEO pages: ${totalPages}\n`);

    // Check pages by province
    for (const province of majorProvinces) {
      const provincePages = await prisma.seoPageCache.count({
        where: {
          url: {
            contains: `/${province.slug}`,
          },
        },
      });

      console.log(`📍 ${province.name}: ${provincePages} pages`);

      // Check major cities in this province
      const locations = await prisma.seoLocation.findMany({
        where: {
          provinceSlug: province.slug,
          type: { in: ['CITY', 'TOWN'] },
        },
        orderBy: { population: 'desc' },
        take: 5,
      });

      for (const location of locations) {
        const cityPages = await prisma.seoPageCache.count({
          where: {
            url: {
              contains: `/${province.slug}/${location.slug}`,
            },
          },
        });
        console.log(`   - ${location.name}: ${cityPages} pages`);
      }
      console.log('');
    }

    // Check specific major cities
    console.log('🏙️  Major Cities Coverage:\n');
    for (const cityName of majorCities) {
      const location = await prisma.seoLocation.findFirst({
        where: {
          name: cityName,
          type: { in: ['CITY', 'TOWN'] },
        },
      });

      if (location) {
        const cityPages = await prisma.seoPageCache.count({
          where: {
            url: {
              contains: `/${location.provinceSlug}/${location.slug}`,
            },
          },
        });
        console.log(`   ${cityName}: ${cityPages} pages`);
      }
    }

    // Check sample URLs
    console.log('\n📄 Sample URLs for verification:\n');
    const samplePages = await prisma.seoPageCache.findMany({
      where: {
        OR: [
          { url: { contains: '/gauteng/johannesburg' } },
          { url: { contains: '/western-cape/cape-town' } },
          { url: { contains: '/kwazulu-natal/durban' } },
        ],
      },
      take: 10,
      select: { url: true },
    });

    samplePages.forEach((page) => {
      console.log(`   ${page.url}`);
    });

    // Check keywords coverage
    console.log('\n🔑 Keywords with most pages:\n');
    const keywordStats = await prisma.$queryRaw<
      Array<{ keyword: string; count: bigint }>
    >`
      SELECT k.keyword, COUNT(p.id)::bigint as count
      FROM "SeoKeyword" k
      LEFT JOIN "SeoPageCache" p ON p."keywordId" = k.id
      GROUP BY k.keyword
      ORDER BY count DESC
      LIMIT 10
    `;

    keywordStats.forEach((stat) => {
      console.log(`   ${stat.keyword}: ${stat.count} pages`);
    });
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkMajorProvinces()
  .then(() => {
    console.log('\n✅ Check complete!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Fatal error:', error);
    process.exit(1);
  });
