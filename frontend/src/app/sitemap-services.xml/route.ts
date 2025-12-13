import { NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_ORIGIN || process.env.BACKEND_URL || 'http://localhost:5000';

export async function GET() {
  try {
    const response = await fetch(`${BACKEND_URL}/seo/sitemap-services`, {
      next: { revalidate: 86400 }, // Cache for 1 hour
    });

    if (!response.ok) {
      throw new Error('Failed to fetch services sitemap');
    }

    const xml = await response.text();

    return new NextResponse(xml, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600',
      },
    });
  } catch (error) {
    console.error('Error generating services sitemap:', error);
    return new NextResponse('Error generating sitemap', { status: 500 });
  }
}
