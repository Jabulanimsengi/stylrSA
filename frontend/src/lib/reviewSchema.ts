/**
 * Helper functions for generating dynamic review and rating schemas
 * Replaces hardcoded rating values with real data
 */

interface Review {
  id: string;
  author: string;
  rating: number;
  comment: string;
  date: string;
  verified?: boolean;
}

interface AggregateRatingData {
  averageRating: number;
  totalReviews: number;
  ratingDistribution?: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
}

/**
 * Generate AggregateRating schema from real review data
 */
export function generateAggregateRatingSchema(data: AggregateRatingData) {
  if (!data.totalReviews || data.totalReviews === 0) {
    return null;
  }

  return {
    '@type': 'AggregateRating',
    ratingValue: data.averageRating.toFixed(1),
    reviewCount: data.totalReviews.toString(),
    bestRating: '5',
    worstRating: '1',
  };
}

/**
 * Generate Review schema array from review data
 */
export function generateReviewSchemas(reviews: Review[]) {
  if (!reviews || reviews.length === 0) {
    return [];
  }

  return reviews.map(review => ({
    '@type': 'Review',
    author: {
      '@type': 'Person',
      name: review.author,
    },
    reviewRating: {
      '@type': 'Rating',
      ratingValue: review.rating.toString(),
      bestRating: '5',
      worstRating: '1',
    },
    reviewBody: review.comment,
    datePublished: review.date,
    ...(review.verified && { 
      publisher: {
        '@type': 'Organization',
        name: 'Stylr SA',
      }
    }),
  }));
}

/**
 * Calculate aggregate rating from reviews
 */
export function calculateAggregateRating(reviews: Review[]): AggregateRatingData {
  if (!reviews || reviews.length === 0) {
    return {
      averageRating: 0,
      totalReviews: 0,
    };
  }

  const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
  const averageRating = totalRating / reviews.length;

  const ratingDistribution = {
    5: reviews.filter(r => r.rating === 5).length,
    4: reviews.filter(r => r.rating === 4).length,
    3: reviews.filter(r => r.rating === 3).length,
    2: reviews.filter(r => r.rating === 2).length,
    1: reviews.filter(r => r.rating === 1).length,
  };

  return {
    averageRating,
    totalReviews: reviews.length,
    ratingDistribution,
  };
}

/**
 * Generate complete Product/Service schema with reviews
 */
export function generateServiceSchemaWithReviews(
  serviceName: string,
  serviceUrl: string,
  reviews: Review[],
  additionalData?: {
    description?: string;
    image?: string;
    priceRange?: string;
    provider?: string;
  }
) {
  const aggregateData = calculateAggregateRating(reviews);
  const aggregateRating = generateAggregateRatingSchema(aggregateData);
  const reviewSchemas = generateReviewSchemas(reviews.slice(0, 10)); // Top 10 reviews

  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: serviceName,
    url: serviceUrl,
    description: additionalData?.description,
    image: additionalData?.image,
    ...(additionalData?.priceRange && {
      offers: {
        '@type': 'Offer',
        priceCurrency: 'ZAR',
        price: additionalData.priceRange,
      },
    }),
    ...(additionalData?.provider && {
      provider: {
        '@type': 'Organization',
        name: additionalData.provider,
      },
    }),
    ...(aggregateRating && { aggregateRating }),
    ...(reviewSchemas.length > 0 && { review: reviewSchemas }),
  };
}

/**
 * Generate LocalBusiness schema with real reviews
 */
export function generateLocalBusinessSchemaWithReviews(
  businessName: string,
  businessUrl: string,
  address: {
    street?: string;
    city: string;
    province: string;
    postalCode?: string;
    country: string;
  },
  reviews: Review[],
  additionalData?: {
    description?: string;
    image?: string;
    telephone?: string;
    priceRange?: string;
    openingHours?: string[];
  }
) {
  const aggregateData = calculateAggregateRating(reviews);
  const aggregateRating = generateAggregateRatingSchema(aggregateData);
  const reviewSchemas = generateReviewSchemas(reviews.slice(0, 10));

  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: businessName,
    url: businessUrl,
    description: additionalData?.description,
    image: additionalData?.image,
    telephone: additionalData?.telephone,
    priceRange: additionalData?.priceRange,
    address: {
      '@type': 'PostalAddress',
      streetAddress: address.street,
      addressLocality: address.city,
      addressRegion: address.province,
      postalCode: address.postalCode,
      addressCountry: address.country,
    },
    ...(additionalData?.openingHours && {
      openingHoursSpecification: additionalData.openingHours.map(hours => ({
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: hours.split(' ')[0],
        opens: hours.split(' ')[1],
        closes: hours.split(' ')[2],
      })),
    }),
    ...(aggregateRating && { aggregateRating }),
    ...(reviewSchemas.length > 0 && { review: reviewSchemas }),
  };
}

/**
 * Format star rating for display
 */
export function formatStarRating(rating: number): string {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

  return '★'.repeat(fullStars) + 
         (hasHalfStar ? '½' : '') + 
         '☆'.repeat(emptyStars);
}

/**
 * Get rating color based on value
 */
export function getRatingColor(rating: number): string {
  if (rating >= 4.5) return '#00a651'; // Excellent - Green
  if (rating >= 4.0) return '#73cf11'; // Very Good - Light Green
  if (rating >= 3.5) return '#ffb400'; // Good - Yellow
  if (rating >= 3.0) return '#ff8c00'; // Fair - Orange
  return '#ff6b6b'; // Poor - Red
}

/**
 * Get rating label
 */
export function getRatingLabel(rating: number): string {
  if (rating >= 4.5) return 'Excellent';
  if (rating >= 4.0) return 'Very Good';
  if (rating >= 3.5) return 'Good';
  if (rating >= 3.0) return 'Fair';
  return 'Needs Improvement';
}
