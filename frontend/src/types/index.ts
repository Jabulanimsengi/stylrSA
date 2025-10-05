// frontend/src/types/index.ts

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'USER' | 'SALON_OWNER' | 'ADMIN' | 'PRODUCT_SELLER';
  createdAt: string;
  updatedAt: string;
}

export interface Salon {
  id: string;
  name: string;
  ownerId: string;
  city: string;
  province: string;
  country: string;
  town: string;
  contactEmail?: string;
  phoneNumber?: string;
  whatsapp?: string;
  website?: string;
  backgroundImage?: string;
  heroImages?: string[];
  description: string;
  latitude?: number;
  longitude?: number;
  operatingHours?: { [key: string]: string };
  bookingType: 'ONSITE' | 'MOBILE' | 'BOTH';
  offersMobile?: boolean;
  mobileFee?: number;
  isAvailableNow: boolean;
  approvalStatus: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: string;
  updatedAt: string;
  reviews?: Review[];
  services?: Service[];
  gallery?: GalleryImage[];
  isFavorited?: boolean;
}

export interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: number; // in minutes
  salonId: string;
  salon: Salon;
  approvalStatus: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: string;
  updatedAt: string;
}

export interface Booking {
  id: string;
  userId: string;
  user: User;
  salonId: string;
  salon: Salon;
  serviceId: string;
  service: Service;
  bookingTime: string;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';
  contactDetails: string;
  createdAt: string;
  updatedAt: string;
}

export interface Review {
  id: string;
  rating: number;
  comment: string;
  userId: string;
  author: {
    id: string;
    firstName: string;
    lastName: string;
  };
  salonId: string;
  bookingId: string;
  createdAt: string;
  updatedAt: string;
}

export interface GalleryImage {
  id: string;
  imageUrl: string;
  caption?: string;
  salonId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  stockQuantity: number;
  sellerId: string;
  seller: User;
  images: string[];
  approvalStatus: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: string;
  updatedAt: string;
}

export interface Promotion {
  id: string;
  title: string;
  description: string;
  discountPercentage: number;
  startDate: string;
  endDate: string;
  serviceId?: string;
  service?: Service;
  productId?: string;
  product?: Product;
  salonId: string;
  salon: Salon;
}