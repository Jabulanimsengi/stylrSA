import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Decimal } from '@prisma/client/runtime/library';

interface SeoKeyword {
  id: string;
  keyword: string;
  slug: string;
  category: string;
  priority: number;
  searchVolume: number | null;
  difficulty: number | null;
  variations: string[];
  createdAt: Date;
  updatedAt: Date;
}

interface SeoLocation {
  id: string;
  name: string;
  slug: string;
  type: string;
  province: string;
  provinceSlug: string;
  parentLocationId: string | null;
  latitude: Decimal | null;
  longitude: Decimal | null;
  population: number | null;
  serviceCount: number;
  salonCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface RelatedLink {
  label: string;
  url: string;
  type: 'service' | 'location';
}

export interface Breadcrumb {
  label: string;
  url: string;
}

export interface SchemaMarkup {
  '@context': string;
  '@graph': any[];
}

export interface SEOPageData {
  keyword: SeoKeyword;
  location: SeoLocation;
  url: string;
  h1: string;
  h2Headings: string[];
  h3Headings: string[];
  introText: string;
  metaTitle: string;
  metaDescription: string;
  breadcrumbs: Breadcrumb[];
  relatedServices: RelatedLink[];
  nearbyLocations: RelatedLink[];
  serviceCount: number;
  salonCount: number;
  avgPrice?: number;
}

@Injectable()
export class SEOPageGeneratorService {
  private readonly logger = new Logger(SEOPageGeneratorService.name);
  private readonly cache = new Map<string, { data: SEOPageData; expiry: number }>();
  private readonly MEMORY_CACHE_TTL = 3600000; // 1 hour in memory only

  constructor(private prisma: PrismaService) {}

  private getCacheKey(keyword: SeoKeyword, location: SeoLocation): string {
    return `${keyword.id}:${location.id}`;
  }

  private getCached(key: string): SEOPageData | null {
    const cached = this.cache.get(key);
    if (cached && cached.expiry > Date.now()) {
      return cached.data;
    }
    this.cache.delete(key);
    return null;
  }

  private setCache(key: string, data: SEOPageData): void {
    this.cache.set(key, {
      data,
      expiry: Date.now() + this.MEMORY_CACHE_TTL,
    });
  }

  /**
   * Generate H1 heading with format: "Find {keyword} in {city}, {province} | Book Online"
   */
  generateH1(keyword: SeoKeyword, location: SeoLocation): string {
    const locationName = this.getLocationDisplayName(location);
    return `Find ${keyword.keyword} in ${locationName} | Book Online`;
  }

  /**
   * Generate H2 headings (3-5 headings)
   */
  generateH2Headings(
    keyword: SeoKeyword,
    location: SeoLocation,
    serviceCount: number,
  ): string[] {
    const locationName = this.getLocationDisplayName(location);
    const cityName = location.type === 'PROVINCE' ? location.name : location.name;

    const headings = [
      `Top-Rated ${keyword.keyword} in ${cityName}`,
      `${serviceCount}+ ${keyword.keyword} Services Available`,
      `Why Choose ${keyword.keyword} in ${locationName}?`,
      `Book ${keyword.keyword} Appointments Online`,
    ];

    // Add location-specific heading if it's a city or suburb
    if (location.type !== 'PROVINCE') {
      headings.push(`Best ${keyword.keyword} Near You in ${cityName}`);
    }

    return headings.slice(0, 5); // Return max 5 headings
  }

  /**
   * Generate H3 headings (5-8 headings)
   */
  generateH3Headings(
    keyword: SeoKeyword,
    location: SeoLocation,
  ): string[] {
    const cityName = location.type === 'PROVINCE' ? location.name : location.name;

    const headings = [
      `Professional ${keyword.keyword} Services`,
      `Verified ${keyword.keyword} Providers`,
      `Affordable ${keyword.keyword} Options`,
      `Same-Day ${keyword.keyword} Appointments`,
      `Highly Recommended ${keyword.keyword} in ${cityName}`,
      `Customer Reviews & Ratings`,
      `Compare ${keyword.keyword} Prices`,
      `Book with Confidence`,
    ];

    return headings.slice(0, 8); // Return max 8 headings
  }

  /**
   * Generate meta title (max 60 characters)
   */
  generateMetaTitle(keyword: SeoKeyword, location: SeoLocation): string {
    const locationName = this.getLocationDisplayName(location);
    
    // Format: "{keyword} in {location} | Book Online"
    let title = `${keyword.keyword} in ${locationName} | Book`;
    
    // Ensure it's under 60 characters
    if (title.length > 60) {
      // Try shorter format: "{keyword} {city} | Book"
      const cityName = location.type === 'PROVINCE' ? location.name : location.name;
      title = `${keyword.keyword} ${cityName} | Book`;
      
      // If still too long, truncate keyword
      if (title.length > 60) {
        const maxKeywordLength = 60 - cityName.length - 9; // " | Book" = 7 chars + space
        const truncatedKeyword = keyword.keyword.substring(0, maxKeywordLength);
        title = `${truncatedKeyword} ${cityName} | Book`;
      }
    }
    
    return title;
  }

  /**
   * Generate meta description (max 160 characters)
   */
  generateMetaDescription(
    keyword: SeoKeyword,
    location: SeoLocation,
    count: number,
  ): string {
    const locationName = this.getLocationDisplayName(location);
    
    // Format: "Find the best {keyword} in {location}. Book appointments online with {count}+ verified professionals. Compare prices & reviews."
    let description = `Find the best ${keyword.keyword} in ${locationName}. Book appointments online with ${count}+ verified professionals. Compare prices & reviews.`;
    
    // Ensure it's under 160 characters
    if (description.length > 160) {
      // Try shorter format
      description = `Book ${keyword.keyword} in ${locationName}. ${count}+ verified professionals. Compare prices, read reviews & book online instantly.`;
      
      // If still too long, use minimal format
      if (description.length > 160) {
        const cityName = location.type === 'PROVINCE' ? location.name : location.name;
        description = `Book ${keyword.keyword} in ${cityName}. ${count}+ verified pros. Compare & book online.`;
      }
    }
    
    return description;
  }

  /**
   * Generate unique introductory text (150-300 words)
   * Rotates between 5 different templates based on location ID
   */
  generateIntroText(
    keyword: SeoKeyword,
    location: SeoLocation,
    serviceCount: number,
    salonCount: number,
    avgPrice?: number,
  ): string {
    const locationName = this.getLocationDisplayName(location);
    const cityName = location.type === 'PROVINCE' ? location.name : location.name;
    const provinceName = location.province;

    // Select template based on location ID hash (ensures consistency)
    const templateIndex = this.hashLocationId(location.id) % 5;

    const templates = [
      // Template 1: Standard
      `Looking for the best ${keyword.keyword} in ${locationName}? Stylr SA connects you with ${serviceCount} verified services from ${salonCount} top-rated salons and beauty professionals. Compare prices, read authentic reviews, and book appointments online instantly—all in one place.

Whether you're searching for ${keyword.keyword} for a special occasion or regular maintenance, ${cityName} offers a diverse range of options to suit every style and budget. Our platform makes it easy to discover highly-rated professionals near you, view their portfolios, check real-time availability, and secure your booking in just a few clicks.

${avgPrice ? `Average prices for ${keyword.keyword} in ${cityName} start from R${avgPrice.toFixed(0)}.` : ''} Browse verified reviews from real customers, compare service offerings, and find the perfect match for your beauty needs. Book with confidence knowing that all our listed professionals are vetted and highly recommended by the ${cityName} community.`,

      // Template 2: Benefits-focused
      `Discover ${serviceCount} exceptional ${keyword.keyword} options in ${locationName}. Stylr SA is your trusted platform for finding and booking beauty services with ${salonCount} verified salons and independent professionals ready to serve you.

Skip the hassle of endless searching and phone calls. Our platform lets you browse portfolios, read verified reviews, check real-time availability, and book appointments 24/7. Whether you need same-day service or want to plan ahead, finding the right professional in ${cityName} has never been easier.

${avgPrice ? `With competitive pricing starting from R${avgPrice.toFixed(0)}, ` : ''}you'll find options for every budget without compromising on quality. All professionals on our platform are verified, insured, and committed to delivering exceptional service. Join thousands of satisfied customers who trust Stylr SA for their beauty needs in ${cityName}.`,

      // Template 3: Local-focused
      `${cityName} is home to some of ${provinceName}'s finest beauty professionals, and Stylr SA brings them all together in one convenient platform. With ${serviceCount} services available from ${salonCount} top-rated providers, finding your perfect ${keyword.keyword} match has never been simpler.

Our platform is designed specifically for the ${cityName} community, featuring local professionals who understand the unique style preferences and beauty trends of ${provinceName}. Browse detailed profiles, view before-and-after photos, read authentic customer reviews, and book appointments that fit your schedule—all from your phone or computer.

${avgPrice ? `Transparent pricing starting from R${avgPrice.toFixed(0)} means no surprises.` : ''} Whether you're a ${cityName} local or just visiting, Stylr SA makes it easy to look and feel your best. Book online now and experience the convenience of modern beauty service booking.`,

      // Template 4: Quality-focused
      `Finding quality ${keyword.keyword} in ${locationName} just got easier. Stylr SA features ${serviceCount} carefully curated services from ${salonCount} verified beauty professionals who meet our strict quality standards. Every provider on our platform is vetted for professionalism, hygiene standards, and customer satisfaction.

What sets us apart is our commitment to transparency and quality. Read detailed reviews from real customers, view comprehensive portfolios showcasing actual work, and compare services side-by-side. Our booking system shows real-time availability, making it simple to find appointments that work with your schedule.

${avgPrice ? `With services starting from R${avgPrice.toFixed(0)}, ` : ''}${cityName} offers excellent value for professional beauty services. Whether you're looking for a trusted regular provider or trying something new, our platform helps you make informed decisions. Book your ${keyword.keyword} appointment today and discover why thousands of ${provinceName} residents trust Stylr SA.`,

      // Template 5: Convenience-focused
      `Book ${keyword.keyword} in ${locationName} with just a few taps. Stylr SA streamlines your beauty booking experience with ${serviceCount} services from ${salonCount} professional providers, all available for instant online booking. No more phone tag or waiting for callbacks—see availability and book immediately.

Our platform is built for modern life. Browse services during your commute, book appointments during your lunch break, and manage everything from your phone. Get instant booking confirmations, receive appointment reminders, and even reschedule if plans change. It's beauty booking designed for your busy lifestyle.

${avgPrice ? `Competitive pricing from R${avgPrice.toFixed(0)} ` : 'Transparent pricing '}ensures you know exactly what to expect. Compare options, read reviews, and choose the perfect provider for your needs—all in ${cityName}. Join the growing community of ${provinceName} residents who've simplified their beauty routine with Stylr SA.`,
    ];

    return templates[templateIndex].trim();
  }

  /**
   * Generate related service links (internal linking)
   * Returns links to other services in the same location
   */
  async generateRelatedServices(
    keyword: SeoKeyword,
    location: SeoLocation,
    limit: number = 10,
  ): Promise<RelatedLink[]> {
    this.logger.debug(
      `Generating related services for ${keyword.keyword} in ${location.name}`,
    );

    // Get other keywords in same category, exclude current keyword
    const relatedKeywords = await this.prisma.seoKeyword.findMany({
      where: {
        category: keyword.category,
        id: { not: keyword.id },
      },
      orderBy: [
        { priority: 'asc' },
        { searchVolume: 'desc' },
      ],
      take: limit,
    });

    const links: RelatedLink[] = relatedKeywords.map(k => ({
      label: `${k.keyword} in ${location.name}`,
      url: this.buildUrl(k.slug, location),
      type: 'service' as const,
    }));

    this.logger.debug(`Generated ${links.length} related service links`);
    return links;
  }

  /**
   * Generate nearby location links (internal linking)
   * Returns links to the same service in nearby locations
   */
  async generateNearbyLocations(
    keyword: SeoKeyword,
    location: SeoLocation,
    limit: number = 10,
  ): Promise<RelatedLink[]> {
    this.logger.debug(
      `Generating nearby locations for ${keyword.keyword} in ${location.name}`,
    );

    let nearbyLocations: SeoLocation[] = [];

    // Strategy 1: If location has coordinates, find nearby by distance
    if (location.latitude && location.longitude) {
      nearbyLocations = await this.getNearbyLocationsByDistance(location, limit);
    }

    // Strategy 2: If it's a suburb, get other suburbs in same city
    if (
      nearbyLocations.length < limit &&
      (location.type === 'SUBURB' || location.type === 'TOWNSHIP') &&
      location.parentLocationId
    ) {
      const siblings = await this.prisma.seoLocation.findMany({
        where: {
          parentLocationId: location.parentLocationId,
          id: { not: location.id },
        },
        orderBy: [
          { population: 'desc' },
          { name: 'asc' },
        ],
        take: limit - nearbyLocations.length,
      });
      nearbyLocations.push(...siblings);
    }

    // Strategy 3: Get other cities/towns in same province
    if (nearbyLocations.length < limit) {
      const samProvince = await this.prisma.seoLocation.findMany({
        where: {
          provinceSlug: location.provinceSlug,
          id: { not: location.id },
          type: {
            in: ['CITY', 'TOWN'],
          },
        },
        orderBy: [
          { population: 'desc' },
          { salonCount: 'desc' },
        ],
        take: limit - nearbyLocations.length,
      });
      nearbyLocations.push(...samProvince);
    }

    const links: RelatedLink[] = nearbyLocations.map(loc => ({
      label: `${keyword.keyword} in ${loc.name}`,
      url: this.buildUrl(keyword.slug, loc),
      type: 'location' as const,
    }));

    this.logger.debug(`Generated ${links.length} nearby location links`);
    return links;
  }

  /**
   * Helper: Get nearby locations by geographic distance
   */
  private async getNearbyLocationsByDistance(
    location: SeoLocation,
    limit: number,
  ): Promise<SeoLocation[]> {
    const lat = Number(location.latitude);
    const lon = Number(location.longitude);

    // Get all locations in same province with coordinates
    const candidates = await this.prisma.seoLocation.findMany({
      where: {
        provinceSlug: location.provinceSlug,
        id: { not: location.id },
        latitude: { not: null },
        longitude: { not: null },
      },
    });

    // Calculate distances and sort
    const locationsWithDistance = candidates
      .map(candidate => {
        const distance = this.calculateDistance(
          lat,
          lon,
          Number(candidate.latitude),
          Number(candidate.longitude),
        );
        return { location: candidate, distance };
      })
      .sort((a, b) => a.distance - b.distance)
      .slice(0, limit)
      .map(item => item.location);

    return locationsWithDistance;
  }

  /**
   * Helper: Calculate distance between two coordinates using Haversine formula
   */
  private calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number,
  ): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.toRadians(lat2 - lat1);
    const dLon = this.toRadians(lon2 - lon1);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(lat1)) *
        Math.cos(this.toRadians(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  /**
   * Helper: Convert degrees to radians
   */
  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  /**
   * Generate Schema.org JSON-LD markup
   */
  generateSchema(page: SEOPageData): SchemaMarkup {
    const baseUrl = process.env.FRONTEND_URL || 'https://www.stylrsa.co.za';
    const fullUrl = `${baseUrl}${page.url}`;

    const schema: SchemaMarkup = {
      '@context': 'https://schema.org',
      '@graph': [],
    };

    // 1. Organization schema
    schema['@graph'].push({
      '@type': 'Organization',
      '@id': `${baseUrl}/#organization`,
      name: 'Stylr SA',
      url: baseUrl,
      logo: {
        '@type': 'ImageObject',
        url: `${baseUrl}/logo.png`,
      },
      sameAs: [
        'https://www.facebook.com/stylrsa',
        'https://www.instagram.com/stylrsa',
        'https://twitter.com/stylrsa',
      ],
    });

    // 2. WebSite schema
    schema['@graph'].push({
      '@type': 'WebSite',
      '@id': `${baseUrl}/#website`,
      url: baseUrl,
      name: 'Stylr SA',
      publisher: {
        '@id': `${baseUrl}/#organization`,
      },
      potentialAction: {
        '@type': 'SearchAction',
        target: `${baseUrl}/search?q={search_term_string}`,
        'query-input': 'required name=search_term_string',
      },
    });

    // 3. BreadcrumbList schema
    const breadcrumbItems = page.breadcrumbs.map((crumb, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: crumb.label,
      item: `${baseUrl}${crumb.url}`,
    }));

    schema['@graph'].push({
      '@type': 'BreadcrumbList',
      '@id': `${fullUrl}#breadcrumb`,
      itemListElement: breadcrumbItems,
    });

    // 4. WebPage schema
    schema['@graph'].push({
      '@type': 'WebPage',
      '@id': `${fullUrl}#webpage`,
      url: fullUrl,
      name: page.metaTitle,
      description: page.metaDescription,
      isPartOf: {
        '@id': `${baseUrl}/#website`,
      },
      breadcrumb: {
        '@id': `${fullUrl}#breadcrumb`,
      },
      inLanguage: 'en-ZA',
    });

    // 5. ItemList schema for services (if services exist)
    if (page.serviceCount > 0) {
      schema['@graph'].push({
        '@type': 'ItemList',
        '@id': `${fullUrl}#servicelist`,
        name: `${page.keyword.keyword} in ${page.location.name}`,
        description: `List of ${page.serviceCount} ${page.keyword.keyword} services available in ${page.location.name}`,
        numberOfItems: page.serviceCount,
        itemListElement: page.relatedServices.slice(0, 5).map((service, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          url: `${baseUrl}${service.url}`,
          name: service.label,
        })),
      });
    }

    return schema;
  }

  /**
   * Generate breadcrumbs for the page
   */
  generateBreadcrumbs(
    keyword: SeoKeyword,
    location: SeoLocation,
    locationHierarchy?: SeoLocation[],
  ): Breadcrumb[] {
    const breadcrumbs: Breadcrumb[] = [
      { label: 'Home', url: '/' },
      { label: keyword.keyword, url: `/${keyword.slug}` },
    ];

    // If we have location hierarchy, use it
    if (locationHierarchy && locationHierarchy.length > 0) {
      locationHierarchy.forEach(loc => {
        breadcrumbs.push({
          label: loc.name,
          url: `/${keyword.slug}/${loc.provinceSlug}${loc.type !== 'PROVINCE' ? `/${loc.slug}` : ''}`,
        });
      });
    } else {
      // Build breadcrumbs from current location
      if (location.type === 'PROVINCE') {
        breadcrumbs.push({
          label: location.name,
          url: `/${keyword.slug}/${location.provinceSlug}`,
        });
      } else {
        // Add province
        breadcrumbs.push({
          label: location.province,
          url: `/${keyword.slug}/${location.provinceSlug}`,
        });
        // Add city/town/suburb
        breadcrumbs.push({
          label: location.name,
          url: `/${keyword.slug}/${location.provinceSlug}/${location.slug}`,
        });
      }
    }

    return breadcrumbs;
  }

  /**
   * Build URL for keyword + location combination
   */
  buildUrl(keywordSlug: string, location: SeoLocation): string {
    // Format: /[keyword]/[province]/[city] or /[keyword]/[province]/[city]/[suburb]
    const parts = [keywordSlug, location.provinceSlug];

    if (location.type === 'PROVINCE') {
      // Province-level: /keyword/province
      return `/${parts.join('/')}`;
    }

    // Add city/town slug
    parts.push(location.slug);

    // If it's a suburb, we need to include parent city
    if (
      (location.type === 'SUBURB' || location.type === 'TOWNSHIP') &&
      location.parentLocationId
    ) {
      // This will be handled by the caller to fetch parent location
      // For now, just use the suburb slug
      return `/${parts.join('/')}`;
    }

    return `/${parts.join('/')}`;
  }

  /**
   * Fetch services filtered by keyword category and location
   */
  async fetchServices(
    keyword: SeoKeyword,
    location: SeoLocation,
    limit: number = 20,
  ): Promise<any[]> {
    this.logger.debug(
      `Fetching services for ${keyword.keyword} in ${location.name}`,
    );

    // Build location filter based on location type
    const locationFilter: any = {};
    
    if (location.type === 'PROVINCE') {
      locationFilter.province = location.name;
    } else if (location.type === 'CITY' || location.type === 'TOWN') {
      locationFilter.city = location.name;
      locationFilter.province = location.province;
    } else if (location.type === 'SUBURB' || location.type === 'TOWNSHIP') {
      locationFilter.town = location.name;
      locationFilter.province = location.province;
    }

    // Fetch services with salon information
    const services = await this.prisma.service.findMany({
      where: {
        approvalStatus: 'APPROVED',
        salon: {
          approvalStatus: 'APPROVED',
          ...locationFilter,
        },
      },
      include: {
        salon: {
          select: {
            id: true,
            name: true,
            city: true,
            province: true,
            avgRating: true,
            visibilityWeight: true,
          },
        },
        category: {
          select: {
            name: true,
          },
        },
      },
      orderBy: [
        { salon: { visibilityWeight: 'desc' } },
        { salon: { avgRating: 'desc' } },
        { createdAt: 'desc' },
      ],
      take: limit,
    });

    this.logger.debug(`Found ${services.length} services`);
    return services;
  }

  /**
   * Fetch salons filtered by location
   */
  async fetchSalons(location: SeoLocation, limit: number = 20): Promise<any[]> {
    this.logger.debug(`Fetching salons in ${location.name}`);

    // Build location filter based on location type
    const locationFilter: any = {};
    
    if (location.type === 'PROVINCE') {
      locationFilter.province = location.name;
    } else if (location.type === 'CITY' || location.type === 'TOWN') {
      locationFilter.city = location.name;
      locationFilter.province = location.province;
    } else if (location.type === 'SUBURB' || location.type === 'TOWNSHIP') {
      locationFilter.town = location.name;
      locationFilter.province = location.province;
    }

    const salons = await this.prisma.salon.findMany({
      where: {
        approvalStatus: 'APPROVED',
        ...locationFilter,
      },
      select: {
        id: true,
        name: true,
        description: true,
        city: true,
        province: true,
        town: true,
        avgRating: true,
        visibilityWeight: true,
        logo: true,
        heroImages: true,
        _count: {
          select: {
            services: {
              where: {
                approvalStatus: 'APPROVED',
              },
            },
          },
        },
      },
      orderBy: [
        { visibilityWeight: 'desc' },
        { avgRating: 'desc' },
        { createdAt: 'desc' },
      ],
      take: limit,
    });

    this.logger.debug(`Found ${salons.length} salons`);
    return salons;
  }

  /**
   * Get service count for keyword and location
   */
  async getServiceCount(
    keyword: SeoKeyword,
    location: SeoLocation,
  ): Promise<number> {
    const locationFilter: any = {};
    
    if (location.type === 'PROVINCE') {
      locationFilter.province = location.name;
    } else if (location.type === 'CITY' || location.type === 'TOWN') {
      locationFilter.city = location.name;
      locationFilter.province = location.province;
    } else if (location.type === 'SUBURB' || location.type === 'TOWNSHIP') {
      locationFilter.town = location.name;
      locationFilter.province = location.province;
    }

    const count = await this.prisma.service.count({
      where: {
        approvalStatus: 'APPROVED',
        salon: {
          approvalStatus: 'APPROVED',
          ...locationFilter,
        },
      },
    });

    return count;
  }

  /**
   * Get salon count for location
   */
  async getSalonCount(location: SeoLocation): Promise<number> {
    const locationFilter: any = {};
    
    if (location.type === 'PROVINCE') {
      locationFilter.province = location.name;
    } else if (location.type === 'CITY' || location.type === 'TOWN') {
      locationFilter.city = location.name;
      locationFilter.province = location.province;
    } else if (location.type === 'SUBURB' || location.type === 'TOWNSHIP') {
      locationFilter.town = location.name;
      locationFilter.province = location.province;
    }

    const count = await this.prisma.salon.count({
      where: {
        approvalStatus: 'APPROVED',
        ...locationFilter,
      },
    });

    return count;
  }

  /**
   * Get average price for services in keyword category and location
   */
  async getAvgPrice(
    keyword: SeoKeyword,
    location: SeoLocation,
  ): Promise<number | undefined> {
    const locationFilter: any = {};
    
    if (location.type === 'PROVINCE') {
      locationFilter.province = location.name;
    } else if (location.type === 'CITY' || location.type === 'TOWN') {
      locationFilter.city = location.name;
      locationFilter.province = location.province;
    } else if (location.type === 'SUBURB' || location.type === 'TOWNSHIP') {
      locationFilter.town = location.name;
      locationFilter.province = location.province;
    }

    const result = await this.prisma.service.aggregate({
      where: {
        approvalStatus: 'APPROVED',
        salon: {
          approvalStatus: 'APPROVED',
          ...locationFilter,
        },
      },
      _avg: {
        price: true,
      },
    });

    return result._avg.price || undefined;
  }

  /**
   * Helper: Hash location ID to get consistent template selection
   */
  private hashLocationId(id: string): number {
    let hash = 0;
    for (let i = 0; i < id.length; i++) {
      const char = id.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }

  /**
   * Helper: Get location display name with province
   */
  private getLocationDisplayName(location: SeoLocation): string {
    if (location.type === 'PROVINCE') {
      return location.name;
    }
    
    // For cities/towns/suburbs: "City, Province"
    return `${location.name}, ${location.province}`;
  }

  /**
   * Generate complete page data for a keyword and location
   */
  async generatePageData(
    keyword: SeoKeyword,
    location: SeoLocation,
  ): Promise<SEOPageData> {
    this.logger.debug(
      `Generating page data for ${keyword.keyword} in ${location.name}`,
    );

    // Get counts and stats
    const serviceCount = await this.getServiceCount(keyword, location);
    const salonCount = await this.getSalonCount(location);
    const avgPrice = await this.getAvgPrice(keyword, location);

    // Generate content
    const h1 = this.generateH1(keyword, location);
    const h2Headings = this.generateH2Headings(keyword, location, serviceCount);
    const h3Headings = this.generateH3Headings(keyword, location);
    const metaTitle = this.generateMetaTitle(keyword, location);
    const metaDescription = this.generateMetaDescription(keyword, location, serviceCount);
    const introText = this.generateIntroText(keyword, location, serviceCount, salonCount, avgPrice);

    // Generate links
    const relatedServices = await this.generateRelatedServices(keyword, location);
    const nearbyLocations = await this.generateNearbyLocations(keyword, location);

    // Generate breadcrumbs
    const breadcrumbs = this.generateBreadcrumbs(keyword, location);

    // Build URL
    const url = this.buildUrl(keyword.slug, location);

    const pageData: SEOPageData = {
      keyword,
      location,
      url,
      h1,
      h2Headings,
      h3Headings,
      introText,
      metaTitle,
      metaDescription,
      breadcrumbs,
      relatedServices,
      nearbyLocations,
      serviceCount,
      salonCount,
      avgPrice,
    };

    this.logger.debug(`Generated page data for ${url}`);
    return pageData;
  }

  /**
   * Helper: Truncate text to max length
   */
  private truncate(text: string, maxLength: number): string {
    if (text.length <= maxLength) {
      return text;
    }
    return text.substring(0, maxLength - 3) + '...';
  }
}
