// frontend/src/types/index.ts

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'USER' | 'SALON_OWNER' | 'PRODUCT_SELLER' | 'ADMIN';
  createdAt: string;
  updatedAt: string;
  profileImage?: string;
}

export interface Salon {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  phone: string;
  email: string;
  website?: string;
  description: string;
  services: Service[];
  reviews: Review[];
  ownerId: string;
  createdAt: string;
  updatedAt: string;
  coverImage?: string;
  gallery: GalleryImage[];
  latitude?: number;
  longitude?: number;
  rating?: number;
  openingTime: string;
  closingTime: string;
  daysOpen: string[];
  contactPerson?: string;
  contactPhone?: string;
  heroImages: string[];
}

export interface Service {
  id: string;
  name: string; // Changed from title to name
  description: string;
  price: number;
  duration: number;
  category: string;
  inclusions?: string[];
  salonId: string;
  createdAt: string;
  updatedAt: string;
  images: string[];
  averageRating?: number;
  reviewCount?: number;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
}

export interface Review {
  id: string;
  rating: number;
  comment: string;
  userId: string;
  salonId: string;
  createdAt: string;
  updatedAt: string;
  user: User;
}

export interface Booking {
  id: string;
  userId: string;
  salonId: string;
  serviceId: string;
  bookingDate: string;
  bookingTime: string;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';
  notes?: string;
  createdAt: string;
  updatedAt: string;
  user: User;
  salon: Salon;
  service: Service;
}

export interface Notification {
  id: string;
  userId: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  link?: string;
  type: 'BOOKING_CONFIRMED' | 'BOOKING_CANCELLED' | 'NEW_MESSAGE' | 'PROMOTION' | 'REVIEW_REMINDER';
}

export interface Conversation {
  id: string;
  user1Id: string;
  user2Id: string;
  user1: User;
  user2: User;
  updatedAt: string;
  createdAt: string;
  participants?: User[];
  lastMessage?: ChatMessage;
  messages?: ChatMessage[];
}

export interface ChatMessage {
  id: string;
  content: string;
  senderId: string;
  conversationId: string;
  createdAt: string;
  deliveredAt?: string | null;
  readAt?: string | null;
}

export interface GalleryImage {
  id: string;
  url: string;
  caption?: string;
  salonId: string;
  createdAt: string;
}

export interface Product {
    id: string;
    name: string;
    description: string;
    price: number;
    images: string[];
    stock: number;
    sellerId: string;
    createdAt: string;
    updatedAt: string;
    seller: User;
    category: string;
}

export interface Promotion {
    id: string;
    title: string;
    description: string;
    discountPercentage: number;
    startDate: string;
    endDate: string;
    salonId?: string;
    serviceId?: string;
    productId?: string;
    promoCode?: string;
    isActive: boolean;
}