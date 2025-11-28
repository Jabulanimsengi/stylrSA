/**
 * Bookings API endpoints
 */

import { api } from './client';

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
  updatedAt: string;
}

export type BookingStatus = 
  | 'pending'
  | 'confirmed'
  | 'cancelled'
  | 'completed'
  | 'no_show';

export interface CreateBookingData {
  salonId: string;
  serviceId: string;
  date: string;
  time: string;
  notes?: string;
}

export interface BookingFilters {
  status?: BookingStatus;
  salonId?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

export const bookingsApi = {
  /**
   * Create a new booking
   */
  create: (data: CreateBookingData) =>
    api.post<Booking>('/bookings', data),

  /**
   * Get user's bookings
   */
  getMyBookings: (filters?: BookingFilters) => {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, String(value));
        }
      });
    }
    const query = params.toString();
    return api.get<Booking[]>(`/bookings/my${query ? `?${query}` : ''}`);
  },

  /**
   * Get a single booking by ID
   */
  getById: (id: string) => api.get<Booking>(`/bookings/${id}`),

  /**
   * Cancel a booking
   */
  cancel: (id: string, reason?: string) =>
    api.patch<Booking>(`/bookings/${id}/cancel`, { reason }),

  /**
   * Confirm a booking (salon owner)
   */
  confirm: (id: string) =>
    api.patch<Booking>(`/bookings/${id}/confirm`),

  /**
   * Mark booking as completed (salon owner)
   */
  complete: (id: string) =>
    api.patch<Booking>(`/bookings/${id}/complete`),

  /**
   * Get available time slots for a service
   */
  getAvailableSlots: (salonId: string, serviceId: string, date: string) =>
    api.get<string[]>(`/availability/${salonId}/${serviceId}?date=${date}`),
};
