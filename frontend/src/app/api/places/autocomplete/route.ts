import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const input = searchParams.get('input');
  const country = searchParams.get('country') || 'za';

  if (!input) {
    return NextResponse.json({ predictions: [] });
  }

  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  
  if (!apiKey) {
    // Fallback: return empty if no API key configured
    console.warn('GOOGLE_PLACES_API_KEY not configured');
    return NextResponse.json({ predictions: [] });
  }

  try {
    const url = new URL('https://maps.googleapis.com/maps/api/place/autocomplete/json');
    url.searchParams.set('input', input);
    url.searchParams.set('key', apiKey);
    url.searchParams.set('components', `country:${country}`);
    url.searchParams.set('types', 'geocode');

    const response = await fetch(url.toString());
    const data = await response.json();

    return NextResponse.json({
      predictions: data.predictions || [],
    });
  } catch (error) {
    console.error('Places autocomplete error:', error);
    return NextResponse.json({ predictions: [] });
  }
}
