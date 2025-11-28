/**
 * Shared Types
 * 
 * Types that are used across both frontend and backend.
 * Import from '@shared/types' or '../../shared/types'
 */

// User & Auth Types
export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar?: string;
  phone?: string;
  isVerified?: boolean;
  createdAt: string;
  updatedAt?: string;
}

export type UserRole = 'user' | 'salon_owner' | 'admin';

// Salon Types
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
  ownerId: string;
  createdAt: string;
  updatedAt?: string;
}

// Service Types
export interface Service {
  id: string;
  name: string;
  description?: string;
  price: number;
  duration: number;
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
}

// Booking Types
export interface Booking {
  id: string;
  userId: string;
  salonId: string;
  serviceId: string;
  date: string;
  time: string;
  status: BookingStatus;
  notes?: string;
  totalPrice: number;
  createdAt: string;
  updatedAt?: string;
}

export type BookingStatus = 
  | 'pending'
  | 'confirmed'
  | 'cancelled'
  | 'completed'
  | 'no_show';

// Review Types
export interface Review {
  id: string;
  userId: string;
  salonId: string;
  rating: number;
  comment?: string;
  images?: string[];
  isVerified?: boolean;
  createdAt: string;
  updatedAt?: string;
}

// Promotion Types
export interface Promotion {
  id: string;
  salonId: string;
  title: string;
  description?: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  startDate: string;
  endDate: string;
  isActive?: boolean;
  image?: string;
}

// Product Types
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

// Pagination Types
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// Location Types
export interface Location {
  id: string;
  name: string;
  slug: string;
  type: 'province' | 'city' | 'suburb';
  parentId?: string;
}

// Notification Types
export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  data?: Record<string, unknown>;
  createdAt: string;
}

export type NotificationType = 
  | 'booking_created'
  | 'booking_confirmed'
  | 'booking_cancelled'
  | 'review_received'
  | 'promotion_created'
  | 'system';
