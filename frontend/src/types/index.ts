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
  description?: string;
  backgroundImage?: string | null;
  province: string;
  heroImages: string[];
  city: string;
  town: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  contactEmail?: string | null;
  phoneNumber?: string | null;
  whatsapp?: string | null;
  website?: string | null;
  bookingType?: 'ONSITE' | 'MOBILE' | 'BOTH';
  offersMobile?: boolean;
  mobileFee?: number | null;
  isAvailableNow?: boolean;
  operatingHours?: Record<string, string> | null;
  operatingDays?: string[];
  approvalStatus?: 'PENDING' | 'APPROVED' | 'REJECTED';
  avgRating?: number;
  services?: Service[];
  reviews?: Review[];
  ownerId: string;
  createdAt: string;
  updatedAt: string;
  coverImage?: string;
  gallery?: GalleryImage[];
  isFavorited?: boolean;
  // Plan & visibility controls (populated from backend)
  planCode?: 'STARTER' | 'ESSENTIAL' | 'GROWTH' | 'PRO' | 'ELITE' | null;
  visibilityWeight?: number;
  maxListings?: number;
  featuredUntil?: string | null;
}

export interface Service {
  id: string;
  // Keep both for backward-compat across components; backend uses 'title'
  title?: string;
  name?: string;
  description: string;
  price: number;
  duration: number;
  category?: string;
  categoryId?: string;
  inclusions?: string[];
  salonId: string;
  createdAt: string;
  updatedAt: string;
  images: string[];
  averageRating?: number;
  reviewCount?: number;
  approvalStatus?: 'PENDING' | 'APPROVED' | 'REJECTED';
  status?: 'PENDING' | 'APPROVED' | 'REJECTED';
  likeCount?: number;
  isLikedByCurrentUser?: boolean;
  salon?: {
    id: string;
    name: string;
    ownerId: string;
    city?: string;
    province?: string;
  };
}

export interface Review {
  id: string;
  rating: number;
  comment: string;
  userId: string;
  salonId: string;
  createdAt: string;
  updatedAt: string;
  author: { id: string; firstName: string; lastName: string };
}

export interface Booking {
  id: string;
  userId: string;
  salonId: string;
  serviceId: string;
  bookingTime: string;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED' | 'DECLINED';
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
  bookingId?: string;
  type?: 'BOOKING_CONFIRMED' | 'BOOKING_CANCELLED' | 'NEW_MESSAGE' | 'PROMOTION' | 'REVIEW_REMINDER';
}

export interface PaginatedNotifications {
  items: Notification[];
  nextCursor: string | null;
  unreadCount: number;
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
  lastMessage?: ChatMessage | null;
  messages?: ChatMessage[];
  unreadCount?: number;
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
  imageUrl: string;
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
    isOnSale?: boolean;
    salePrice?: number;
    seller?: Partial<User>;
    category?: string;
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

export type ProductOrderStatus = 'PENDING' | 'CONFIRMED' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';

export interface ProductOrder {
  id: string;
  productId: string;
  buyerId: string;
  sellerId: string;
  quantity: number;
  totalPrice: number;
  status: ProductOrderStatus;
  deliveryMethod?: string | null;
  contactPhone?: string | null;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
  product: {
    id: string;
    name: string;
    images: string[];
    price: number;
  };
  seller?: Partial<User>;
  buyer?: Partial<User>;
}