/**
 * Reviews API endpoints
 */

import { api } from './client';

export interface Review {
  id: string;
  userId: string;
  salonId: string;
  rating: number;
  comment?: string;
  images?: string[];
  isVerified?: boolean;
  createdAt: string;
  user?: {
    id: string;
    name: string;
    avatar?: string;
  };
}

export interface CreateReviewData {
  salonId: string;
  rating: number;
  comment?: string;
  images?: string[];
}

export interface ReviewFilters {
  salonId?: string;
  rating?: number;
  page?: number;
  limit?: number;
}

export const reviewsApi = {
  /**
   * Get reviews for a salon
   */
  getBySalon: (salonId: string, filters?: ReviewFilters) => {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, String(value));
        }
      });
    }
    const query = params.toString();
    return api.get<Review[]>(`/reviews/salon/${salonId}${query ? `?${query}` : ''}`);
  },

  /**
   * Create a new review
   */
  create: (data: CreateReviewData) =>
    api.post<Review>('/reviews', data),

  /**
   * Update a review
   */
  update: (id: string, data: Partial<CreateReviewData>) =>
    api.patch<Review>(`/reviews/${id}`, data),

  /**
   * Delete a review
   */
  delete: (id: string) => api.delete(`/reviews/${id}`),

  /**
   * Get user's reviews
   */
  getMyReviews: () => api.get<Review[]>('/reviews/my'),

  /**
   * Mark review as helpful
   */
  markHelpful: (id: string) =>
    api.post(`/reviews/${id}/helpful`),
};
