import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const placeId = searchParams.get('place_id');

  if (!placeId) {
    return NextResponse.json({ error: 'place_id required' }, { status: 400 });
  }

  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  
  if (!apiKey) {
    console.warn('GOOGLE_PLACES_API_KEY not configured');
    return NextResponse.json({ result: null });
  }

  try {
    const url = new URL('https://maps.googleapis.com/maps/api/place/details/json');
    url.searchParams.set('place_id', placeId);
    url.searchParams.set('key', apiKey);
    url.searchParams.set('fields', 'geometry,formatted_address,name');

    const response = await fetch(url.toString());
    const data = await response.json();

    return NextResponse.json({
      result: data.result || null,
    });
  } catch (error) {
    console.error('Places details error:', error);
    return NextResponse.json({ result: null });
  }
}
