// SEO Health Check API endpoint
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.stylrsa.co.za';
    
    // Check sitemap accessibility
    const sitemapResponse = await fetch(`${siteUrl}/sitemap.xml`);
    const sitemapText = await sitemapResponse.text();
    
    // Count URLs and check for issues
    const urlCount = (sitemapText.match(/<url>/g) || []).length;
    const hasLocalhostUrls = sitemapText.includes('localhost');
    const hasUndefinedUrls = sitemapText.includes('undefined');
    
    // Check robots.txt
    const robotsResponse = await fetch(`${siteUrl}/robots.txt`);
    const robotsText = await robotsResponse.text();
    
    return NextResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      site_url: siteUrl,
      sitemap: {
        accessible: sitemapResponse.ok,
        url_count: urlCount,
        has_localhost_urls: hasLocalhostUrls,
        has_undefined_urls: hasUndefinedUrls,
        status: sitemapResponse.status
      },
      robots_txt: {
        accessible: robotsResponse.ok,
        content_length: robotsText.length,
        has_localhost_urls: robotsText.includes('localhost'),
        status: robotsResponse.status
      },
      environment: process.env.NODE_ENV,
      checks_passed: sitemapResponse.ok && robotsResponse.ok && !hasLocalhostUrls && !hasUndefinedUrls
    });
  } catch (error) {
    return NextResponse.json({ 
      status: 'error', 
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}