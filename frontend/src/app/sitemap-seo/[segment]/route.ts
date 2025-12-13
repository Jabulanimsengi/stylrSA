import { NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_ORIGIN ||
    process.env.BACKEND_URL ||
    'http://localhost:5000';

/**
 * SEO Sitemap Route Handler
 * Handles /sitemap-seo/[segment]
 * Mapped from /sitemap-seo-[segment].xml via next.config.ts rewrite
 */
export async function GET(
    request: Request,
    { params }: { params: Promise<{ segment: string }> }
) {
    try {
        const { segment } = await params;

        // Validate segment is a number
        if (!segment || !/^\d+$/.test(segment)) {
            const emptyXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
</urlset>`;
            return new NextResponse(emptyXml, {
                status: 200,
                headers: { 'Content-Type': 'application/xml; charset=utf-8' },
            });
        }

        // Fetch from backend
        const response = await fetch(
            `${BACKEND_URL}/seo/sitemap-seo-${segment}`,
            { next: { revalidate: 86400 } }
        );

        if (!response.ok) {
            console.error(
                `SEO sitemap-seo-${segment} error: ${response.status} ${response.statusText}`
            );

            const emptyXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
</urlset>`;

            return new NextResponse(emptyXml, {
                status: 200,
                headers: {
                    'Content-Type': 'application/xml; charset=utf-8',
                    'Cache-Control': 'public, max-age=300',
                },
            });
        }

        const xml = await response.text();

        if (!xml.includes('<?xml') || !xml.includes('<urlset')) {
            const emptyXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
</urlset>`;

            return new NextResponse(emptyXml, {
                status: 200,
                headers: { 'Content-Type': 'application/xml; charset=utf-8' },
            });
        }

        return new NextResponse(xml, {
            status: 200,
            headers: {
                'Content-Type': 'application/xml; charset=utf-8',
                'Cache-Control': 'public, max-age=3600, s-maxage=3600',
                'X-Generated': 'on-demand',
            },
        });
    } catch (error) {
        console.error(`Sitemap generation error:`, error);

        const emptyXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
</urlset>`;

        return new NextResponse(emptyXml, {
            status: 200,
            headers: {
                'Content-Type': 'application/xml; charset=utf-8',
            },
        });
    }
}
