import { NextResponse } from 'next/server';
import { getSitemapStats } from '@/lib/sitemap-generator';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.stylrsa.co.za';
const BACKEND_URL = process.env.NEXT_PUBLIC_API_ORIGIN || process.env.BACKEND_URL || 'http://localhost:5000';

/**
 * Sitemap Index - Lists all available sitemaps
 * PRIORITY: Backend first (550K+ URLs), local fallback (~25K URLs)
 */
export async function GET() {
  // Try backend first - it has 550K+ URLs from the database
  try {
    const response = await fetch(`${BACKEND_URL}/seo/sitemap-index`, {
      next: { revalidate: 3600 }, // Cache for 1 hour
    });

    if (response.ok) {
      const xml = await response.text();
      return new NextResponse(xml, {
        status: 200,
        headers: {
          'Content-Type': 'application/xml; charset=utf-8',
          'Cache-Control': 'public, max-age=3600, s-maxage=3600',
          'X-Source': 'backend',
        },
      });
    }
  } catch (error) {
    console.warn('Backend sitemap unavailable, using local fallback:', error);
  }

  // Fallback to local generation (~25K URLs from locationData.ts)
  try {
    const today = new Date().toISOString().split('T')[0];
    const stats = getSitemapStats();
    const seoSitemapCount = Math.ceil(stats.seoPages / 45000);

    const sitemaps: string[] = [];

    // Static pages
    sitemaps.push(`
    <sitemap>
      <loc>${SITE_URL}/sitemap-static.xml</loc>
      <lastmod>${today}</lastmod>
    </sitemap>`);

    // Local SEO sitemaps
    for (let i = 0; i < seoSitemapCount; i++) {
      sitemaps.push(`
    <sitemap>
      <loc>${SITE_URL}/sitemap-seo-local-${i}.xml</loc>
      <lastmod>${today}</lastmod>
    </sitemap>`);
    }

    // Jobs
    sitemaps.push(`
    <sitemap>
      <loc>${SITE_URL}/sitemap-jobs-local.xml</loc>
      <lastmod>${today}</lastmod>
    </sitemap>`);

    // Services
    sitemaps.push(`
    <sitemap>
      <loc>${SITE_URL}/sitemap-services-local.xml</loc>
      <lastmod>${today}</lastmod>
    </sitemap>`);

    // Salons (still from backend/dynamic)
    sitemaps.push(`
    <sitemap>
      <loc>${SITE_URL}/sitemap-salons.xml</loc>
      <lastmod>${today}</lastmod>
    </sitemap>`);

    // Candidates
    sitemaps.push(`
    <sitemap>
      <loc>${SITE_URL}/sitemap-candidates-local.xml</loc>
      <lastmod>${today}</lastmod>
    </sitemap>`);

    // Trends (dynamic)
    sitemaps.push(`
    <sitemap>
      <loc>${SITE_URL}/sitemap-trends.xml</loc>
      <lastmod>${today}</lastmod>
    </sitemap>`);

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemaps.join('')}
</sitemapindex>`;

    return new NextResponse(xml, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600',
        'X-Source': 'local-fallback',
      },
    });
  } catch (error) {
    console.error('Error generating sitemap index:', error);
    return new NextResponse('Error generating sitemap', { status: 500 });
  }
}
