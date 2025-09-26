// frontend/src/types/index.ts

export type ApprovalStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface Salon {
  id: string;
  name: string;
  backgroundImage: string | null;
  province: string;
  city: string;
  town: string;
  offersMobile: boolean;
  mobileFee: number | null;
  approvalStatus: ApprovalStatus;
  ownerId: string;
}

export interface Service {
  id: string;
  title: string;
  description: string;
  price: number;
  images: string[];
  approvalStatus: ApprovalStatus;
  salonId: string;
}

export interface Booking {
  id: string;
  bookingDate: string; // ISO date string
  isMobile: boolean;
  totalCost: number;
  salon: {
    name: string;
  };
  service: {
    title: string;
  };
}