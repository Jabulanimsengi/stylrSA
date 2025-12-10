import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const backendOrigin = process.env.NEXT_PUBLIC_API_ORIGIN || 'http://localhost:5000';

        const backendRes = await fetch(`${backendOrigin}/api/auth/reset-password`, {
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
        console.error('[Reset Password API] Error:', error);
        return NextResponse.json(
            { message: 'Failed to reset password. Please try again.' },
            { status: 500 }
        );
    }
}
