import { NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_ORIGIN || 
                    process.env.BACKEND_URL || 
                    'http://localhost:5000';

/**
 * Dynamic SEO sitemap route - paginated keyword×location combinations
 * Supports: /sitemap-seo-0.xml, /sitemap-seo-1.xml, /sitemap-seo-2.xml, etc.
 * NO DATABASE STORAGE - Uses backend on-demand generation
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
      { next: { revalidate: 3600 } }  // Cache for 1 hour
    );

    if (!response.ok) {
      console.error(
        `SEO sitemap-seo-${segment} error: ${response.status} ${response.statusText}`
      );

      // Return empty sitemap on error (don't 404)
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

    // Validate it's actually XML
    if (!xml.includes('<?xml') || !xml.includes('<urlset')) {
      console.error('Backend returned invalid XML');
      
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
    
    // Return empty sitemap instead of error
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
