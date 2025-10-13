import type { MetadataRoute } from 'next';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://stylrsa.vercel.app';
  
  // Static pages with SEO importance
  const staticPages: MetadataRoute.Sitemap = [
    { url: `${siteUrl}/`, changeFrequency: 'daily', priority: 1.0 },
    { url: `${siteUrl}/salons`, changeFrequency: 'daily', priority: 0.9 },
    { url: `${siteUrl}/services`, changeFrequency: 'weekly', priority: 0.8 },
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

    return [...staticPages, ...salonEntries];
  } catch {
    return staticPages;
  }
}
