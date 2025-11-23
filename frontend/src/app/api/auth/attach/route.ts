import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const token = typeof body?.token === 'string' ? body.token : null;
    if (!token) {
      return NextResponse.json({ error: 'Missing token' }, { status: 400 });
    }
    const isProduction = process.env.NODE_ENV === 'production';
    const apiOrigin = process.env.NEXT_PUBLIC_API_ORIGIN || '';
    const isSecure = isProduction && apiOrigin.startsWith('https');

    // Don't set domain in development to avoid localhost issues
    const cookieStore = await cookies();
    cookieStore.set('access_token', token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: isSecure,
      path: '/',
      maxAge: 60 * 60 * 24, // 1 day in seconds
    });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'Failed to attach token' }, { status: 500 });
  }
}
