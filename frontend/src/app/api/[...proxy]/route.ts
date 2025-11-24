import { NextRequest, NextResponse } from 'next/server';

// Catch-all proxy for backend API routes
// This handles all /api/* requests that don't have explicit Next.js route handlers
export async function GET(request: NextRequest) {
  return proxyToBackend(request);
}

export async function POST(request: NextRequest) {
  return proxyToBackend(request);
}

export async function PUT(request: NextRequest) {
  return proxyToBackend(request);
}

export async function PATCH(request: NextRequest) {
  return proxyToBackend(request);
}

export async function DELETE(request: NextRequest) {
  return proxyToBackend(request);
}

async function proxyToBackend(request: NextRequest) {
  const apiOrigin = process.env.NEXT_PUBLIC_API_ORIGIN || 'http://127.0.0.1:3000';

  // Get the full path including query params
  const url = new URL(request.url);
  const backendUrl = `${apiOrigin}${url.pathname}${url.search}`;

  try {
    // Forward the request to the backend
    const response = await fetch(backendUrl, {
      method: request.method,
      headers: {
        ...Object.fromEntries(request.headers),
        // Remove Next.js specific headers
        'x-middleware-prefetch': '',
        'x-middleware-subrequest': '',
      },
      body: request.method !== 'GET' && request.method !== 'HEAD'
        ? await request.text()
        : undefined,
      // Don't cache API responses
      cache: 'no-store',
    });

    // Forward the response back to the client
    const data = await response.text();

    // Build headers object, including Set-Cookie if present
    const responseHeaders: HeadersInit = {
      'Content-Type': response.headers.get('Content-Type') || 'application/json',
    };

    // Forward CORS headers if present
    if (response.headers.get('Access-Control-Allow-Origin')) {
      responseHeaders['Access-Control-Allow-Origin'] = response.headers.get('Access-Control-Allow-Origin')!;
    }

    // CRITICAL: Forward Set-Cookie header for authentication
    if (response.headers.get('Set-Cookie')) {
      responseHeaders['Set-Cookie'] = response.headers.get('Set-Cookie')!;
    }

    return new NextResponse(data, {
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders,
    });
  } catch (error) {
    console.error('Proxy error:', error);
    return NextResponse.json(
      { error: 'Failed to proxy request to backend' },
      { status: 502 }
    );
  }
}
