import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    // Get all keywords
    const keywords = await prisma.seoKeyword.findMany({
        orderBy: [{ priority: 'asc' }, { searchVolume: 'desc' }],
        select: { slug: true, priority: true, searchVolume: true },
    });

    // Get location count
    const locationCount = await prisma.seoLocation.count();

    console.log(`\n=== SITEMAP KEYWORD ANALYSIS ===\n`);
    console.log(`Total Keywords: ${keywords.length}`);
    console.log(`Total Locations: ${locationCount}`);
    console.log(`URLs per sitemap: 50,000`);
    console.log(`Total URLs: ${keywords.length * locationCount}`);
    console.log(`Total Sitemaps: ${Math.ceil((keywords.length * locationCount) / 50000)}\n`);

    // Calculate which keywords are in each sitemap
    const URLS_PER_SITEMAP = 50000;

    keywords.forEach((keyword, index) => {
        // For each keyword, calculate which sitemap segments it appears in
        const startUrl = index * locationCount;
        const endUrl = (index + 1) * locationCount - 1;

        const startSegment = Math.floor(startUrl / URLS_PER_SITEMAP);
        const endSegment = Math.floor(endUrl / URLS_PER_SITEMAP);

        if (startSegment >= 5 && startSegment <= 8) {
            console.log(`Sitemap ${startSegment}${startSegment !== endSegment ? `-${endSegment}` : ''}: ${keyword.slug} (Priority ${keyword.priority}, Volume: ${keyword.searchVolume || 'N/A'})`);
        } else if (endSegment >= 5 && endSegment <= 8) {
            console.log(`Sitemap ${startSegment}-${endSegment}: ${keyword.slug} (Priority ${keyword.priority}, Volume: ${keyword.searchVolume || 'N/A'})`);
        }
    });

    await prisma.$disconnect();
}

main().catch(console.error);
