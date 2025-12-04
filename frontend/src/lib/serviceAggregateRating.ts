
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

        const data = await response.json();
        // If the API returns null (which it might if we designed it that way, but our backend returns 404 or object), handle it.
        // Our backend service returns null, but the controller returns it. NestJS might return 200 with empty body or 204?
        // Actually, if the service returns null, the controller returns null. NestJS default for null is 200 OK with empty body?
        // Let's check the backend service implementation again.
        // It returns null or an object.
        // If it returns null, NestJS sends 200 OK with empty body (usually).
        // But wait, if I want to be safe, I should check if data is empty.

        if (!data) return null;

        return data;
    } catch (error) {
        console.error('[getServiceLocationAggregateRating] API Error:', error);
        return null;
    }
}

