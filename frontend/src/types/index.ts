// frontend/src/types/index.ts

export type AuthStatus = 'authenticated' | 'unauthenticated' | 'loading';

export type UserRole = 'USER' | 'SALON_OWNER' | 'ADMIN' | 'PRODUCT_SELLER';

export type ApprovalStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
  password?: string;
  salonId?: string; // This line has been added
}

export interface Salon {
  id: string;
  name: string;
  address: string;
  town: string;
  city: string;
  province: string;
  postalCode: string;
  latitude?: number | null;
  longitude?: number | null;
  phoneNumber?: string | null;
  contactEmail?: string | null;
  website?: string | null;
  whatsapp?: string | null;
  description: string;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
  backgroundImage?: string | null;
  heroImages?: string[]; // Added heroImages property
  isFavorited?: boolean;
  isAvailableNow?: boolean;
  operatingHours?: Record<string, string> | null;
  bookingType: 'ONSITE' | 'MOBILE' | 'BOTH';
  offersMobile?: boolean;
  mobileFee?: number | null;
  reviews?: Review[];
  approvalStatus: ApprovalStatus;
}

export interface Service {
  id: string;
  title: string;
  description: string;
  price: number;
  duration: number; // in minutes
  salonId: string;
  images: string[];
  createdAt: string;
  updatedAt: string;
  isLikedByCurrentUser?: boolean;
  likeCount: number;
  approvalStatus: ApprovalStatus;
}

export interface GalleryImage {
  id: string;
  imageUrl: string;
  caption?: string;
  salonId: string;
}

export interface Review {
  id: string;
  rating: number;
  comment: string;
  authorId: string;
  author: {
    firstName: string;
    lastName: string;
  };
  salonId: string;
  bookingId: string;
  createdAt: string;
  approvalStatus: ApprovalStatus;
}

export interface Booking {
  id: string;
  startTime: string;
  endTime: string;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';
  notes?: string;
  userId: string;
  salonId: string;
  serviceId: string;
  createdAt: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  images: string[];
  sellerId: string;
  createdAt: string;
  updatedAt: string;
  approvalStatus: ApprovalStatus;
}

export interface Promotion {
  id: string;
  code: string;
  description: string;
  discountPercentage: number;
  startDate: string;
  endDate: string;
  salonId?: string | null;
  productId?: string | null;
  isActive: boolean;
}

export interface Notification {
  id: string;
  message: string;
  isRead: boolean;
  userId: string;
  createdAt: string;
}