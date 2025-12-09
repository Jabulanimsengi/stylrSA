import { NextResponse } from 'next/server';
import { generateJobUrls, generateSitemapXml } from '@/lib/sitemap-generator';

/**
 * Local Jobs Sitemap - All job role × location combinations
 */
export async function GET() {
    try {
        const urls = generateJobUrls();
        const xml = generateSitemapXml(urls);

        return new NextResponse(xml, {
            status: 200,
            headers: {
                'Content-Type': 'application/xml; charset=utf-8',
                'Cache-Control': 'public, max-age=86400, s-maxage=86400',
                'X-Total-URLs': urls.length.toString(),
            },
        });
    } catch (error) {
        console.error('Error generating local jobs sitemap:', error);

        const emptyXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
</urlset>`;

        return new NextResponse(emptyXml, {
            status: 200,
            headers: { 'Content-Type': 'application/xml; charset=utf-8' },
        });
    }
}
