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
    | 'site_info'
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

// Site information for accurate responses
const SITE_INFO = {
  name: 'Stylr SA',
  description: 'South Africa\'s premier destination for luxury beauty & wellness',
  features: [
    'Find and book appointments at top-rated salons',
    'Browse services with real prices',
    'View salon galleries and reviews',
    'Discover trending hairstyles and beauty trends',
    'Shop beauty products',
    'Find promotions and deals'
  ],
  serviceCategories: [
    'Hair Care & Styling',
    'Braiding & Protective Styles',
    'Nails & Manicure',
    'Spa & Wellness',
    'Makeup & Beauty',
    'Skincare',
    'Waxing & Hair Removal',
    'Barber Services'
  ]
};


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
    'nail extensions', 'nail overlay', 'nail removal', 'nail care'
  ],
  'Spa & Wellness': [
    'spa', 'massage', 'facial', 'body scrub', 'body wrap', 'sauna',
    'steam', 'hot stone', 'aromatherapy', 'reflexology', 'swedish massage',
    'deep tissue', 'thai massage', 'relaxation', 'wellness', 'detox'
  ],
  'Makeup & Beauty': [
    'makeup', 'make up', 'make-up', 'mua', 'beauty', 'cosmetics',
    'foundation', 'contour', 'eyeshadow', 'eyeliner', 'mascara', 'lipstick',
    'blush', 'highlighter', 'glam', 'bridal makeup', 'wedding makeup',
    'eyebrows', 'brows', 'lashes', 'eyelash extensions', 'lash lift'
  ],
  'Barber Services': [
    'barber', 'barbering', 'fade', 'taper', 'line up', 'edge up',
    'beard', 'beard trim', 'beard shaping', 'shave', 'hot towel shave',
    'mens haircut', 'mens grooming', 'boys haircut', 'kids haircut'
  ]
};

/**
 * South African locations for better matching
 */
const SA_LOCATIONS: Record<string, string[]> = {
  'Gauteng': ['johannesburg', 'joburg', 'jozi', 'pretoria', 'pta', 'sandton', 'midrand', 'centurion', 'soweto', 'randburg', 'roodepoort', 'fourways', 'rosebank', 'braamfontein', 'melville', 'parkhurst'],
  'Western Cape': ['cape town', 'capetown', 'cpt', 'stellenbosch', 'paarl', 'somerset west', 'bellville', 'claremont', 'sea point', 'camps bay', 'waterfront'],
  'KwaZulu-Natal': ['durban', 'dbn', 'umhlanga', 'ballito', 'pietermaritzburg', 'pmb', 'pinetown', 'westville'],
  'Eastern Cape': ['port elizabeth', 'pe', 'east london', 'gqeberha'],
  'Free State': ['bloemfontein', 'bloem'],
  'Mpumalanga': ['nelspruit', 'mbombela', 'witbank', 'emalahleni'],
  'Limpopo': ['polokwane', 'pietersburg'],
  'North West': ['rustenburg', 'potchefstroom', 'klerksdorp'],
  'Northern Cape': ['kimberley', 'upington']
};


/**
 * Extract service category from user input
 */
function extractCategoryFromText(text: string): string | undefined {
  const lowerText = text.toLowerCase();
  
  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    if (keywords.some(keyword => {
      const regex = new RegExp(`\\b${keyword.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')}\\b`, 'i');
      return regex.test(lowerText);
    })) {
      return category;
    }
  }
  return undefined;
}

/**
 * Extract location from user input
 */
function extractLocationFromText(text: string): { city?: string; province?: string } | undefined {
  const lowerText = text.toLowerCase();
  
  for (const [province, cities] of Object.entries(SA_LOCATIONS)) {
    for (const city of cities) {
      if (lowerText.includes(city)) {
        // Map common abbreviations to full names
        const cityMap: Record<string, string> = {
          'joburg': 'Johannesburg', 'jozi': 'Johannesburg',
          'pta': 'Pretoria', 'cpt': 'Cape Town', 'capetown': 'Cape Town',
          'dbn': 'Durban', 'pe': 'Port Elizabeth', 'bloem': 'Bloemfontein',
          'pmb': 'Pietermaritzburg'
        };
        const normalizedCity = cityMap[city] || city.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
        return { city: normalizedCity, province };
      }
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
  const detectedCategory = extractCategoryFromText(input);
  const detectedLocation = extractLocationFromText(input);


  // Greeting detection
  if (/^(hi|hello|hey|howzit|sawubona|good (morning|afternoon|evening)|yo|sup)$/i.test(lowerInput)) {
    return {
      type: 'greeting',
      response: `👋 Hello! Welcome to ${SITE_INFO.name} - ${SITE_INFO.description}.

I can help you find real salons, services, and prices from our database. What would you like to do?`,
      quickActions: [
        'Find salons near me',
        'Browse services',
        'Show promotions',
        'What can you do?'
      ]
    };
  }

  // Site info / about queries
  if (/what (is|are) (this|stylr|the site)|about (stylr|this)|tell me about/i.test(lowerInput)) {
    return {
      type: 'site_info',
      response: `📱 **${SITE_INFO.name}** is ${SITE_INFO.description}.

**What you can do here:**
${SITE_INFO.features.map(f => `• ${f}`).join('\n')}

**Service Categories:**
${SITE_INFO.serviceCategories.slice(0, 4).map(c => `• ${c}`).join('\n')}
...and more!

How can I help you today?`,
      quickActions: ['Find salons', 'Browse services', 'View trends', 'Show promotions']
    };
  }

  // Help request
  if (/help|what can you do|how (do|can) (i|you)|capabilities/i.test(lowerInput)) {
    return {
      type: 'help',
      response: `🤖 I can help you with:

**Find Salons:**
• "Find salons in Sandton"
• "Hair salons near me"
• "Braiding salons in Johannesburg"

**Services & Prices:**
• "How much do braids cost?"
• "Show nail services"
• "Find affordable haircuts"

**Explore:**
• "Show promotions"
• "What's trending?"
• "Browse products"

**Book:**
• "Book an appointment"
• "Check availability"

Just ask naturally - I'll search our database for real results!`,
      quickActions: ['Find salons near me', 'Show services', 'View promotions', 'Browse trends']
    };
  }


  // Price queries
  if (/how much|price|cost|rate|pricing|charges|afford/i.test(lowerInput)) {
    const filters: any = {};
    if (detectedCategory) filters.category = detectedCategory;
    if (detectedLocation?.city) filters.city = detectedLocation.city;
    if (detectedLocation?.province) filters.province = detectedLocation.province;
    
    const categoryHint = detectedCategory ? ` for ${detectedCategory}` : '';
    const locationHint = detectedLocation?.city ? ` in ${detectedLocation.city}` : '';
    
    return {
      type: 'price_query',
      response: `💰 Let me search for prices${categoryHint}${locationHint}...

I'll show you real service prices from salons on our platform.`,
      actionType: 'show_prices',
      filters,
      quickActions: ['Show all prices', 'Affordable options', 'Premium services', 'Compare prices']
    };
  }

  // Promotions and deals
  if (/promotion|deal|discount|special|offer|sale|save/i.test(lowerInput)) {
    return {
      type: 'promotions_query',
      response: `🎉 Let me find current promotions and deals for you...

I'll search for active discounts from salons on our platform.`,
      actionType: 'view_promotions',
      quickActions: ['Show all promotions', 'Hair deals', 'Nail specials', 'Spa offers']
    };
  }

  // Products query
  if (/products?|buy|shop|store|purchase/i.test(lowerInput)) {
    return {
      type: 'products_query',
      response: `🛍️ Let me search for beauty products...

I'll show you products available from sellers on our platform.`,
      actionType: 'view_products',
      quickActions: ['Browse all products', 'Hair products', 'Skincare', 'View categories']
    };
  }

  // Trends query
  if (/trend|trending|style|fashion|latest|new|popular|what's (hot|in)/i.test(lowerInput)) {
    return {
      type: 'trends_query',
      response: `✨ Let me find the latest beauty trends...

I'll show you what's trending on our platform.`,
      actionType: 'view_trends',
      quickActions: ['Hair trends', 'Nail trends', 'Makeup trends', 'All trends']
    };
  }


  // Gallery and images
  if (/show (me )?(pictures|photos|images|gallery)|view gallery|see (their )?work|before.?after/i.test(lowerInput)) {
    return {
      type: 'images_gallery',
      response: `📸 To view a salon's gallery, I need to know which salon you're interested in.

Search for a salon first, then click on it to see their gallery, before & after photos, and work samples.`,
      actionType: 'view_gallery',
      quickActions: ['Find salons', 'Featured salons', 'Top-rated salons']
    };
  }

  // Reviews and ratings
  if (/reviews?|ratings?|feedback|testimonials?|what (do )?people (think|say)/i.test(lowerInput)) {
    return {
      type: 'reviews_query',
      response: `⭐ To view reviews, I need to know which salon you're interested in.

Search for a salon first, then click on it to see customer reviews and ratings.`,
      actionType: 'view_reviews',
      quickActions: ['Top-rated salons', 'Find salons', 'Featured salons']
    };
  }

  // Booking and availability
  if (/book|appointment|schedule|available|when can i|availability/i.test(lowerInput)) {
    const isLoggedIn = !!context?.userId;
    return {
      type: 'booking_query',
      response: isLoggedIn 
        ? `📅 To book an appointment, find a salon and select a service. I'll help you find the right salon!`
        : `📅 To book an appointment, you'll need to log in first. Would you like to browse salons in the meantime?`,
      actionType: 'book_now',
      requiresAuth: true,
      quickActions: isLoggedIn 
        ? ['Find salons near me', 'View my bookings', 'Featured salons']
        : ['Find salons', 'Login', 'Browse services']
    };
  }

  // Location-based queries (near me)
  if (/near me|nearby|close to me|around here|my location|current location/i.test(lowerInput)) {
    const filters: any = { sortBy: 'distance' };
    if (detectedCategory) filters.category = detectedCategory;
    if (context?.userLocation) {
      filters.lat = context.userLocation.lat;
      filters.lon = context.userLocation.lng;
      filters.radius = 15;
    }
    
    const categoryHint = detectedCategory ? ` ${detectedCategory}` : '';
    
    return {
      type: 'location_query',
      response: context?.userLocation 
        ? `📍 Searching for${categoryHint} salons near your location...`
        : `📍 I need your location to find salons near you. Please allow location access, or tell me a specific area (e.g., "salons in Sandton").`,
      filters,
      quickActions: context?.userLocation 
        ? ['Show results', 'Expand search radius', 'Filter by service']
        : ['Search in Johannesburg', 'Search in Sandton', 'Search in Cape Town', 'Allow location']
    };
  }


  // Service queries
  if (/services?|what (do they|does|can)|offer|treatment/i.test(lowerInput) || detectedCategory) {
    const filters: any = {};
    if (detectedCategory) filters.category = detectedCategory;
    if (detectedLocation?.city) filters.city = detectedLocation.city;
    if (detectedLocation?.province) filters.province = detectedLocation.province;
    
    const categoryHint = detectedCategory ? ` for ${detectedCategory}` : '';
    const locationHint = detectedLocation?.city ? ` in ${detectedLocation.city}` : '';
    
    return {
      type: 'service_query',
      response: `💇‍♀️ Searching${categoryHint} services${locationHint}...

I'll show you real services with prices from salons on our platform.`,
      actionType: 'view_services',
      filters,
      quickActions: detectedCategory 
        ? [`All ${detectedCategory}`, 'Compare prices', 'Near me', 'View salons']
        : ['Hair services', 'Nail services', 'Spa services', 'All services']
    };
  }

  // Default: treat as salon search with intelligent detection
  const filters: any = {};
  if (detectedCategory) filters.category = detectedCategory;
  if (detectedLocation?.city) filters.city = detectedLocation.city;
  if (detectedLocation?.province) filters.province = detectedLocation.province;
  if (context?.userLocation && !detectedLocation) {
    filters.lat = context.userLocation.lat;
    filters.lon = context.userLocation.lng;
  }
  
  // Extract any remaining search terms
  let searchTerm = input;
  if (detectedCategory) {
    // Remove category keywords from search
    for (const keyword of CATEGORY_KEYWORDS[detectedCategory] || []) {
      searchTerm = searchTerm.replace(new RegExp(`\\b${keyword}\\b`, 'gi'), '');
    }
  }
  if (detectedLocation?.city) {
    searchTerm = searchTerm.replace(new RegExp(detectedLocation.city, 'gi'), '');
  }
  searchTerm = searchTerm.replace(/\b(salon|salons|find|show|search|in|near|me|the|a|an)\b/gi, '').trim();
  if (searchTerm) filters.q = searchTerm;
  
  const categoryHint = detectedCategory ? ` ${detectedCategory}` : '';
  const locationHint = detectedLocation?.city ? ` in ${detectedLocation.city}` : '';
  
  return {
    type: 'salon_info',
    response: `🔍 Searching for${categoryHint} salons${locationHint}...

I'll find real salons matching your request from our database.`,
    filters,
    quickActions: ['View all results', 'Filter by price', 'Near me', 'Refine search']
  };
}


// ============ API Functions for fetching real data ============

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
    const response = await fetch(`/api/services/salon/${salonId}`);
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
    const response = await fetch(`/api/gallery/salon/${salonId}`);
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
    const salon = await getSalonDetails(salonId);
    return salon?.reviews || [];
  } catch (error) {
    console.error('Error fetching reviews:', error);
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
 * Search for services with filters
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
    if (filters?.sortBy) params.append('sortBy', filters.sortBy);
    
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


// ============ Formatting helpers ============

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
    reviewCount: salon.reviews?.length || salon.reviewCount || 0,
    services: salon.services || [],
    operatingHours: salon.operatingHours || {},
    phone: salon.phoneNumber,
    email: salon.contactEmail,
    offersMobile: salon.offersMobile || false
  };
}

/**
 * Format services with prices for chat display
 */
export function formatServicesForChat(services: any[]) {
  return services.map(service => ({
    id: service.id,
    name: service.title || service.name,
    description: service.description || 'No description',
    price: service.price ? `R${service.price}` : 'Price on request',
    duration: service.duration ? `${service.duration} min` : 'Duration varies',
    category: service.category?.name || service.category || 'General',
    salonId: service.salonId,
    salonName: service.salon?.name
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

  return actions.slice(0, 4);
}
