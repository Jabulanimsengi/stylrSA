/**
 * API utility for handling requests to the backend
 * Works with both Vercel (rewrites) and Cloudflare Pages (direct URLs)
 */

// Get the API base URL
export function getApiUrl(): string {
  // In browser, always use relative URLs to go through Next.js rewrites
  // This avoids CORS issues since requests are proxied through the same origin
  if (typeof window !== 'undefined') {
    return '';
  }
  
  // Server-side: use environment variable for SSR API calls
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

/**
 * Fetch JSON from API endpoint
 * @param path - API path starting with /api/
 * @param options - Fetch options
 * @returns Parsed JSON response
 */
export async function apiJson<T = unknown>(path: string, options?: RequestInit): Promise<T> {
  const response = await apiFetch(path, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });
  
  if (!response.ok) {
    throw new Error(`API error: ${response.status} ${response.statusText}`);
  }
  
  return response.json();
}
