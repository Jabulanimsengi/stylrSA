// AI Assistant - Intent matching logic
// Maps user input to filter combinations (NO EXTERNAL AI APIs - 100% FREE)

import { FilterValues } from '@/components/FilterBar/FilterBar';
import { PROVINCES } from './locationData';

export interface ChatIntent {
  type: 'service' | 'location' | 'price' | 'availability' | 'greeting' | 'unknown';
  filters?: Partial<FilterValues>;
  response: string;
  quickActions?: string[];
}

// Service keywords mapping
const SERVICE_KEYWORDS: Record<string, { service?: string; category?: string; displayName: string }> = {
  // Hair services
  'braid': { service: 'braiding-weaving', displayName: 'Braiding' },
  'braiding': { service: 'braiding-weaving', displayName: 'Braiding' },
  'weave': { service: 'braiding-weaving', displayName: 'Weaving' },
  'weaving': { service: 'braiding-weaving', displayName: 'Weaving' },
  'hair': { displayName: 'Hair Services' },
  'hairstyle': { displayName: 'Hair Styling' },
  'haircut': { displayName: 'Haircut' },
  'cut': { displayName: 'Haircut' },
  'color': { displayName: 'Hair Coloring' },
  'dye': { displayName: 'Hair Coloring' },
  'balayage': { displayName: 'Balayage' },
  'highlights': { displayName: 'Hair Highlights' },
  'keratin': { displayName: 'Keratin Treatment' },
  'relaxer': { displayName: 'Hair Relaxer' },
  'perm': { displayName: 'Perming' },
  'extension': { displayName: 'Hair Extensions' },
  'extensions': { displayName: 'Hair Extensions' },
  'dreadlock': { displayName: 'Dreadlocks' },
  'dreads': { displayName: 'Dreadlocks' },
  'locs': { displayName: 'Locs' },
  
  // Nail services
  'nail': { service: 'nail-care', displayName: 'Nail Care' },
  'nails': { service: 'nail-care', displayName: 'Nail Care' },
  'manicure': { service: 'nail-care', displayName: 'Manicure' },
  'pedicure': { service: 'nail-care', displayName: 'Pedicure' },
  'gel': { service: 'nail-care', displayName: 'Gel Nails' },
  'acrylic': { service: 'nail-care', displayName: 'Acrylic Nails' },
  'nail art': { service: 'nail-care', displayName: 'Nail Art' },
  
  // Spa & Massage
  'spa': { category: 'spa', displayName: 'Spa' },
  'massage': { displayName: 'Massage' },
  'facial': { displayName: 'Facial' },
  'face': { displayName: 'Facial Treatment' },
  'skincare': { displayName: 'Skincare' },
  'wax': { displayName: 'Waxing' },
  'waxing': { displayName: 'Waxing' },
  
  // Makeup & Beauty
  'makeup': { displayName: 'Makeup' },
  'bridal': { displayName: 'Bridal Makeup' },
  'lash': { displayName: 'Lash Extensions' },
  'lashes': { displayName: 'Lash Extensions' },
  'brow': { displayName: 'Eyebrow Services' },
  'eyebrow': { displayName: 'Eyebrow Services' },
  'microblading': { displayName: 'Microblading' },
  
  // Barber
  'barber': { category: 'barbershop', displayName: 'Barbershop' },
  'shave': { category: 'barbershop', displayName: 'Shave' },
  'beard': { category: 'barbershop', displayName: 'Beard Grooming' },
};

// Location keywords - using your comprehensive locationData
const LOCATION_KEYWORDS: Record<string, { province?: string; city?: string; displayName: string }> = {
  // Gauteng major cities
  'johannesburg': { province: 'gauteng', city: 'johannesburg', displayName: 'Johannesburg' },
  'joburg': { province: 'gauteng', city: 'johannesburg', displayName: 'Johannesburg' },
  'jozi': { province: 'gauteng', city: 'johannesburg', displayName: 'Johannesburg' },
  'jhb': { province: 'gauteng', city: 'johannesburg', displayName: 'Johannesburg' },
  'sandton': { province: 'gauteng', city: 'sandton', displayName: 'Sandton' },
  'pretoria': { province: 'gauteng', city: 'pretoria', displayName: 'Pretoria' },
  'tshwane': { province: 'gauteng', city: 'pretoria', displayName: 'Pretoria' },
  'soweto': { province: 'gauteng', city: 'soweto', displayName: 'Soweto' },
  'midrand': { province: 'gauteng', city: 'midrand', displayName: 'Midrand' },
  'centurion': { province: 'gauteng', city: 'centurion', displayName: 'Centurion' },
  'fourways': { province: 'gauteng', city: 'fourways', displayName: 'Fourways' },
  'randburg': { province: 'gauteng', city: 'randburg', displayName: 'Randburg' },
  'roodepoort': { province: 'gauteng', city: 'roodepoort', displayName: 'Roodepoort' },
  'benoni': { province: 'gauteng', city: 'benoni', displayName: 'Benoni' },
  'boksburg': { province: 'gauteng', city: 'boksburg', displayName: 'Boksburg' },
  'germiston': { province: 'gauteng', city: 'germiston', displayName: 'Germiston' },
  'springs': { province: 'gauteng', city: 'springs', displayName: 'Springs' },
  'kempton park': { province: 'gauteng', city: 'kempton-park', displayName: 'Kempton Park' },
  'alexandra': { province: 'gauteng', city: 'alexandra', displayName: 'Alexandra' },
  'alex': { province: 'gauteng', city: 'alexandra', displayName: 'Alexandra' },
  'katlehong': { province: 'gauteng', city: 'katlehong', displayName: 'Katlehong' },
  'tembisa': { province: 'gauteng', city: 'tembisa', displayName: 'Tembisa' },
  'rosebank': { province: 'gauteng', city: 'rosebank', displayName: 'Rosebank' },
  
  // Western Cape
  'cape town': { province: 'western-cape', city: 'cape-town', displayName: 'Cape Town' },
  'ct': { province: 'western-cape', city: 'cape-town', displayName: 'Cape Town' },
  'stellenbosch': { province: 'western-cape', city: 'stellenbosch', displayName: 'Stellenbosch' },
  
  // KZN
  'durban': { province: 'kwazulu-natal', city: 'durban', displayName: 'Durban' },
  'umhlanga': { province: 'kwazulu-natal', city: 'umhlanga', displayName: 'Umhlanga' },
  'pietermaritzburg': { province: 'kwazulu-natal', city: 'pietermaritzburg', displayName: 'Pietermaritzburg' },
  'pmb': { province: 'kwazulu-natal', city: 'pietermaritzburg', displayName: 'Pietermaritzburg' },
  
  // Other provinces
  'gauteng': { province: 'gauteng', displayName: 'Gauteng' },
  'western cape': { province: 'western-cape', displayName: 'Western Cape' },
  'kwazulu natal': { province: 'kwazulu-natal', displayName: 'KwaZulu-Natal' },
  'kzn': { province: 'kwazulu-natal', displayName: 'KwaZulu-Natal' },
  'eastern cape': { province: 'eastern-cape', displayName: 'Eastern Cape' },
  'port elizabeth': { province: 'eastern-cape', city: 'port-elizabeth', displayName: 'Port Elizabeth' },
  'pe': { province: 'eastern-cape', city: 'port-elizabeth', displayName: 'Port Elizabeth' },
  'east london': { province: 'eastern-cape', city: 'east-london', displayName: 'East London' },
};

// Price keywords
const PRICE_KEYWORDS: Record<string, { priceMin?: string; priceMax?: string; displayName: string }> = {
  'cheap': { priceMax: '300', displayName: 'Budget-Friendly (under R300)' },
  'affordable': { priceMax: '500', displayName: 'Affordable (under R500)' },
  'budget': { priceMax: '500', displayName: 'Budget-Friendly (under R500)' },
  'expensive': { priceMin: '1000', displayName: 'Premium (R1000+)' },
  'luxury': { priceMin: '1500', displayName: 'Luxury (R1500+)' },
  'premium': { priceMin: '1000', displayName: 'Premium (R1000+)' },
  'mid-range': { priceMin: '500', priceMax: '1000', displayName: 'Mid-Range (R500-R1000)' },
};

// Availability keywords
const AVAILABILITY_KEYWORDS: Record<string, { openNow?: boolean; offersMobile?: boolean; displayName: string }> = {
  'open': { openNow: true, displayName: 'Open Now' },
  'open now': { openNow: true, displayName: 'Open Now' },
  'available': { openNow: true, displayName: 'Available Now' },
  'mobile': { offersMobile: true, displayName: 'Mobile Service' },
  'home service': { offersMobile: true, displayName: 'Mobile/Home Service' },
  'comes to me': { offersMobile: true, displayName: 'Mobile Service' },
};

// Greeting patterns
const GREETINGS = ['hi', 'hello', 'hey', 'howzit', 'sawubona', 'good morning', 'good afternoon', 'good evening'];

// Question patterns
const QUESTIONS = ['help', 'what', 'how', 'where', 'find', 'search', 'looking for', 'need', 'want'];

/**
 * Parse user input and extract intent + filters
 */
export function parseUserInput(input: string): ChatIntent {
  const lowerInput = input.toLowerCase().trim();
  
  // Check for greetings
  if (GREETINGS.some(g => lowerInput.includes(g) || lowerInput === g)) {
    return {
      type: 'greeting',
      response: "Hi there! 👋 I'm here to help you find the perfect salon or beauty service. What are you looking for today?",
      quickActions: [
        'Find braiding salons near me',
        'Nail salons in Johannesburg',
        'Spas open now',
        'Affordable hair salons'
      ]
    };
  }
  
  // Initialize filters
  const filters: Partial<FilterValues> = {
    province: '',
    city: '',
    service: '',
    category: '',
    offersMobile: false,
    openNow: false,
    priceMin: '',
    priceMax: '',
    sortBy: '',
    radius: 10,
  };
  
  let detectedService: string | null = null;
  let detectedLocation: string | null = null;
  let detectedPrice: string | null = null;
  let detectedAvailability: string | null = null;
  
  // Check for "near me" first
  const nearMe = lowerInput.includes('near me') || lowerInput.includes('nearby') || lowerInput.includes('close to me');
  
  // Extract service
  for (const [keyword, data] of Object.entries(SERVICE_KEYWORDS)) {
    if (lowerInput.includes(keyword)) {
      if (data.service) filters.service = data.service;
      if (data.category) filters.category = data.category;
      detectedService = data.displayName;
      break;
    }
  }
  
  // Extract location (if not "near me")
  if (!nearMe) {
    for (const [keyword, data] of Object.entries(LOCATION_KEYWORDS)) {
      if (lowerInput.includes(keyword)) {
        if (data.province) filters.province = data.province;
        if (data.city) filters.city = data.city;
        detectedLocation = data.displayName;
        break;
      }
    }
  }
  
  // Extract price
  for (const [keyword, data] of Object.entries(PRICE_KEYWORDS)) {
    if (lowerInput.includes(keyword)) {
      if (data.priceMin) filters.priceMin = data.priceMin;
      if (data.priceMax) filters.priceMax = data.priceMax;
      detectedPrice = data.displayName;
      break;
    }
  }
  
  // Extract availability
  for (const [keyword, data] of Object.entries(AVAILABILITY_KEYWORDS)) {
    if (lowerInput.includes(keyword)) {
      if (data.openNow !== undefined) filters.openNow = data.openNow;
      if (data.offersMobile !== undefined) filters.offersMobile = data.offersMobile;
      detectedAvailability = data.displayName;
      break;
    }
  }
  
  // Build response
  const parts: string[] = [];
  
  if (nearMe) {
    parts.push("🔍 Using your location");
  }
  
  if (detectedService) {
    parts.push(`💅 ${detectedService}`);
  }
  
  if (detectedLocation) {
    parts.push(`📍 ${detectedLocation}`);
  }
  
  if (detectedPrice) {
    parts.push(`💰 ${detectedPrice}`);
  }
  
  if (detectedAvailability) {
    parts.push(`⏰ ${detectedAvailability}`);
  }
  
  // No filters detected
  if (parts.length === 0) {
    return {
      type: 'unknown',
      response: "I can help you find salons! Try asking:\n• 'Find braiding salons near me'\n• 'Nail salons in Sandton'\n• 'Spas open now'\n• 'Affordable hair salons in Johannesburg'",
      quickActions: [
        'Hair salons near me',
        'Nail salons in Johannesburg',
        'Spas in Sandton',
        'Braiding salons'
      ]
    };
  }
  
  // Build response message
  let response = `Perfect! I found salons matching:\n${parts.join('\n')}`;
  
  // Add suggestion for refinement
  const suggestions: string[] = [];
  if (!detectedLocation && !nearMe) suggestions.push('Add location');
  if (!detectedPrice) suggestions.push('Set budget');
  if (!detectedAvailability) suggestions.push('Filter by availability');
  
  if (suggestions.length > 0) {
    response += `\n\nRefine your search: ${suggestions.join(' • ')}`;
  }
  
  // Determine intent type
  let type: ChatIntent['type'] = 'unknown';
  if (detectedService) type = 'service';
  else if (detectedLocation || nearMe) type = 'location';
  else if (detectedPrice) type = 'price';
  else if (detectedAvailability) type = 'availability';
  
  // Generate quick actions based on what's missing
  const quickActions: string[] = [];
  if (detectedService && !detectedLocation) {
    quickActions.push(`${detectedService} near me`, `${detectedService} in Johannesburg`);
  }
  if (detectedLocation && !detectedService) {
    quickActions.push(`Hair salons in ${detectedLocation}`, `Nail salons in ${detectedLocation}`);
  }
  if (!detectedPrice) {
    quickActions.push('Show affordable options', 'Show luxury salons');
  }
  if (!detectedAvailability) {
    quickActions.push('Open now', 'Mobile service available');
  }
  
  return {
    type,
    filters,
    response,
    quickActions: quickActions.slice(0, 4)
  };
}

/**
 * Get quick action suggestions based on user context
 */
export function getQuickActions(context?: 'initial' | 'after-search' | 'no-results'): string[] {
  switch (context) {
    case 'initial':
      return [
        'Find salons near me',
        'Hair braiding in Johannesburg',
        'Nail salons in Sandton',
        'Spas open now'
      ];
    case 'after-search':
      return [
        'Refine search',
        'Show only open now',
        'Mobile service available',
        'Affordable options'
      ];
    case 'no-results':
      return [
        'Search nearby areas',
        'Remove filters',
        'Show all services',
        'Try different location'
      ];
    default:
      return [
        'Popular searches',
        'Near me',
        'Open now',
        'Best rated'
      ];
  }
}
