/**
 * API utility for handling requests to the backend
 * Works with both Vercel (rewrites) and Cloudflare Pages (direct URLs)
 */

// Get the API base URL
export function getApiUrl(): string {
  // In browser, check if we're on Cloudflare or have a configured API URL
  if (typeof window !== 'undefined') {
    // Use environment variable if set
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    if (apiUrl) {
      return apiUrl;
    }
    // Fallback to relative URL (works with Vercel rewrites)
    return '';
  }
  
  // Server-side: use environment variable
  return process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_API_ORIGIN || '';
}

/**
 * Build full API URL from a path
 * @param path - API path starting with /api/
 * @returns Full URL for the API endpoint
 */
export function apiUrl(path: string): string {
  const base = getApiUrl();
  // If base is empty, return path as-is (for Vercel rewrites)
  if (!base) {
    return path;
  }
  // Remove trailing slash from base and leading slash from path if needed
  const cleanBase = base.replace(/\/$/, '');
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${cleanBase}${cleanPath}`;
}

/**
 * Fetch wrapper that automatically uses the correct API URL
 * @param path - API path starting with /api/
 * @param options - Fetch options
 * @returns Fetch response
 */
export async function apiFetch(path: string, options?: RequestInit): Promise<Response> {
  const url = apiUrl(path);
  return fetch(url, {
    ...options,
    credentials: options?.credentials || 'include',
  });
}

/**
 * Check if we're running on Cloudflare Pages
 */
export function isCloudflare(): boolean {
  if (typeof window !== 'undefined') {
    // Check for Cloudflare-specific headers or environment
    return !!process.env.NEXT_PUBLIC_CLOUDFLARE;
  }
  return false;
}
