/**
 * Internal Linking Helper Functions
 * Implements hub-and-spoke model for SEO internal linking
 */

import { PRIORITY_CITIES } from './seo-optimization-config';

/**
 * Map of nearby cities for each major city
 * Used for generating "Nearby Locations" links
 */
const NEARBY_CITIES: Record<string, { city: string; province: string }[]> = {
    // Gauteng
    'johannesburg': [
        { city: 'sandton', province: 'gauteng' },
        { city: 'randburg', province: 'gauteng' },
        { city: 'roodepoort', province: 'gauteng' },
        { city: 'midrand', province: 'gauteng' },
        { city: 'soweto', province: 'gauteng' },
    ],
    'pretoria': [
        { city: 'centurion', province: 'gauteng' },
        { city: 'midrand', province: 'gauteng' },
        { city: 'sandton', province: 'gauteng' },
        { city: 'johannesburg', province: 'gauteng' },
        { city: 'kempton-park', province: 'gauteng' },
    ],
    'sandton': [
        { city: 'johannesburg', province: 'gauteng' },
        { city: 'randburg', province: 'gauteng' },
        { city: 'midrand', province: 'gauteng' },
        { city: 'pretoria', province: 'gauteng' },
        { city: 'fourways', province: 'gauteng' },
    ],
    'centurion': [
        { city: 'pretoria', province: 'gauteng' },
        { city: 'midrand', province: 'gauteng' },
        { city: 'johannesburg', province: 'gauteng' },
        { city: 'kempton-park', province: 'gauteng' },
        { city: 'sandton', province: 'gauteng' },
    ],
    'randburg': [
        { city: 'johannesburg', province: 'gauteng' },
        { city: 'sandton', province: 'gauteng' },
        { city: 'roodepoort', province: 'gauteng' },
        { city: 'midrand', province: 'gauteng' },
        { city: 'fourways', province: 'gauteng' },
    ],

    // Western Cape
    'cape-town': [
        { city: 'bellville', province: 'western-cape' },
        { city: 'mitchells-plain', province: 'western-cape' },
        { city: 'stellenbosch', province: 'western-cape' },
        { city: 'somerset-west', province: 'western-cape' },
        { city: 'paarl', province: 'western-cape' },
    ],
    'stellenbosch': [
        { city: 'cape-town', province: 'western-cape' },
        { city: 'paarl', province: 'western-cape' },
        { city: 'somerset-west', province: 'western-cape' },
        { city: 'franschhoek', province: 'western-cape' },
        { city: 'bellville', province: 'western-cape' },
    ],

    // KwaZulu-Natal
    'durban': [
        { city: 'pinetown', province: 'kwazulu-natal' },
        { city: 'umhlanga', province: 'kwazulu-natal' },
        { city: 'chatsworth', province: 'kwazulu-natal' },
        { city: 'phoenix', province: 'kwazulu-natal' },
        { city: 'amanzimtoti', province: 'kwazulu-natal' },
    ],
    'pietermaritzburg': [
        { city: 'howick', province: 'kwazulu-natal' },
        { city: 'hilton', province: 'kwazulu-natal' },
        { city: 'durban', province: 'kwazulu-natal' },
        { city: 'ladysmith', province: 'kwazulu-natal' },
        { city: 'greytown', province: 'kwazulu-natal' },
    ],

    // Eastern Cape
    'port-elizabeth': [
        { city: 'uitenhage', province: 'eastern-cape' },
        { city: 'despatch', province: 'eastern-cape' },
        { city: 'jeffreys-bay', province: 'eastern-cape' },
        { city: 'colchester', province: 'eastern-cape' },
        { city: 'grahamstown', province: 'eastern-cape' },
    ],
    'east-london': [
        { city: 'bhisho', province: 'eastern-cape' },
        { city: 'king-williams-town', province: 'eastern-cape' },
        { city: 'gonubie', province: 'eastern-cape' },
        { city: 'mdantsane', province: 'eastern-cape' },
        { city: 'beacon-bay', province: 'eastern-cape' },
    ],
};

/**
 * Related service types for internal linking
 * Maps service categories to related services
 */
const RELATED_SERVICES: Record<string, { slug: string; label: string }[]> = {
    'hair': [
        { slug: 'top-10-hair-salons-near-me', label: 'Top Hair Salons' },
        { slug: 'walk-in-hair-salon-near-me', label: 'Walk-in Hair Salons' },
        { slug: 'affordable-hair-salon-near-me', label: 'Affordable Hair Salons' },
        { slug: 'hair-braiding-near-me', label: 'Hair Braiding' },
        { slug: 'dreadlocks-salon-near-me', label: 'Dreadlocks' },
        { slug: 'silk-press-near-me', label: 'Silk Press' },
    ],
    'nails': [
        { slug: 'nail-salon-near-me', label: 'Nail Salons' },
        { slug: 'nail-salon-prices-near-me', label: 'Nail Salon Prices' },
        { slug: 'mobile-nail-tech-near-me', label: 'Mobile Nail Tech' },
        { slug: 'gel-nails-near-me', label: 'Gel Nails' },
        { slug: 'russian-manicure-near-me', label: 'Russian Manicure' },
        { slug: 'biab-nails-near-me', label: 'BIAB Nails' },
    ],
    'massage': [
        { slug: 'massage-near-me', label: 'Massage' },
        { slug: '24-hour-massage-near-me', label: '24-Hour Massage' },
        { slug: 'thai-massage-near-me', label: 'Thai Massage' },
        { slug: 'full-body-massage-near-me', label: 'Full Body Massage' },
        { slug: 'couples-massage-near-me', label: 'Couples Massage' },
        { slug: 'deep-tissue-massage-near-me', label: 'Deep Tissue Massage' },
    ],
    'tattoo': [
        { slug: 'tattoo-shop-near-me', label: 'Tattoo Shops' },
        { slug: 'walk-in-tattoo-shop-near-me', label: 'Walk-in Tattoos' },
        { slug: 'piercing-shop-near-me', label: 'Piercings' },
        { slug: 'body-piercing-near-me', label: 'Body Piercing' },
    ],
};

/**
 * Format city name for display (capitalize words, replace dashes)
 */
export function formatCityName(citySlug: string): string {
    return citySlug
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}

/**
 * Format province name for display
 */
export function formatProvinceName(provinceSlug: string): string {
    const provinces: Record<string, string> = {
        'gauteng': 'Gauteng',
        'western-cape': 'Western Cape',
        'kwazulu-natal': 'KwaZulu-Natal',
        'eastern-cape': 'Eastern Cape',
        'free-state': 'Free State',
        'limpopo': 'Limpopo',
        'mpumalanga': 'Mpumalanga',
        'north-west': 'North West',
        'northern-cape': 'Northern Cape',
    };
    return provinces[provinceSlug] || formatCityName(provinceSlug);
}

/**
 * Get nearby cities for a given city
 * Used for "Nearby Locations" section on SEO pages
 */
export function getNearbyCities(
    currentService: string,
    province: string,
    currentCity: string,
    limit: number = 5
): { label: string; url: string }[] {
    const nearby = NEARBY_CITIES[currentCity.toLowerCase()] || [];

    return nearby.slice(0, limit).map(({ city, province: prov }) => ({
        label: formatCityName(city),
        url: `/${currentService}/${prov}/${city}`,
    }));
}

/**
 * Get related services for internal linking
 * Detects service category from keyword slug and returns related services
 */
export function getRelatedServices(
    currentKeywordSlug: string,
    province: string,
    city: string,
    limit: number = 6
): { label: string; url: string }[] {
    // Detect category from slug
    let category = 'hair'; // default

    if (currentKeywordSlug.includes('nail') || currentKeywordSlug.includes('manicure')) {
        category = 'nails';
    } else if (currentKeywordSlug.includes('massage') || currentKeywordSlug.includes('spa')) {
        category = 'massage';
    } else if (currentKeywordSlug.includes('tattoo') || currentKeywordSlug.includes('piercing')) {
        category = 'tattoo';
    }

    const services = RELATED_SERVICES[category] || RELATED_SERVICES['hair'];

    return services
        .filter(s => s.slug !== currentKeywordSlug)
        .slice(0, limit)
        .map(s => ({
            label: `${s.label} in ${formatCityName(city)}`,
            url: `/${s.slug}/${province}/${city}`,
        }));
}

/**
 * Get hub page URL for a city
 * Hub pages link to all services in a location
 */
export function getCityHubUrl(province: string, city: string): string {
    return `/salons/location/${province}/${city}`;
}

/**
 * Get province hub URL
 */
export function getProvinceHubUrl(province: string): string {
    return `/salons/location/${province}`;
}

/**
 * Generate breadcrumb items for SEO pages
 */
export function generateBreadcrumbs(
    keyword: string,
    keywordSlug: string,
    province: string,
    city: string
): { label: string; url: string }[] {
    return [
        { label: 'Home', url: '/' },
        { label: keyword, url: `/${keywordSlug}` },
        { label: formatProvinceName(province), url: `/${keywordSlug}/${province}` },
        { label: formatCityName(city), url: `/${keywordSlug}/${province}/${city}` },
    ];
}

/**
 * Get footer location links organized by province
 */
export function getFooterLocationLinks(): Record<string, { label: string; url: string }[]> {
    return {
        'Gauteng': [
            { label: 'Johannesburg Salons', url: '/salons/location/gauteng/johannesburg' },
            { label: 'Pretoria Salons', url: '/salons/location/gauteng/pretoria' },
            { label: 'Sandton Salons', url: '/salons/location/gauteng/sandton' },
            { label: 'Centurion Salons', url: '/salons/location/gauteng/centurion' },
            { label: 'Randburg Salons', url: '/salons/location/gauteng/randburg' },
        ],
        'Western Cape': [
            { label: 'Cape Town Salons', url: '/salons/location/western-cape/cape-town' },
            { label: 'Stellenbosch Salons', url: '/salons/location/western-cape/stellenbosch' },
            { label: 'Paarl Salons', url: '/salons/location/western-cape/paarl' },
        ],
        'KwaZulu-Natal': [
            { label: 'Durban Salons', url: '/salons/location/kwazulu-natal/durban' },
            { label: 'Pietermaritzburg Salons', url: '/salons/location/kwazulu-natal/pietermaritzburg' },
            { label: 'Umhlanga Salons', url: '/salons/location/kwazulu-natal/umhlanga' },
        ],
        'Eastern Cape': [
            { label: 'Port Elizabeth Salons', url: '/salons/location/eastern-cape/port-elizabeth' },
            { label: 'East London Salons', url: '/salons/location/eastern-cape/east-london' },
        ],
    };
}

/**
 * Get popular service links for footer
 */
export function getFooterServiceLinks(): { label: string; url: string }[] {
    return [
        { label: 'Haircuts & Styling', url: '/services/haircuts-styling' },
        { label: 'Nail Care', url: '/services/nail-care' },
        { label: 'Massage & Body', url: '/services/massage-body-treatments' },
        { label: 'Hair Braiding', url: '/services/braiding-weaving' },
        { label: 'Barbershops', url: '/services/barbershop-services' },
        { label: 'Makeup & Beauty', url: '/services/makeup-beauty' },
    ];
}
