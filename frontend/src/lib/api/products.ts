/**
 * Products API endpoints
 */

import { api } from './client';

export interface Product {
  id: string;
  salonId: string;
  name: string;
  description?: string;
  price: number;
  image?: string;
  category?: string;
  inStock?: boolean;
  quantity?: number;
}

export interface ProductFilters {
  salonId?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  search?: string;
  page?: number;
  limit?: number;
}

export interface CreateProductData {
  name: string;
  description?: string;
  price: number;
  image?: string;
  category?: string;
  quantity?: number;
}

export const productsApi = {
  /**
   * Get all products with optional filters
   */
  getAll: (filters?: ProductFilters) => {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, String(value));
        }
      });
    }
    const query = params.toString();
    return api.get<Product[]>(`/products${query ? `?${query}` : ''}`);
  },

  /**
   * Get a single product by ID
   */
  getById: (id: string) => api.get<Product>(`/products/${id}`),

  /**
   * Get products by salon
   */
  getBySalon: (salonId: string) =>
    api.get<Product[]>(`/salons/${salonId}/products`),

  /**
   * Create a new product (salon owner)
   */
  create: (data: CreateProductData) =>
    api.post<Product>('/products', data),

  /**
   * Update a product (salon owner)
   */
  update: (id: string, data: Partial<CreateProductData>) =>
    api.patch<Product>(`/products/${id}`, data),

  /**
   * Delete a product (salon owner)
   */
  delete: (id: string) => api.delete(`/products/${id}`),

  /**
   * Get product categories
   */
  getCategories: () => api.get<string[]>('/products/categories'),
};
