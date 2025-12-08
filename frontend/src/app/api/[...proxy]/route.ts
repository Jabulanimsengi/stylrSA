import { NextRequest, NextResponse } from 'next/server';

// Configure for large file uploads
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Increase body size limit for file uploads (default is 1MB)
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '20mb',
    },
  },
};

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
    // Get the content type to determine how to handle the body
    const contentType = request.headers.get('content-type') || '';

    // Prepare headers - copy all headers but remove Next.js specific ones
    const headers = new Headers(request.headers);
    headers.delete('x-middleware-prefetch');
    headers.delete('x-middleware-subrequest');

    // For GET/HEAD requests, no body; for others, use the raw body
    let body: BodyInit | undefined = undefined;
    if (request.method !== 'GET' && request.method !== 'HEAD') {
      // Use arrayBuffer to preserve binary data for multipart/form-data
      const buffer = await request.arrayBuffer();
      body = Buffer.from(buffer);
    }

    // Forward the request to the backend
    const response = await fetch(backendUrl, {
      method: request.method,
      headers: headers,
      body: body,
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

