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
    | 'promotions_query'
    | 'products_query'
    | 'trends_query'
    | 'help'
    | 'unknown';
  
  response: string;
  data?: any;
  filters?: Partial<FilterValues>;
  quickActions?: string[];
  requiresAuth?: boolean;
  salonId?: string;
  serviceId?: string;
  actionType?: 'view_salon' | 'view_services' | 'view_gallery' | 'view_reviews' | 'book_now' | 'show_prices' | 'view_promotions' | 'view_products' | 'view_trends';
}

/**
 * Comprehensive category mapping for better service matching
 */
const CATEGORY_KEYWORDS: Record<string, string[]> = {
  'Hair Care & Styling': [
    'hair', 'haircut', 'hairstyle', 'hairdo', 'cut', 'trim', 'style', 'styling',
    'blowdry', 'blow dry', 'blowout', 'wash', 'shampoo', 'condition', 'treatment',
    'curls', 'straighten', 'perm', 'relaxer', 'keratin', 'rebonding',
    'color', 'colour', 'dye', 'tint', 'highlight', 'balayage', 'ombre', 'bleach',
    'extensions', 'weave', 'wig', 'closure', 'frontal', 'bundles'
  ],
  'Braiding & Protective Styles': [
    'braid', 'braids', 'braiding', 'cornrows', 'cornrow', 'box braids',
    'senegalese', 'twists', 'twist', 'locs', 'locks', 'dreadlocks', 'dreads',
    'crochet', 'faux locs', 'passion twists', 'marley twists', 'havana twists',
    'goddess braids', 'knotless', 'feed-in', 'fulani', 'tribal braids',
    'protective style', 'natural hair'
  ],
  'Nails & Manicure': [
    'nail', 'nails', 'manicure', 'mani', 'pedicure', 'pedi', 'mani pedi',
    'gel', 'gel nails', 'acrylic', 'acrylics', 'shellac', 'nail art',
    'nail polish', 'nail design', 'french tips', 'ombre nails', 'chrome nails',
    'nail extensions', 'nail overlay', 'nail removal', 'nail care',
    'cuticle care', 'hand spa', 'foot spa'
  ],
  'Spa & Wellness': [
    'spa', 'massage', 'facial', 'body scrub', 'body wrap', 'sauna',
    'steam', 'hot stone', 'aromatherapy', 'reflexology', 'swedish massage',
    'deep tissue', 'thai massage', 'relaxation', 'wellness', 'detox',
    'body treatment', 'skin treatment', 'spa package', 'spa day'
  ],
  'Makeup & Beauty': [
    'makeup', 'make up', 'make-up', 'mua', 'beauty', 'cosmetics',
    'foundation', 'contour', 'eyeshadow', 'eyeliner', 'mascara', 'lipstick',
    'blush', 'highlighter', 'glam', 'bridal makeup', 'wedding makeup',
    'party makeup', 'special occasion', 'eyebrows', 'brows', 'lashes',
    'eyelash extensions', 'lash lift', 'brow tint', 'brow lamination'
  ],
  'Skincare': [
    'skincare', 'skin care', 'facial', 'face', 'acne', 'anti-aging',
    'hydration', 'cleansing', 'exfoliation', 'mask', 'serum', 'moisturizer',
    'peel', 'chemical peel', 'microdermabrasion', 'dermaplaning',
    'laser treatment', 'led therapy', 'skin analysis', 'consultation',
    'pigmentation', 'dark spots', 'wrinkles', 'fine lines'
  ],
  'Waxing & Hair Removal': [
    'wax', 'waxing', 'brazilian', 'bikini', 'leg wax', 'arm wax',
    'underarm', 'full body wax', 'face wax', 'eyebrow wax', 'upper lip',
    'hair removal', 'threading', 'laser hair removal', 'ipl', 'sugaring'
  ],
  'Barber Services': [
    'barber', 'barbering', 'fade', 'taper', 'line up', 'edge up',
    'beard', 'beard trim', 'beard shaping', 'shave', 'hot towel shave',
    'mens haircut', 'mens grooming', 'boys haircut', 'kids haircut',
    'low fade', 'high fade', 'mid fade', 'skin fade', 'afro', 'shape up'
  ],
  'Special Occasions': [
    'wedding', 'bridal', 'bride', 'bridesmaid', 'wedding party',
    'prom', 'matric dance', 'graduation', 'birthday', 'photoshoot',
    'event', 'special event', 'party', 'occasion', 'formal event'
  ]
};

/**
 * Extract service category from user input
 */
function extractCategoryFromText(text: string): string | undefined {
  const lowerText = text.toLowerCase();
  
  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    if (keywords.some(keyword => {
      // Check for whole word matches or phrase matches
      const regex = new RegExp(`\\b${keyword.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')}\\b`, 'i');
      return regex.test(lowerText);
    })) {
      return category;
    }
  }
  
  return undefined;
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
    const locationAvailable = context?.userLocation ? 
      `📍 I can see your location - I'll find the best salons near you!` : 
      `💡 Tip: Ask me to "find salons near me" to use your current location for better results!`;
    
    return {
      type: 'greeting',
      response: `👋 Hello! I'm your personal beauty assistant. ${locationAvailable}

I can help you with:
      
✅ Finding salons near you
✅ Viewing salon profiles, services, and prices
✅ Checking availability and booking schedules
✅ Viewing salon galleries and reviews
✅ Making bookings directly from chat
✅ Comparing services and prices
✅ Finding promotions and deals
✅ Browsing beauty products
✅ Discovering latest trends

What would you like to do today?`,
      quickActions: [
        'Find salons near me',
        'Show promotions',
        'View services',
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
  if (/services?|what (do they|does|can)|offer|treatment/i.test(lowerInput)) {
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

  // Promotions and deals
  if (/promotion|deal|discount|special|offer|sale|save|cheap/i.test(lowerInput)) {
    return {
      type: 'promotions_query',
      response: `🎉 I can show you current promotions and deals! I have access to:
      
• Active promotions from salons
• Service discounts
• Product specials
• Limited-time offers

Let me find the best deals for you!`,
      actionType: 'view_promotions',
      quickActions: [
        'Show all promotions',
        'Find deals near me',
        'Service discounts',
        'Product specials'
      ]
    };
  }

  // Products query
  if (/products?|buy|shop|store|purchase|sell|selling/i.test(lowerInput)) {
    return {
      type: 'products_query',
      response: `🛍️ I can help you find products! I have access to:
      
• Beauty products for sale
• Hair care products
• Product catalogs
• Pricing and availability

What products are you looking for?`,
      actionType: 'view_products',
      quickActions: [
        'Browse all products',
        'Hair products',
        'Beauty products',
        'Products in stock'
      ]
    };
  }

  // Trends query
  if (/trend|trending|style|fashion|latest|new|popular|what's (hot|in)/i.test(lowerInput)) {
    return {
      type: 'trends_query',
      response: `✨ I can show you the latest beauty trends! I have access to:
      
• Trending hairstyles
• Popular nail designs
• Latest beauty trends
• Trend categories (Hair, Nails, Makeup, etc.)

What trends are you interested in?`,
      actionType: 'view_trends',
      quickActions: [
        'Show all trends',
        'Hair trends',
        'Nail trends',
        'Latest trends'
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
• "Show featured salons"

**Services & Prices:**
• "How much does braiding cost?"
• "Show me prices"
• "Compare service prices"
• "Search for hair services"
• "Find nail services"

**Gallery & Reviews:**
• "Show salon photos"
• "View before & after"
• "Read reviews"
• "View salon gallery"

**Promotions & Deals:**
• "Show me promotions"
• "Find deals"
• "What discounts are available?"
• "Show current specials"

**Products:**
• "Browse products"
• "Show beauty products"
• "Find hair products"
• "Products in stock"

**Trends:**
• "Show me trends"
• "What's trending?"
• "Latest hairstyles"
• "Popular nail designs"

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
        'Show promotions',
        'Book appointment'
      ]
    };
  }

  // Location-based queries (near me)
  if (/near me|nearby|close to me|around here|my location|current location/i.test(lowerInput)) {
    if (context?.userLocation) {
      return {
        type: 'location_query',
        response: `📍 I'll help you find salons near your location! I can search for salons, services, and more based on where you are.

What are you looking for?`,
        quickActions: [
          'Find salons near me',
          'Hair salons nearby',
          'Nail salons close by',
          'Spas near me'
        ],
        filters: {
          sortBy: 'distance',
          latitude: context.userLocation.lat,
          longitude: context.userLocation.lng,
          radius: 10 // 10km radius
        }
      };
    } else {
      return {
        type: 'location_query',
        response: `📍 I can help you find salons near you! To give you the best results, I'll need access to your location.

Please allow location access when prompted, or tell me a specific city/area you'd like to search in.

For example:
• "Find braiding salons in Sandton"
• "Show me nail salons in Johannesburg"
• "What are the prices for haircuts?"`,
        quickActions: [
          'Find salons near me',
          'Search in Johannesburg',
          'Search in Sandton',
          'View all services'
        ]
      };
    }
  }

  // Default: treat as search query with intelligent category detection
  const detectedCategory = extractCategoryFromText(input);
  const locationHint = context?.userLocation 
    ? ' I can also search near your location if you ask for "near me"!'
    : '';
  
  const filters: any = {
    q: input
  };
  
  // Add detected category to filters
  if (detectedCategory) {
    filters.category = detectedCategory;
  }
  
  // Add location if available
  if (context?.userLocation) {
    filters.latitude = context.userLocation.lat;
    filters.longitude = context.userLocation.lng;
    filters.radius = 10; // 10km radius
  }
  
  const categoryMessage = detectedCategory 
    ? `\n\n📂 I detected you're looking for: **${detectedCategory}**` 
    : '';
    
  return {
    type: 'salon_info',
    response: `🔍 I'll help you search for: "${input}"${categoryMessage}

Let me find the best matches for you!${locationHint}`,
    filters,
    quickActions: detectedCategory
      ? [
          `Show all ${detectedCategory}`,
          'Filter by price',
          'Near me',
          'View details'
        ]
      : [
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
 * Get salon reviews (included in salon details)
 */
export async function getSalonReviews(salonId: string) {
  try {
    const salon = await getSalonDetails(salonId);
    return salon?.reviews || [];
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return null;
  }
}

/**
 * Get service booking availability
 */
export async function getServiceAvailability(serviceId: string, date?: string) {
  try {
    const params = new URLSearchParams();
    if (date) params.append('date', date);
    
    const response = await fetch(`/api/bookings/availability/${serviceId}?${params.toString()}`);
    if (!response.ok) throw new Error('Failed to fetch availability');
    return await response.json();
  } catch (error) {
    console.error('Error fetching availability:', error);
    return null;
  }
}

/**
 * Get all public promotions
 */
export async function getPromotions(salonId?: string) {
  try {
    const params = new URLSearchParams();
    if (salonId) params.append('salonId', salonId);
    
    const response = await fetch(`/api/promotions/public?${params.toString()}`);
    if (!response.ok) throw new Error('Failed to fetch promotions');
    return await response.json();
  } catch (error) {
    console.error('Error fetching promotions:', error);
    return null;
  }
}

/**
 * Get all approved products
 */
export async function getProducts(filters?: {
  category?: string;
  priceMin?: string;
  priceMax?: string;
  search?: string;
  inStock?: string;
}) {
  try {
    const params = new URLSearchParams();
    if (filters?.category) params.append('category', filters.category);
    if (filters?.priceMin) params.append('priceMin', filters.priceMin);
    if (filters?.priceMax) params.append('priceMax', filters.priceMax);
    if (filters?.search) params.append('q', filters.search);
    if (filters?.inStock) params.append('inStock', filters.inStock);
    
    const response = await fetch(`/api/products?${params.toString()}`);
    if (!response.ok) throw new Error('Failed to fetch products');
    return await response.json();
  } catch (error) {
    console.error('Error fetching products:', error);
    return null;
  }
}

/**
 * Get all active trends
 */
export async function getTrends(category?: string) {
  try {
    const url = category 
      ? `/api/trends/category/${category}`
      : '/api/trends';
    
    const response = await fetch(url);
    if (!response.ok) throw new Error('Failed to fetch trends');
    const data = await response.json();
    
    // If fetching all trends, it returns grouped by category, so flatten it
    if (!category && typeof data === 'object') {
      return Object.values(data).flat();
    }
    return data;
  } catch (error) {
    console.error('Error fetching trends:', error);
    return null;
  }
}

/**
 * Search for services with location support
 */
export async function searchServices(filters?: {
  q?: string;
  category?: string;
  categoryId?: string;
  priceMin?: string;
  priceMax?: string;
  province?: string;
  city?: string;
  sortBy?: string;
  latitude?: number;
  longitude?: number;
  radius?: number;
}) {
  try {
    const params = new URLSearchParams();
    if (filters?.q) params.append('q', filters.q);
    if (filters?.category) params.append('category', filters.category);
    if (filters?.categoryId) params.append('categoryId', filters.categoryId);
    if (filters?.priceMin) params.append('priceMin', filters.priceMin);
    if (filters?.priceMax) params.append('priceMax', filters.priceMax);
    if (filters?.province) params.append('province', filters.province);
    if (filters?.city) params.append('city', filters.city);
    
    // Location-based filtering
    if (filters?.latitude !== undefined && filters?.longitude !== undefined) {
      params.append('latitude', filters.latitude.toString());
      params.append('longitude', filters.longitude.toString());
      if (filters?.radius) {
        params.append('radius', filters.radius.toString());
      }
      // Sort by distance when location is provided
      params.append('sortBy', 'distance');
    } else if (filters?.sortBy) {
      params.append('sortBy', filters.sortBy);
    }
    
    const response = await fetch(`/api/services/search?${params.toString()}`);
    if (!response.ok) throw new Error('Failed to search services');
    return await response.json();
  } catch (error) {
    console.error('Error searching services:', error);
    return null;
  }
}

/**
 * Get featured salons
 */
export async function getFeaturedSalons() {
  try {
    const response = await fetch('/api/salons/featured');
    if (!response.ok) throw new Error('Failed to fetch featured salons');
    return await response.json();
  } catch (error) {
    console.error('Error fetching featured salons:', error);
    return null;
  }
}

/**
 * Get featured services
 */
export async function getFeaturedServices() {
  try {
    const response = await fetch('/api/services/featured');
    if (!response.ok) throw new Error('Failed to fetch featured services');
    return await response.json();
  } catch (error) {
    console.error('Error fetching featured services:', error);
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
