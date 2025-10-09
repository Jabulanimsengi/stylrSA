import type { MetadataRoute } from 'next';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://thesalonhub.com';
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_PATH || ''}/api/salons/approved`, { cache: 'no-store' });
    const salons: Array<{ id: string; updatedAt?: string }>|null = res.ok ? await res.json() : null;
    const salonEntries: MetadataRoute.Sitemap = (salons || []).map((s) => ({
      url: `${siteUrl}/salons/${s.id}`,
      changeFrequency: 'weekly',
      lastModified: s.updatedAt ? new Date(s.updatedAt) : undefined,
      priority: 0.6,
    }));

    return [
      { url: `${siteUrl}/`, changeFrequency: 'weekly', priority: 0.8 },
      { url: `${siteUrl}/salons`, changeFrequency: 'weekly', priority: 0.7 },
      ...salonEntries,
    ];
  } catch {
    return [
      { url: `${siteUrl}/`, changeFrequency: 'weekly', priority: 0.8 },
      { url: `${siteUrl}/salons`, changeFrequency: 'weekly', priority: 0.7 },
    ];
  }
}
