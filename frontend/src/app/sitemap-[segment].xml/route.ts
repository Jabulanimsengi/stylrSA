import { NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_ORIGIN || 
                    process.env.BACKEND_URL || 
                    'http://localhost:5000';

/**
 * Consolidated sitemap segment route
 * Handles:
 * - /sitemap-seo-0.xml (segment = 'seo-0')
 * - /sitemap-0.xml (segment = '0')
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ segment: string }> }
) {
  try {
    const { segment } = await params;
    let backendSegment = segment;

    // Handle 'seo-' prefix (e.g. from sitemap-seo-0.xml)
    if (segment.startsWith('seo-')) {
      backendSegment = segment.replace('seo-', '');
    }

    // Validate segment is a number
    if (!backendSegment || !/^\d+$/.test(backendSegment)) {
      const emptyXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
</urlset>`;
      return new NextResponse(emptyXml, {
        status: 200,
        headers: { 'Content-Type': 'application/xml; charset=utf-8' },
      });
    }

    const response = await fetch(
      `${BACKEND_URL}/seo/sitemap-seo-${backendSegment}`,
      { next: { revalidate: 3600 } }
    );

    if (!response.ok) {
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
      },
    });
  } catch (error) {
    console.error(`Sitemap error:`, error);
    
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
