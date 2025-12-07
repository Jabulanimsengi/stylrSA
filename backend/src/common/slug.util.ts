/**
 * Slug utility functions for generating SEO-friendly URLs
 */

/**
 * Generate a URL-friendly slug from text
 * @param text - The text to convert to a slug
 * @returns A lowercase, hyphenated slug
 */
export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')        // Replace spaces with hyphens
    .replace(/&/g, '-and-')      // Replace & with 'and'
    .replace(/[^\w\-]+/g, '')    // Remove all non-word chars except hyphens
    .replace(/\-\-+/g, '-')      // Replace multiple hyphens with single hyphen
    .replace(/^-+/, '')          // Trim hyphens from start
    .replace(/-+$/, '');         // Trim hyphens from end
}

/**
 * Generate a salon slug from name and city
 * Format: salon-name-city (e.g., "glamour-hair-studio-johannesburg")
 * @param name - Salon name
 * @param city - Salon city
 * @returns A unique-ish slug
 */
export function generateSalonSlug(name: string, city: string): string {
  const nameSlug = slugify(name);
  const citySlug = slugify(city);
  return `${nameSlug}-${citySlug}`;
}

/**
 * Check if a string looks like a UUID
 * @param str - String to check
 * @returns true if it matches UUID format
 */
export function isUUID(str: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
}
