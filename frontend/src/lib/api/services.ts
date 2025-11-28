/**
 * Services API endpoints
 */

import { api } from './client';

export interface Service {
  id: string;
  name: string;
  description?: string;
  price: number;
  duration: number; // in minutes
  category: string;
  salonId: string;
  image?: string;
  isActive?: boolean;
}

export interface ServiceCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  serviceCount?: number;
}

export interface ServiceFilters {
  category?: string;
  salonId?: string;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
  page?: number;
  limit?: number;
}

export const servicesApi = {
  /**
   * Get all services with optional filters
   */
  getAll: (filters?: ServiceFilters) => {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, String(value));
        }
      });
    }
    const query = params.toString();
    return api.get<Service[]>(`/services${query ? `?${query}` : ''}`);
  },

  /**
   * Get a single service by ID
   */
  getById: (id: string) => api.get<Service>(`/services/${id}`),

  /**
   * Get services by salon
   */
  getBySalon: (salonId: string) =>
    api.get<Service[]>(`/salons/${salonId}/services`),

  /**
   * Get all service categories
   */
  getCategories: () => api.get<ServiceCategory[]>('/categories'),

  /**
   * Get services by category
   */
  getByCategory: (categorySlug: string) =>
    api.get<Service[]>(`/services/category/${categorySlug}`),

  /**
   * Get featured services
   */
  getFeatured: (limit = 10) =>
    api.get<Service[]>(`/services/featured?limit=${limit}`),
};
