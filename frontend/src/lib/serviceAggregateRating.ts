import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Get aggregate rating for service category in a specific location
 * Only returns data if there are at least 5 approved reviews (Google's minimum recommendation)
 * 
 * This function queries the database directly.
 * It is intended for use in Server Components.
 */
export async function getServiceLocationAggregateRating(
    category: string,
    city: string,
    province: string
): Promise<{ averageRating: number; totalReviews: number } | null> {
    try {
        // Skip database queries during build if explicitly requested
        // This prevents build failures when database is unreachable
        if (process.env.SKIP_DB_QUERIES_ON_BUILD === 'true') {
            console.log('[getServiceLocationAggregateRating] Skipping DB query during build');
            return null;
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
            return null;
        }

        const salonIds = salons.map((s) => s.id);

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
            return null;
        }

        // Calculate aggregate
        const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
        const averageRating = totalRating / reviews.length;

        return {
            averageRating: Math.round(averageRating * 10) / 10, // Round to 1 decimal
            totalReviews: reviews.length,
        };
    } catch (error) {
        console.error('[getServiceLocationAggregateRating] DB Error:', error);
        return null;
    }
}
