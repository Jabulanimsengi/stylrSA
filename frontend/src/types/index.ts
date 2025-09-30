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
  avgRating?: number;
  operatingDays?: string[];
  isAvailableNow: boolean;
  contactEmail?: string;
  phoneNumber?: string;
  whatsapp?: string;
  website?: string;
  isFavorited?: boolean;
  latitude?: number;
  longitude?: number;
}

export interface Service {
  id: string;
  title: string;
  description: string;
  price: number;
  duration: number; // Added this line
  images: string[];
  approvalStatus: ApprovalStatus;
  salonId: string;
  likeCount: number;
  isLikedByCurrentUser?: boolean;
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
  status: 'PENDING' | 'CONFIRMED' | 'DECLINED' | 'COMPLETED';
  client: {
    firstName: string;
    lastName: string;
  };
}

export interface ChatParticipant {
  id: string;
  firstName: string;
  lastName: string;
}

export interface ChatMessage {
  id: string;
  content: string;
  createdAt: string;
  senderId: string;
  conversationId: string;
}

export interface Conversation {
  id: string;
  participants: ChatParticipant[];
  messages: ChatMessage[];
}

export interface Notification {
  id: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  link?: string;
}

export interface GalleryImage {
  id: string;
  imageUrl: string;
  caption: string | null;
  salonId: string;
}