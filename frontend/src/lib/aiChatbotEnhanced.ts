// Enhanced AI Chatbot with comprehensive data access
// Provides intelligent responses with access to salons, services, prices, booking schedules, and more

import { FilterValues } from '@/components/FilterBar/FilterBar';

export interface EnhancedChatIntent {
  type: 
    | 'greeting' 
    | 'salon_info' 
    | 'service_query'
    | 'price_query'
    | 'booking_query'
    | 'salon_profile'
    | 'images_gallery'
    | 'reviews_query'
    | 'location_query'
    | 'availability_query'
    | 'book_appointment'
    | 'help'
    | 'unknown';
  
  response: string;
  data?: any;
  filters?: Partial<FilterValues>;
  quickActions?: string[];
  requiresAuth?: boolean;
  salonId?: string;
  serviceId?: string;
  actionType?: 'view_salon' | 'view_services' | 'view_gallery' | 'view_reviews' | 'book_now' | 'show_prices';
}

/**
 * Enhanced intent parser with comprehensive understanding
 */
export function parseEnhancedInput(input: string, context?: {
  userId?: string;
  userLocation?: { lat: number; lng: number };
  currentSalon?: any;
}): EnhancedChatIntent {
  const lowerInput = input.toLowerCase().trim();

  // Greeting detection
  if (/^(hi|hello|hey|howzit|sawubona|good (morning|afternoon|evening))$/i.test(lowerInput)) {
    return {
      type: 'greeting',
      response: `👋 Hello! I'm your personal beauty assistant. I can help you with:
      
✅ Finding salons near you
✅ Viewing salon profiles, services, and prices
✅ Checking availability and booking schedules
✅ Viewing salon galleries and reviews
✅ Making bookings directly from chat
✅ Comparing services and prices

What would you like to do today?`,
      quickActions: [
        'Find salons near me',
        'View salon profiles',
        'Check prices',
        'Book an appointment'
      ]
    };
  }

  // Salon profile requests
  if (/show (me )?(salon )?profile|view (salon )?profile|salon (details|info)/i.test(lowerInput)) {
    return {
      type: 'salon_profile',
      response: 'I can show you detailed salon profiles including services, prices, gallery, reviews, and booking options. Which salon would you like to know more about?',
      actionType: 'view_salon',
      quickActions: [
        'Find top-rated salons',
        'Salons near me',
        'Featured salons'
      ]
    };
  }

  // Service and price queries
  if (/how much|price|cost|rate|pricing|charges/i.test(lowerInput)) {
    return {
      type: 'price_query',
      response: `💰 I can help you find service prices! I have access to:
      
• Detailed service pricing from all salons
• Price comparisons across providers
• Special offers and promotions
• Package deals

What service are you interested in pricing for?`,
      actionType: 'show_prices',
      quickActions: [
        'Hair braiding prices',
        'Nail services prices',
        'Show affordable options',
        'View promotions'
      ]
    };
  }

  // Gallery and images
  if (/show (me )?(pictures|photos|images|gallery)|view gallery|see (their )?work/i.test(lowerInput)) {
    return {
      type: 'images_gallery',
      response: `📸 I can show you salon galleries including:
      
• Before & after photos
• Service showcases
• Salon interior photos
• Stylist work portfolios

Which salon's gallery would you like to view?`,
      actionType: 'view_gallery',
      quickActions: [
        'Top-rated salons with galleries',
        'Recent work photos',
        'Before & after transformations'
      ]
    };
  }

  // Booking and availability
  if (/book|appointment|schedule|available|open|when can i|availability/i.test(lowerInput)) {
    return {
      type: 'booking_query',
      response: `📅 I can help you book appointments! I have access to:
      
• Real-time salon availability
• Operating hours and schedules
• Booking time slots
• Direct booking capability

${context?.userId 
  ? 'Ready to book! Which salon would you like to book with?' 
  : 'Please log in to make a booking. Would you like to browse available salons first?'}`,
      actionType: 'book_now',
      requiresAuth: true,
      quickActions: context?.userId 
        ? ['Find available salons', 'Book now', 'View my bookings']
        : ['Find salons', 'View operating hours', 'Login to book']
    };
  }

  // Reviews and ratings
  if (/reviews?|ratings?|feedback|testimonials?|what (do )?people (think|say)/i.test(lowerInput)) {
    return {
      type: 'reviews_query',
      response: `⭐ I can show you salon reviews and ratings including:
      
• Customer reviews and ratings
• Service-specific feedback
• Overall salon ratings
• Recent reviews

Which salon's reviews would you like to see?`,
      actionType: 'view_reviews',
      quickActions: [
        'Top-rated salons',
        'Recent reviews',
        'Best reviewed services'
      ]
    };
  }

  // Services query
  if (/services?|what (do they|does|can)|offer/i.test(lowerInput)) {
    return {
      type: 'service_query',
      response: `💇‍♀️ I can show you all available services including:
      
• Complete service catalogs
• Service descriptions
• Duration and pricing
• Service categories (Hair, Nails, Spa, etc.)

What type of service are you looking for?`,
      actionType: 'view_services',
      quickActions: [
        'Hair services',
        'Nail services',
        'Spa services',
        'All services'
      ]
    };
  }

  // Help request
  if (/help|what can you do|how (do|can) (i|you)|capabilities/i.test(lowerInput)) {
    return {
      type: 'help',
      response: `🤖 Here's everything I can help you with:

**Find & Explore:**
• "Find salons near me"
• "Show salon profiles"
• "View service listings"

**Prices & Services:**
• "How much does braiding cost?"
• "Show me prices"
• "Compare service prices"

**Gallery & Reviews:**
• "Show salon photos"
• "View before & after"
• "Read reviews"

**Booking:**
• "Book an appointment"
• "Check availability"
• "View booking schedule"

**Navigation:**
• Direct access to any salon page
• View services, prices, gallery, reviews
• Make bookings right from chat

Try asking me anything!`,
      quickActions: [
        'Find salons',
        'View services',
        'Check prices',
        'Book appointment'
      ]
    };
  }

  // Default: treat as search query
  return {
    type: 'salon_info',
    response: `🔍 Let me help you find what you're looking for. I can search for salons, services, and more.

Try being more specific, for example:
• "Find braiding salons in Sandton"
• "Show me nail salons near me"
• "What are the prices for haircuts?"
• "Book an appointment for tomorrow"`,
    quickActions: [
      'Find salons near me',
      'View all services',
      'Check prices',
      'Help'
    ]
  };
}

/**
 * Get salon details for display in chat
 */
export async function getSalonDetails(salonId: string) {
  try {
    const response = await fetch(`/api/salons/${salonId}`);
    if (!response.ok) throw new Error('Failed to fetch salon');
    return await response.json();
  } catch (error) {
    console.error('Error fetching salon details:', error);
    return null;
  }
}

/**
 * Get salon services with prices
 */
export async function getSalonServices(salonId: string) {
  try {
    const response = await fetch(`/api/salons/${salonId}/services`);
    if (!response.ok) throw new Error('Failed to fetch services');
    return await response.json();
  } catch (error) {
    console.error('Error fetching services:', error);
    return null;
  }
}

/**
 * Get salon gallery images
 */
export async function getSalonGallery(salonId: string) {
  try {
    const response = await fetch(`/api/salons/${salonId}/gallery`);
    if (!response.ok) throw new Error('Failed to fetch gallery');
    return await response.json();
  } catch (error) {
    console.error('Error fetching gallery:', error);
    return null;
  }
}

/**
 * Get salon reviews
 */
export async function getSalonReviews(salonId: string) {
  try {
    const response = await fetch(`/api/salons/${salonId}/reviews`);
    if (!response.ok) throw new Error('Failed to fetch reviews');
    return await response.json();
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return null;
  }
}

/**
 * Get salon booking availability
 */
export async function getSalonAvailability(salonId: string, date?: string) {
  try {
    const params = new URLSearchParams();
    if (date) params.append('date', date);
    
    const response = await fetch(`/api/salons/${salonId}/availability?${params.toString()}`);
    if (!response.ok) throw new Error('Failed to fetch availability');
    return await response.json();
  } catch (error) {
    console.error('Error fetching availability:', error);
    return null;
  }
}

/**
 * Format salon data for chat display
 */
export function formatSalonForChat(salon: any) {
  return {
    id: salon.id,
    name: salon.name,
    description: salon.description || 'No description available',
    address: salon.address || `${salon.city}, ${salon.province}`,
    rating: salon.avgRating || 'No rating yet',
    reviewCount: salon.reviews?.length || 0,
    services: salon.services || [],
    operatingHours: salon.operatingHours || {},
    phone: salon.phoneNumber,
    email: salon.email,
    offersMobile: salon.offersMobile || false
  };
}

/**
 * Format services with prices for chat display
 */
export function formatServicesForChat(services: any[]) {
  return services.map(service => ({
    id: service.id,
    name: service.name,
    description: service.description || 'No description',
    price: service.price ? `R${service.price}` : 'Price on request',
    duration: service.duration || 'Duration varies',
    category: service.category || 'General'
  }));
}

/**
 * Generate quick action buttons based on context
 */
export function getContextualActions(context: {
  type: string;
  hasSalon?: boolean;
  hasServices?: boolean;
  isLoggedIn?: boolean;
}) {
  const actions: string[] = [];

  if (context.hasSalon) {
    actions.push('View services', 'See gallery', 'Read reviews');
    if (context.isLoggedIn) {
      actions.push('Book now');
    }
  } else {
    actions.push('Find salons near me', 'Browse services');
  }

  if (context.hasServices) {
    actions.push('Compare prices', 'View details');
  }

  return actions.slice(0, 4); // Max 4 actions
}
