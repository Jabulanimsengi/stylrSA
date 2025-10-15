/**
 * Placeholder image utilities
 * Use local data URIs instead of external services
 */

// 400x200 gradient placeholder (base64 SVG)
export const PLACEHOLDER_400x200 = 
  "data:image/svg+xml,%3Csvg width='400' height='200' xmlns='http://www.w3.org/2000/svg'%3E%3Cdefs%3E%3ClinearGradient id='grad' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' style='stop-color:%23667eea;stop-opacity:1' /%3E%3Cstop offset='100%25' style='stop-color:%23764ba2;stop-opacity:1' /%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='400' height='200' fill='url(%23grad)'/%3E%3Ctext x='50%25' y='50%25' font-family='Arial, sans-serif' font-size='20' font-weight='bold' fill='white' text-anchor='middle' dominant-baseline='middle'%3ENo Image%3C/text%3E%3C/svg%3E";

// 800x400 gradient placeholder
export const PLACEHOLDER_800x400 = 
  "data:image/svg+xml,%3Csvg width='800' height='400' xmlns='http://www.w3.org/2000/svg'%3E%3Cdefs%3E%3ClinearGradient id='grad' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' style='stop-color:%23667eea;stop-opacity:1' /%3E%3Cstop offset='100%25' style='stop-color:%23764ba2;stop-opacity:1' /%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='800' height='400' fill='url(%23grad)'/%3E%3Ctext x='50%25' y='50%25' font-family='Arial, sans-serif' font-size='40' font-weight='bold' fill='white' text-anchor='middle' dominant-baseline='middle'%3ENo Image%3C/text%3E%3C/svg%3E";

// Square placeholder (for profiles, products)
export const PLACEHOLDER_SQUARE = 
  "data:image/svg+xml,%3Csvg width='400' height='400' xmlns='http://www.w3.org/2000/svg'%3E%3Cdefs%3E%3ClinearGradient id='grad' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' style='stop-color:%23667eea;stop-opacity:1' /%3E%3Cstop offset='100%25' style='stop-color:%23764ba2;stop-opacity:1' /%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='400' height='400' fill='url(%23grad)'/%3E%3Ctext x='50%25' y='50%25' font-family='Arial, sans-serif' font-size='30' font-weight='bold' fill='white' text-anchor='middle' dominant-baseline='middle'%3ENo Image%3C/text%3E%3C/svg%3E";

/**
 * Get appropriate placeholder based on image type
 */
export function getPlaceholder(type: 'wide' | 'square' | 'ultra-wide' = 'wide'): string {
  switch (type) {
    case 'square':
      return PLACEHOLDER_SQUARE;
    case 'ultra-wide':
      return PLACEHOLDER_800x400;
    case 'wide':
    default:
      return PLACEHOLDER_400x200;
  }
}

/**
 * Check if URL is a placeholder service
 */
export function isPlaceholderUrl(url: string | null | undefined): boolean {
  if (!url) return true;
  return (
    url.includes('via.placeholder.com') ||
    url.includes('placeholder.com') ||
    url.includes('placehold') ||
    url === '' ||
    url === 'null' ||
    url === 'undefined'
  );
}

/**
 * Get image URL with fallback to local placeholder
 */
export function getImageWithFallback(
  url: string | null | undefined,
  type: 'wide' | 'square' | 'ultra-wide' = 'wide'
): string {
  if (isPlaceholderUrl(url)) {
    return getPlaceholder(type);
  }
  return url!;
}
