import type { MetadataRoute } from 'next';
import { PROVINCES } from '@/lib/locationData';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.stylrsa.co.za';
  
  // Static pages with SEO importance
  const staticPages: MetadataRoute.Sitemap = [
    { url: `${siteUrl}/`, changeFrequency: 'daily', priority: 1.0 },
    { url: `${siteUrl}/salons`, changeFrequency: 'daily', priority: 0.9 },
    { url: `${siteUrl}/services`, changeFrequency: 'daily', priority: 0.9 },
    { url: `${siteUrl}/products`, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${siteUrl}/sellers`, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${siteUrl}/promotions`, changeFrequency: 'daily', priority: 0.8 },
    { url: `${siteUrl}/prices`, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${siteUrl}/about`, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${siteUrl}/contact`, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${siteUrl}/faq`, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${siteUrl}/how-it-works`, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${siteUrl}/advice`, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${siteUrl}/blog`, changeFrequency: 'weekly', priority: 0.5 },
    { url: `${siteUrl}/community`, changeFrequency: 'weekly', priority: 0.6 },
    
    // Legal & Policy pages (lower priority but important for SEO)
    { url: `${siteUrl}/terms`, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${siteUrl}/privacy`, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${siteUrl}/cookie-policy`, changeFrequency: 'yearly', priority: 0.2 },
    { url: `${siteUrl}/partner-guidelines`, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${siteUrl}/safety-security`, changeFrequency: 'yearly', priority: 0.2 },
    { url: `${siteUrl}/accessibility`, changeFrequency: 'yearly', priority: 0.2 },
    
    // Blog articles - HIGH SEO VALUE
    { url: `${siteUrl}/blog/protective-hairstyles-guide`, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${siteUrl}/blog/cape-town-nail-trends`, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${siteUrl}/blog/mens-grooming-durban`, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${siteUrl}/blog/wedding-makeup-artist`, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${siteUrl}/blog/highveld-skincare-guide`, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${siteUrl}/blog/monthly-massage-benefits`, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${siteUrl}/blog/stylr-promotions-guide`, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${siteUrl}/blog/verified-reviews-importance`, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${siteUrl}/blog/local-beauty-products`, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${siteUrl}/blog/matric-dance-prep`, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${siteUrl}/blog/how-to-find-best-braider`, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${siteUrl}/blog/wedding-makeup-checklist`, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${siteUrl}/blog/2024-hair-trends`, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${siteUrl}/blog/seasonal-beauty-tips`, changeFrequency: 'monthly', priority: 0.7 },
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
    { url: `${siteUrl}/services/wig-installations`, changeFrequency: 'weekly', priority: 0.9 },
  ];

  // Location-specific service pages - CRITICAL for local SEO
  // Generate pages for all service categories × all cities
  const serviceLocationPages: MetadataRoute.Sitemap = [];
  const serviceCategories = [
    'nail-care',
    'massage-body-treatments',
    'skin-care-facials',
    'braiding-weaving',
    'makeup-beauty',
    'haircuts-styling',
    'hair-color-treatments',
    'waxing-hair-removal',
    'mens-grooming',
    'bridal-services',
    'wig-installations',
  ];
  
  Object.keys(PROVINCES).forEach(provinceSlug => {
    const province = PROVINCES[provinceSlug];
    province.cities.forEach((city, cityIndex) => {
      const isMajorCity = cityIndex < 4 || ['johannesburg', 'pretoria', 'sandton', 'soweto', 'cape-town', 'durban'].includes(city.slug);
      
      serviceCategories.forEach(category => {
        // High priority for top services (spas, nails, massage) in major cities
        const isHighValueService = ['nail-care', 'massage-body-treatments', 'skin-care-facials'].includes(category);
        const priority = isHighValueService && isMajorCity ? 0.88 : isHighValueService ? 0.85 : isMajorCity ? 0.85 : 0.8;
        
        serviceLocationPages.push({
          url: `${siteUrl}/services/${category}/location/${provinceSlug}/${city.slug}`,
          changeFrequency: isMajorCity ? 'weekly' : 'monthly',
          priority,
        });
      });
    });
  });

  // Location-specific pages for local SEO
  // Dynamically generate city pages from locationData.ts
  const cityPages: MetadataRoute.Sitemap = [];
  Object.keys(PROVINCES).forEach(provinceSlug => {
    const province = PROVINCES[provinceSlug];
    province.cities.forEach((city, index) => {
      // Major cities get higher priority and daily updates
      const isMajorCity = index < 4 || ['johannesburg', 'pretoria', 'sandton', 'soweto', 'cape-town', 'durban'].includes(city.slug);
      cityPages.push({
        url: `${siteUrl}/salons/location/${provinceSlug}/${city.slug}`,
        changeFrequency: isMajorCity ? 'daily' : 'weekly',
        priority: isMajorCity ? 0.9 : 0.85,
      });
    });
  });

  const locationPages: MetadataRoute.Sitemap = [
    // "Near me" page for local search
    { url: `${siteUrl}/salons/near-me`, changeFrequency: 'daily', priority: 0.95 },
    
    // Province pages
    { url: `${siteUrl}/salons/location/gauteng`, changeFrequency: 'weekly', priority: 0.85 },
    { url: `${siteUrl}/salons/location/western-cape`, changeFrequency: 'weekly', priority: 0.85 },
    { url: `${siteUrl}/salons/location/kwazulu-natal`, changeFrequency: 'weekly', priority: 0.85 },
    { url: `${siteUrl}/salons/location/eastern-cape`, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${siteUrl}/salons/location/mpumalanga`, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${siteUrl}/salons/location/limpopo`, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${siteUrl}/salons/location/north-west`, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${siteUrl}/salons/location/free-state`, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${siteUrl}/salons/location/northern-cape`, changeFrequency: 'weekly', priority: 0.8 },
    
    // Add all city pages dynamically
    ...cityPages,
  ];

  try {
    // Fetch dynamic salon pages
    const baseUrl = process.env.NEXT_PUBLIC_BASE_PATH || process.env.NEXT_PUBLIC_API_URL || 'https://stylrsa-production.up.railway.app';
    const salonRes = await fetch(`${baseUrl}/api/salons/approved`, { cache: 'no-store' });
    const salons: Array<{ id: string; updatedAt?: string }>|null = salonRes.ok ? await salonRes.json() : null;
    const salonEntries: MetadataRoute.Sitemap = (salons || []).map((s) => ({
      url: `${siteUrl}/salons/${s.id}`,
      changeFrequency: 'weekly',
      lastModified: s.updatedAt ? new Date(s.updatedAt) : undefined,
      priority: 0.7,
    }));

    // Fetch dynamic seller pages if sellers endpoint exists
    let sellerEntries: MetadataRoute.Sitemap = [];
    try {
      const sellerRes = await fetch(`${baseUrl}/api/sellers/approved`, { cache: 'no-store' });
      if (sellerRes.ok) {
        const sellers: Array<{ id: string; updatedAt?: string }>|null = await sellerRes.json();
        sellerEntries = (sellers || []).map((seller) => ({
          url: `${siteUrl}/sellers/${seller.id}`,
          changeFrequency: 'weekly',
          lastModified: seller.updatedAt ? new Date(seller.updatedAt) : undefined,
          priority: 0.6,
        }));
      }
    } catch (sellerError) {
      // Silently fail if seller endpoint doesn't exist
      console.log('Seller endpoint not available, skipping sellers from sitemap');
    }

    return [...staticPages, ...serviceCategoryPages, ...serviceLocationPages, ...locationPages, ...salonEntries, ...sellerEntries];
  } catch {
    return [...staticPages, ...serviceCategoryPages, ...serviceLocationPages, ...locationPages];
  }
}
