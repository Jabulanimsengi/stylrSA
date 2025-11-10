import { NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_ORIGIN || process.env.BACKEND_URL || 'http://localhost:5000';

interface RouteParams {
  params: {
    segment: string;
  };
}

export async function GET(request: Request, { params }: RouteParams) {
  try {
    const segment = params.segment;

    // Validate segment is a number
    const segmentNum = parseInt(segment, 10);
    if (isNaN(segmentNum) || segmentNum < 0) {
      return new NextResponse('Invalid segment', { status: 400 });
    }

    // Fetch sitemap from backend
    const response = await fetch(
      `${BACKEND_URL}/seo/sitemap/${segmentNum}`,
      {
        next: { revalidate: 3600 }, // Cache for 1 hour
      },
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch sitemap segment ${segmentNum}`);
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
    console.error('Error generating sitemap:', error);
    return new NextResponse('Error generating sitemap', { status: 500 });
  }
}
