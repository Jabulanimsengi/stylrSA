/**
 * Get aggregate rating for service category in a specific location
 * Only returns data if there are at least 5 approved reviews (Google's minimum recommendation)
 * 
 * This function calls the backend API route to fetch aggregate rating data.
 */
export async function getServiceLocationAggregateRating(
    category: string,
    city: string,
    province: string
): Promise<{ averageRating: number; totalReviews: number } | null> {
    try {
        const params = new URLSearchParams({
            category,
            city,
            province,
        });

        const response = await fetch(`/api/aggregate-rating?${params.toString()}`);

        if (!response.ok) {
            // 404 means no data found or less than 5 reviews
            if (response.status === 404) {
                return null;
            }
            // Log other errors
            console.error('[getServiceLocationAggregateRating] API Error:', response.status);
            return null;
        }

        const data: { averageRating: number; totalReviews: number } | null = await response.json();

        return data;
    } catch (error) {
        console.error('[getServiceLocationAggregateRating] Fetch Error:', error);
        return null;
    }
}
