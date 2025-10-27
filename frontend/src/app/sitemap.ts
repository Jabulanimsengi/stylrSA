import type { MetadataRoute } from 'next';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://stylrsa.vercel.app';
  
  // Static pages with SEO importance
  const staticPages: MetadataRoute.Sitemap = [
    { url: `${siteUrl}/`, changeFrequency: 'daily', priority: 1.0 },
    { url: `${siteUrl}/salons`, changeFrequency: 'daily', priority: 0.9 },
    { url: `${siteUrl}/services`, changeFrequency: 'daily', priority: 0.9 },
    { url: `${siteUrl}/products`, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${siteUrl}/prices`, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${siteUrl}/about`, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${siteUrl}/contact`, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${siteUrl}/how-it-works`, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${siteUrl}/faq`, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${siteUrl}/advice`, changeFrequency: 'weekly', priority: 0.5 },
    { url: `${siteUrl}/blog`, changeFrequency: 'weekly', priority: 0.5 },
    { url: `${siteUrl}/careers`, changeFrequency: 'monthly', priority: 0.4 },
  ];

  // Service category pages - HIGH PRIORITY for SEO
  const serviceCategoryPages: MetadataRoute.Sitemap = [
    { url: `${siteUrl}/services/braiding-weaving`, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${siteUrl}/services/nail-care`, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${siteUrl}/services/makeup-beauty`, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${siteUrl}/services/massage-body-treatments`, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${siteUrl}/services/skin-care-facials`, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${siteUrl}/services/waxing-hair-removal`, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${siteUrl}/services/haircuts-styling`, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${siteUrl}/services/hair-color-treatments`, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${siteUrl}/services/mens-grooming`, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${siteUrl}/services/bridal-services`, changeFrequency: 'weekly', priority: 0.9 },
  ];

  // Location-specific pages for local SEO
  const locationPages: MetadataRoute.Sitemap = [
    { url: `${siteUrl}/salons/location/gauteng`, changeFrequency: 'weekly', priority: 0.85 },
    { url: `${siteUrl}/salons/location/western-cape`, changeFrequency: 'weekly', priority: 0.85 },
    { url: `${siteUrl}/salons/location/kwazulu-natal`, changeFrequency: 'weekly', priority: 0.85 },
    { url: `${siteUrl}/salons/location/eastern-cape`, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${siteUrl}/salons/location/mpumalanga`, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${siteUrl}/salons/location/limpopo`, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${siteUrl}/salons/location/north-west`, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${siteUrl}/salons/location/free-state`, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${siteUrl}/salons/location/northern-cape`, changeFrequency: 'weekly', priority: 0.8 },
  ];

  try {
    // Fetch dynamic salon pages
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_PATH || ''}/api/salons/approved`, { cache: 'no-store' });
    const salons: Array<{ id: string; updatedAt?: string }>|null = res.ok ? await res.json() : null;
    const salonEntries: MetadataRoute.Sitemap = (salons || []).map((s) => ({
      url: `${siteUrl}/salons/${s.id}`,
      changeFrequency: 'weekly',
      lastModified: s.updatedAt ? new Date(s.updatedAt) : undefined,
      priority: 0.7,
    }));

    return [...staticPages, ...serviceCategoryPages, ...locationPages, ...salonEntries];
  } catch {
    return [...staticPages, ...serviceCategoryPages, ...locationPages];
  }
}
