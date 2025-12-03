/**
 * SEO API client for fetching cached page data from backend
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

// Check if we're in build phase - skip API calls during static generation
const isBuildPhase = process.env.NEXT_PHASE === 'phase-production-build';

// Debug: Log the API base URL being used
if (typeof window === 'undefined' && !isBuildPhase) {
  console.log('🔍 SEO API Base URL:', API_BASE_URL);
}

export interface SeoKeyword {
  id: number;
  keyword: string;
  slug: string;
  category: string;
  priority: number;
}

export interface SeoLocation {
  id: number;
  name: string;
  slug: string;
  type: string;
  province: string;
  provinceSlug: string;
  parentLocationId: number | null;
}

export interface SeoPageCache {
  id: number;
  keywordId: number;
  locationId: number;
  url: string;
  h1: string;
  h2Headings: string[];
  h3Headings: string[];
  introText: string;
  metaTitle: string;
  metaDescription: string;
  schemaMarkup: any;
  relatedServices: any[];
  nearbyLocations: any[];
  serviceCount: number;
  salonCount: number;
  avgPrice: number | null;
  lastGenerated: Date;
  keyword?: SeoKeyword;
  location?: SeoLocation;
}

/**
 * Fetch cached SEO page data by URL
 */
export async function getSeoPageByUrl(url: string): Promise<SeoPageCache | null> {
  if (isBuildPhase) return null;
  
  try {
    const response = await fetch(`${API_BASE_URL}/seo-pages/by-url?url=${encodeURIComponent(url)}`, {
      next: { revalidate: 3600 }, // Cache for 1 hour
    });

    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new Error(`Failed to fetch SEO page: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching SEO page:', error);
    return null;
  }
}

/**
 * Get top keywords for static generation
 */
export async function getTopKeywords(limit: number = 100): Promise<{ slug: string }[]> {
  if (isBuildPhase) return [];
  
  const url = `${API_BASE_URL}/seo-pages/keywords/top?limit=${limit}`;
  console.log('🌐 Fetching keywords from:', url);
  
  try {
    const response = await fetch(url, {
      next: { revalidate: 86400 }, // Cache for 24 hours
      cache: 'force-cache',
    });

    console.log('📡 Keywords response status:', response.status);

    if (!response.ok) {
      console.warn(`Failed to fetch keywords: ${response.status} ${response.statusText}`);
      return [];
    }

    const data = await response.json();
    console.log('✅ Keywords fetched:', data.length);
    return data;
  } catch (error) {
    console.warn('Error fetching keywords, returning empty array:', error);
    return [];
  }
}

/**
 * Get all provinces
 */
export async function getProvinces(): Promise<{ provinceSlug: string }[]> {
  if (isBuildPhase) return [];
  
  try {
    const response = await fetch(`${API_BASE_URL}/seo-pages/locations/provinces`, {
      next: { revalidate: 86400 }, // Cache for 24 hours
      cache: 'force-cache',
    });

    if (!response.ok) {
      console.warn(`Failed to fetch provinces: ${response.status} ${response.statusText}`);
      return [];
    }

    return await response.json();
  } catch (error) {
    console.warn('Error fetching provinces, returning empty array:', error);
    return [];
  }
}

/**
 * Get top cities for static generation
 */
export async function getTopCities(limit: number = 100): Promise<{ slug: string; provinceSlug: string }[]> {
  if (isBuildPhase) return [];
  
  try {
    const response = await fetch(`${API_BASE_URL}/seo-pages/locations/cities/top?limit=${limit}`, {
      next: { revalidate: 86400 }, // Cache for 24 hours
      cache: 'force-cache',
    });

    if (!response.ok) {
      console.warn(`Failed to fetch cities: ${response.status} ${response.statusText}`);
      return [];
    }

    return await response.json();
  } catch (error) {
    console.warn('Error fetching cities, returning empty array:', error);
    return [];
  }
}

/**
 * Get location by ID
 */
export async function getLocationById(id: number): Promise<SeoLocation | null> {
  if (isBuildPhase) return null;
  
  try {
    const response = await fetch(`${API_BASE_URL}/seo-pages/locations/${id}`, {
      next: { revalidate: 3600 }, // Cache for 1 hour
    });

    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new Error(`Failed to fetch location: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching location:', error);
    return null;
  }
}

/**
 * Get first cached page for a keyword (any location)
 */
export async function getFirstPageForKeyword(slug: string): Promise<SeoPageCache | null> {
  if (isBuildPhase) return null;
  
  try {
    const response = await fetch(`${API_BASE_URL}/seo-pages/keyword/${slug}/first`, {
      next: { revalidate: 3600 }, // Cache for 1 hour
    });

    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new Error(`Failed to fetch keyword page: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching keyword page:', error);
    return null;
  }
}

/**
 * Get keyword by slug
 */
export async function getKeywordBySlug(slug: string): Promise<SeoKeyword | null> {
  if (isBuildPhase) return null;
  
  try {
    const response = await fetch(`${API_BASE_URL}/seo-pages/keywords/${slug}`, {
      next: { revalidate: 86400 }, // Cache for 24 hours
    });

    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new Error(`Failed to fetch keyword: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching keyword:', error);
    return null;
  }
}
