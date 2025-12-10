import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const backendOrigin = process.env.NEXT_PUBLIC_API_ORIGIN || 'http://localhost:5000';

        const backendRes = await fetch(`${backendOrigin}/api/auth/resend-verification`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
        });

        const data = await backendRes.json();

        if (!backendRes.ok) {
            return NextResponse.json(data, { status: backendRes.status });
        }

        return NextResponse.json(data);
    } catch (error) {
        console.error('[Resend Verification API] Error:', error);
        return NextResponse.json(
            { message: 'Failed to send verification code. Please try again.' },
            { status: 500 }
        );
    }
}
