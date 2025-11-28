/**
 * Salon API endpoints
 */

import { api } from './client';

export interface Salon {
  id: string;
  name: string;
  description?: string;
  address?: string;
  city?: string;
  province?: string;
  latitude?: number;
  longitude?: number;
  phone?: string;
  email?: string;
  website?: string;
  logo?: string;
  coverImage?: string;
  rating?: number;
  reviewCount?: number;
  isVerified?: boolean;
  isFeatured?: boolean;
}

export interface SalonFilters {
  city?: string;
  province?: string;
  category?: string;
  search?: string;
  featured?: boolean;
  verified?: boolean;
  page?: number;
  limit?: number;
  lat?: number;
  lng?: number;
  radius?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const salonsApi = {
  /**
   * Get all salons with optional filters
   */
  getAll: (filters?: SalonFilters) => {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, String(value));
        }
      });
    }
    const query = params.toString();
    return api.get<PaginatedResponse<Salon>>(`/salons${query ? `?${query}` : ''}`);
  },

  /**
   * Get a single salon by ID
   */
  getById: (id: string) => api.get<Salon>(`/salons/${id}`),

  /**
   * Get featured salons
   */
  getFeatured: (limit = 10) =>
    api.get<Salon[]>(`/salons/featured?limit=${limit}`),

  /**
   * Get salons near a location
   */
  getNearby: (lat: number, lng: number, radius = 10) =>
    api.get<Salon[]>(`/salons/nearby?lat=${lat}&lng=${lng}&radius=${radius}`),

  /**
   * Search salons
   */
  search: (query: string, filters?: SalonFilters) => {
    const params = new URLSearchParams({ q: query });
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, String(value));
        }
      });
    }
    return api.get<PaginatedResponse<Salon>>(`/salons/search?${params.toString()}`);
  },

  /**
   * Toggle favorite status
   */
  toggleFavorite: (salonId: string) =>
    api.post<{ isFavorited: boolean }>(`/favorites/toggle`, { salonId }),

  /**
   * Get user's favorite salons
   */
  getFavorites: () => api.get<Salon[]>('/favorites'),
};
