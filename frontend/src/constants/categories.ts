/**
 * Service Categories
 * 
 * Single source of truth for all service categories used across the app.
 */

export interface ServiceCategory {
  name: string;
  slug: string;
  icon?: string;
  description?: string;
}

export const SERVICE_CATEGORIES: ServiceCategory[] = [
  {
    name: 'Braiding & Weaving',
    slug: 'braiding-weaving',
    description: 'Professional braiding, weaving, and hair extension services',
  },
  {
    name: 'Haircuts & Styling',
    slug: 'haircuts-styling',
    description: 'Expert haircuts, styling, and hair treatments',
  },
  {
    name: 'Nail Care',
    slug: 'nail-care',
    description: 'Manicures, pedicures, gel nails, and nail art',
  },
  {
    name: 'Makeup & Beauty',
    slug: 'makeup-beauty',
    description: 'Professional makeup services for all occasions',
  },
  {
    name: 'Massage & Body Treatments',
    slug: 'massage-body-treatments',
    description: 'Relaxing massages and body treatments',
  },
  {
    name: 'Skin Care & Facials',
    slug: 'skin-care-facials',
    description: 'Facials, skincare treatments, and beauty products',
  },
  {
    name: "Men's Grooming",
    slug: 'mens-grooming',
    description: 'Barber services, fades, and beard grooming',
  },
  {
    name: 'Waxing & Hair Removal',
    slug: 'waxing-hair-removal',
    description: 'Professional waxing and hair removal services',
  },
  {
    name: 'Bridal Services',
    slug: 'bridal-services',
    description: 'Wedding preparation and bridal packages',
  },
  {
    name: 'Wig Installations',
    slug: 'wig-installations',
    description: 'Professional wig installation and styling',
  },
  {
    name: 'Natural Hair Specialists',
    slug: 'natural-hair-specialists',
    description: 'Specialized care for natural hair textures and styles',
  },
  {
    name: 'Lashes & Brows',
    slug: 'lashes-brows',
    description: 'Eyelash extensions, tints, and brow shaping',
  },
  {
    name: 'Aesthetics & Advanced Skin',
    slug: 'aesthetics-advanced-skin',
    description: 'Advanced skin treatments and aesthetic procedures',
  },
  {
    name: 'Tattoos & Piercings',
    slug: 'tattoos-piercings',
    description: 'Professional tattooing and body piercing',
  },
  {
    name: 'Wellness & Holistic Spa',
    slug: 'wellness-holistic-spa',
    description: 'Holistic wellness treatments and therapies',
  },
  {
    name: 'Hair Color & Treatments',
    slug: 'hair-color-treatments',
    description: 'Professional hair coloring and conditioning treatments',
  },
];

// Quick access categories for hero section
export const QUICK_CATEGORIES = [
  { name: 'Hair', slug: 'haircuts-styling' },
  { name: 'Nails', slug: 'nail-care' },
  { name: 'Spa', slug: 'massage-body-treatments' },
  { name: 'Makeup', slug: 'makeup-beauty' },
  { name: 'Near Me', slug: null, href: '/salons' },
] as const;

// Featured categories for homepage
export const FEATURED_CATEGORIES = [
  'braiding-weaving',
  'nail-care',
  'makeup-beauty',
  'haircuts-styling',
  'massage-body-treatments',
  'mens-grooming',
] as const;

// Trend categories
export const TREND_CATEGORIES = [
  'HAIRSTYLE',
  'BRAIDS',
  'NAILS',
  'SPA',
  'MAKEUP',
  'BARBERING',
] as const;

export type TrendCategoryType = (typeof TREND_CATEGORIES)[number];

/**
 * Get category by slug
 */
export function getCategoryBySlug(slug: string): ServiceCategory | undefined {
  return SERVICE_CATEGORIES.find((cat) => cat.slug === slug);
}

/**
 * Get category by name
 */
export function getCategoryByName(name: string): ServiceCategory | undefined {
  return SERVICE_CATEGORIES.find(
    (cat) => cat.name.toLowerCase() === name.toLowerCase()
  );
}
