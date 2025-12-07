
/**
 * Get aggregate rating for service category in a specific location
 * Only returns data if there are at least 5 approved reviews (Google's minimum recommendation)
 * 
 * This function fetches data from the backend API.
 * It is intended for use in Server Components.
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

        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

        const response = await fetch(`${apiUrl}/api/salons/aggregate-rating?${params.toString()}`, {
            next: { revalidate: 3600 } // Cache for 1 hour
        });

        if (!response.ok) {
            // 404 means no data found (or not enough reviews), which is valid -> return null
            if (response.status === 404) return null;
            // Other errors should be logged
            console.error(`[getServiceLocationAggregateRating] API returned ${response.status}`);
            return null;
        }

        // Handle empty response body (NestJS returns empty body for null)
        const text = await response.text();
        if (!text || text.trim() === '') {
            return null;
        }

        try {
            const data = JSON.parse(text);
            if (!data) return null;
            return data;
        } catch {
            // Invalid JSON response
            return null;
        }
    } catch (error) {
        console.error('[getServiceLocationAggregateRating] API Error:', error);
        return null;
    }
}

