import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const hostname = request.headers.get('host');
  
  // Redirect www to non-www (e.g., www.stylrsa.co.za → stylrsa.co.za)
  if (hostname?.startsWith('www.')) {
    const newHostname = hostname.replace('www.', '');
    const url = request.nextUrl.clone();
    url.host = newHostname;
    
    // 301 Permanent Redirect (tells search engines the move is permanent)
    return NextResponse.redirect(url, { status: 301 });
  }
  
  return NextResponse.next();
}

// Apply middleware to all routes
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|json|xml|txt)$).*)',
  ],
};
