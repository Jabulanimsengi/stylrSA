export type ApprovalStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface Review {
  id: string;
  rating: number;
  comment: string;
  author: {
    firstName: string;
    lastName: string;
  };
}

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
  reviews?: Review[];
  bookingType: 'ONSITE' | 'MOBILE' | 'BOTH';
  operatingHours: { [key: string]: string } | null;
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
  bookingDate: string;
  isMobile: boolean;
  totalCost: number;
  salon: {
    name: string;
  };
  service: {
    title: string;
  };
  review: { id: string } | null;
}