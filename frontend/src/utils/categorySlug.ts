/**
 * Category slug utilities for service category navigation
 * Maps category names to URL-friendly slugs for routing
 */

/**
 * Mapping of service category names to URL slugs
 * These slugs are used for filtering services by category
 */
export const CATEGORY_SLUGS: Record<string, string> = {
  'Haircuts & Styling': 'haircuts-styling',
  'Hair Color & Treatments': 'hair-color-treatments',
  'Nail Care': 'nail-care',
  'Skin Care & Facials': 'skin-care-facials',
  'Massage & Body Treatments': 'massage-body-treatments',
  'Makeup & Beauty': 'makeup-beauty',
  'Waxing & Hair Removal': 'waxing-hair-removal',
  'Braiding & Weaving': 'braiding-weaving',
  "Men's Grooming": 'mens-grooming',
  'Bridal Services': 'bridal-services',
  'Wig Installations': 'wig-installations',
  'Natural Hair Specialists': 'natural-hair-specialists',
  'Lashes & Brows': 'lashes-brows',
  'Aesthetics & Advanced Skin': 'aesthetics-advanced-skin',
  'Tattoos & Piercings': 'tattoos-piercings',
  'Wellness & Holistic Spa': 'wellness-holistic-spa',
};

/**
 * Type for category slug mappings
 */
export type CategorySlugMapping = typeof CATEGORY_SLUGS;

/**
 * Type for valid category names
 */
export type CategoryName = keyof CategorySlugMapping;

/**
 * Type for valid category slugs
 */
export type CategorySlug = CategorySlugMapping[CategoryName];

/**
 * Generate a URL-friendly slug from a category name
 * Used as fallback when category is not in the predefined mapping
 * 
 * @param categoryName - The category name to convert to a slug
 * @returns URL-friendly slug
 * 
 * @example
 * generateCategorySlug('Hair Color & Treatments') // 'hair-color-treatments'
 * generateCategorySlug('Custom Category') // 'custom-category'
 */
export function generateCategorySlug(categoryName: string): string {
  return categoryName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-') // Replace non-alphanumeric chars with hyphens
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
}

/**
 * Get the slug for a category name
 * Uses predefined mapping first, falls back to generated slug
 * 
 * @param categoryName - The category name to get slug for
 * @returns URL-friendly slug
 * 
 * @example
 * getCategorySlug('Nail Care') // 'nail-care'
 * getCategorySlug('Unknown Category') // 'unknown-category'
 */
export function getCategorySlug(categoryName: string): string {
  return CATEGORY_SLUGS[categoryName] || generateCategorySlug(categoryName);
}

/**
 * Get the category name from a slug
 * Reverse lookup in the CATEGORY_SLUGS mapping
 * 
 * @param slug - The URL slug to find category name for
 * @returns Category name if found, undefined otherwise
 * 
 * @example
 * getCategoryNameFromSlug('nail-care') // 'Nail Care'
 * getCategoryNameFromSlug('unknown-slug') // undefined
 */
export function getCategoryNameFromSlug(slug: string): string | undefined {
  const entry = Object.entries(CATEGORY_SLUGS).find(([_, categorySlug]) => categorySlug === slug);
  return entry?.[0];
}

/**
 * Check if a category name exists in the predefined mapping
 * 
 * @param categoryName - The category name to check
 * @returns True if category exists in mapping
 * 
 * @example
 * isValidCategory('Nail Care') // true
 * isValidCategory('Unknown Category') // false
 */
export function isValidCategory(categoryName: string): categoryName is CategoryName {
  return categoryName in CATEGORY_SLUGS;
}

/**
 * Get all available category names
 * 
 * @returns Array of all category names
 */
export function getAllCategoryNames(): CategoryName[] {
  return Object.keys(CATEGORY_SLUGS) as CategoryName[];
}

/**
 * Get all available category slugs
 * 
 * @returns Array of all category slugs
 */
export function getAllCategorySlugs(): CategorySlug[] {
  return Object.values(CATEGORY_SLUGS) as CategorySlug[];
}
