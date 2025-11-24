import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const category = searchParams.get('category');
        const city = searchParams.get('city');
        const province = searchParams.get('province');

        if (!category || !city || !province) {
            return NextResponse.json(
                { error: 'Missing required parameters: category, city, province' },
                { status: 400 }
            );
        }

        // Find all salons with services in this category and location
        const salons = await prisma.salon.findMany({
            where: {
                city: {
                    equals: city,
                    mode: 'insensitive',
                },
                province: {
                    equals: province,
                    mode: 'insensitive',
                },
                approvalStatus: 'APPROVED',
                services: {
                    some: {
                        category: {
                            name: {
                                contains: category,
                                mode: 'insensitive',
                            },
                        },
                        approvalStatus: 'APPROVED',
                    },
                },
            },
            select: {
                id: true,
            },
        });

        if (salons.length === 0) {
            return NextResponse.json(null, { status: 404 });
        }

        const salonIds = salons.map((s: { id: string }) => s.id);

        // Get approved reviews for these salons
        const reviews = await prisma.review.findMany({
            where: {
                salonId: {
                    in: salonIds,
                },
                approvalStatus: 'APPROVED',
            },
            select: {
                rating: true,
            },
        });

        // Google recommends minimum 5 reviews for aggregate rating
        if (reviews.length < 5) {
            return NextResponse.json(null, { status: 404 });
        }

        // Calculate aggregate
        const totalRating = reviews.reduce((sum: number, review: { rating: number }) => sum + review.rating, 0);
        const averageRating = totalRating / reviews.length;

        return NextResponse.json({
            averageRating: Math.round(averageRating * 10) / 10, // Round to 1 decimal
            totalReviews: reviews.length,
        });
    } catch (error) {
        console.error('[aggregate-rating] Error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
