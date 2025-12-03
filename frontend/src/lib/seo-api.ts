/**
 * SEO API client for fetching cached page data from backend
 */

// Get API URL dynamically to handle env var changes
function getApiBaseUrl(): string {
  return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
}

// Check if we should skip API calls (only during build phase with localhost)
function shouldSkipFetch(): boolean {
  // Only skip during build phase when API URL is localhost
  const isBuildPhase = process.env.IS_BUILD_PHASE === 'true' || process.env.NEXT_PHASE === 'phase-production-build';
  if (!isBuildPhase) {
    return false; // Always fetch at runtime
  }
  
  // During build, skip if API URL is localhost (not accessible)
  const apiUrl = getApiBaseUrl();
  if (apiUrl.includes('localhost') || apiUrl.includes('127.0.0.1')) {
    return true;
  }
  return false;
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
  if (shouldSkipFetch()) return null;
  
  try {
    const response = await fetch(`${getApiBaseUrl()}/seo-pages/by-url?url=${encodeURIComponent(url)}`, {
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
  if (shouldSkipFetch()) return [];
  
  const url = `${getApiBaseUrl()}/seo-pages/keywords/top?limit=${limit}`;
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
  if (shouldSkipFetch()) return [];
  
  try {
    const response = await fetch(`${getApiBaseUrl()}/seo-pages/locations/provinces`, {
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
  if (shouldSkipFetch()) return [];
  
  try {
    const response = await fetch(`${getApiBaseUrl()}/seo-pages/locations/cities/top?limit=${limit}`, {
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
  if (shouldSkipFetch()) return null;
  
  try {
    const response = await fetch(`${getApiBaseUrl()}/seo-pages/locations/${id}`, {
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
  if (shouldSkipFetch()) return null;
  
  try {
    const response = await fetch(`${getApiBaseUrl()}/seo-pages/keyword/${slug}/first`, {
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
  if (shouldSkipFetch()) return null;
  
  try {
    const response = await fetch(`${getApiBaseUrl()}/seo-pages/keywords/${slug}`, {
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
