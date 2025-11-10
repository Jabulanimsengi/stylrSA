import { PrismaClient } from '@prisma/client';
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

interface PageGenerationResult {
  url: string;
  action: 'created' | 'updated' | 'skipped';
}

class SEOPagePreGenerator {
  private prisma: PrismaClient;
  private readonly CACHE_TTL_HOURS = 24;
  private readonly BATCH_SIZE: number;
  private readonly MAX_RETRIES = 3;
  private readonly PARALLEL_LIMIT = 3; // Process 3 pages in parallel (reduced for DB stability)

  constructor() {
    this.prisma = new PrismaClient({
      datasources: {
        db: {
          url: process.env.DATABASE_URL,
        },
      },
      log: ['error', 'warn'],
    });
    this.BATCH_SIZE = parseInt(process.env.SEO_BATCH_SIZE || '5000', 10);
  }

  /**
   * Main entry point - generates all SEO pages with batch processing
   */
  async generateAllPages(): Promise<void> {
    console.log('🚀 Starting SEO page pre-generation...');
    console.log(`⚙️  Batch size: ${this.BATCH_SIZE}`);
    const startTime = Date.now();

    try {
      // Get all keywords ordered by priority
      const keywords = await this.prisma.seoKeyword.findMany({
        orderBy: [{ priority: 'asc' }, { searchVolume: 'desc' }],
      });

      console.log(`📊 Found ${keywords.length} keywords`);

      let totalCreated = 0;
      let totalUpdated = 0;
      let totalSkipped = 0;
      let totalErrors = 0;

      // Phase 1: Process provinces first (highest priority)
      console.log('\n📍 Phase 1: Processing province-level pages...');
      const provinces = await this.prisma.seoLocation.findMany({
        where: { type: 'PROVINCE' },
        orderBy: { name: 'asc' },
      });

      const provinceStats = await this.processBatch(
        keywords,
        provinces,
        'Province',
      );
      totalCreated += provinceStats.created;
      totalUpdated += provinceStats.updated;
      totalSkipped += provinceStats.skipped;
      totalErrors += provinceStats.errors;

      // Phase 2: Process cities and towns in batches
      console.log('\n🏙️  Phase 2: Processing city/town-level pages...');
      const cityCount = await this.prisma.seoLocation.count({
        where: { type: { in: ['CITY', 'TOWN'] } },
      });

      console.log(`📊 Found ${cityCount} cities/towns`);
      const cityBatches = Math.ceil(cityCount / this.BATCH_SIZE);

      for (let i = 0; i < cityBatches; i++) {
        const cities = await this.prisma.seoLocation.findMany({
          where: { type: { in: ['CITY', 'TOWN'] } },
          orderBy: [{ population: 'desc' }, { name: 'asc' }],
          skip: i * this.BATCH_SIZE,
          take: this.BATCH_SIZE,
        });

        console.log(
          `\n📦 Processing city batch ${i + 1}/${cityBatches} (${cities.length} cities)`,
        );
        const batchStats = await this.processBatch(
          keywords,
          cities,
          `City Batch ${i + 1}`,
        );

        totalCreated += batchStats.created;
        totalUpdated += batchStats.updated;
        totalSkipped += batchStats.skipped;
        totalErrors += batchStats.errors;
      }

      // Phase 3: Process suburbs and townships in batches
      console.log('\n🏘️  Phase 3: Processing suburb/township-level pages...');
      const suburbCount = await this.prisma.seoLocation.count({
        where: { type: { in: ['SUBURB', 'TOWNSHIP'] } },
      });

      console.log(`📊 Found ${suburbCount} suburbs/townships`);
      const suburbBatches = Math.ceil(suburbCount / this.BATCH_SIZE);

      for (let i = 0; i < suburbBatches; i++) {
        const suburbs = await this.prisma.seoLocation.findMany({
          where: { type: { in: ['SUBURB', 'TOWNSHIP'] } },
          orderBy: [{ population: 'desc' }, { name: 'asc' }],
          skip: i * this.BATCH_SIZE,
          take: this.BATCH_SIZE,
        });

        console.log(
          `\n📦 Processing suburb batch ${i + 1}/${suburbBatches} (${suburbs.length} suburbs)`,
        );
        const batchStats = await this.processBatch(
          keywords,
          suburbs,
          `Suburb Batch ${i + 1}`,
        );

        totalCreated += batchStats.created;
        totalUpdated += batchStats.updated;
        totalSkipped += batchStats.skipped;
        totalErrors += batchStats.errors;
      }

      const duration = ((Date.now() - startTime) / 1000 / 60).toFixed(2);
      console.log('\n✅ SEO page generation complete!');
      console.log(`⏱️  Duration: ${duration} minutes`);
      console.log(`📊 Final Summary:`);
      console.log(`   - Created: ${totalCreated}`);
      console.log(`   - Updated: ${totalUpdated}`);
      console.log(`   - Skipped: ${totalSkipped}`);
      console.log(`   - Errors: ${totalErrors}`);
      console.log(`   - Total: ${totalCreated + totalUpdated + totalSkipped}`);
    } catch (error) {
      console.error('💥 Fatal error during page generation:', error);
      throw error;
    } finally {
      await this.prisma.$disconnect();
    }
  }

  /**
   * Process a batch of locations with all keywords (with parallel processing)
   */
  private async processBatch(
    keywords: SeoKeyword[],
    locations: SeoLocation[],
    batchName: string,
  ): Promise<{
    created: number;
    updated: number;
    skipped: number;
    errors: number;
  }> {
    let created = 0;
    let updated = 0;
    let skipped = 0;
    let errors = 0;

    const totalPages = keywords.length * locations.length;
    let processed = 0;

    // Create all page generation tasks
    const tasks: Array<{ keyword: SeoKeyword; location: SeoLocation }> = [];
    for (const keyword of keywords) {
      for (const location of locations) {
        tasks.push({ keyword, location });
      }
    }

    // Process tasks in parallel batches
    for (let i = 0; i < tasks.length; i += this.PARALLEL_LIMIT) {
      const batch = tasks.slice(i, i + this.PARALLEL_LIMIT);
      
      const results = await Promise.allSettled(
        batch.map(({ keyword, location }) =>
          this.generateAndCachePageWithRetry(keyword, location)
        )
      );

      for (const result of results) {
        if (result.status === 'fulfilled') {
          if (result.value.action === 'created') created++;
          else if (result.value.action === 'updated') updated++;
          else if (result.value.action === 'skipped') skipped++;
        } else {
          errors++;
          console.error(`❌ Error:`, result.reason?.message || result.reason);
        }
      }

      processed += batch.length;

      // Log progress every 1000 pages
      if (processed % 1000 === 0 || processed === totalPages) {
        const percentage = ((processed / totalPages) * 100).toFixed(1);
        console.log(
          `📈 ${batchName} Progress: ${processed}/${totalPages} (${percentage}%) - ${created} created, ${updated} updated, ${skipped} skipped, ${errors} errors`,
        );
      }
    }

    console.log(
      `✅ ${batchName} Complete: ${created} created, ${updated} updated, ${skipped} skipped, ${errors} errors`,
    );

    return { created, updated, skipped, errors };
  }

  /**
   * Generate and cache page with retry logic
   */
  private async generateAndCachePageWithRetry(
    keyword: SeoKeyword,
    location: SeoLocation,
    attempt: number = 1,
  ): Promise<PageGenerationResult> {
    try {
      return await this.generateAndCachePage(keyword, location);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      const isConnectionError = errorMessage.includes('connection') || 
                                errorMessage.includes('TLS') || 
                                errorMessage.includes('database server');
      
      if (attempt < this.MAX_RETRIES) {
        // Longer wait for connection errors
        const waitTime = isConnectionError ? 5000 * attempt : 1000 * Math.pow(2, attempt - 1);
        await new Promise((resolve) => setTimeout(resolve, waitTime));
        return this.generateAndCachePageWithRetry(
          keyword,
          location,
          attempt + 1,
        );
      }
      throw error;
    }
  }

  /**
   * Generate and cache a single SEO page
   */
  async generateAndCachePage(
    keyword: SeoKeyword,
    location: SeoLocation,
  ): Promise<PageGenerationResult> {
    const url = this.buildUrl(keyword.slug, location);

    // Check if page exists and is recent (< 24 hours)
    const existingPage = await this.prisma.seoPageCache.findUnique({
      where: { url },
    });

    if (existingPage) {
      const hoursSinceGeneration =
        (Date.now() - existingPage.lastGenerated.getTime()) / 1000 / 60 / 60;

      if (hoursSinceGeneration < this.CACHE_TTL_HOURS) {
        return { url, action: 'skipped' };
      }
    }

    // Generate page data
    const serviceCount = await this.getServiceCount(keyword, location);
    const salonCount = await this.getSalonCount(location);
    const avgPrice = await this.getAvgPrice(keyword, location);

    // Generate content
    const h1 = this.generateH1(keyword, location);
    const h2Headings = this.generateH2Headings(keyword, location, serviceCount);
    const h3Headings = this.generateH3Headings(keyword, location);
    const introText = this.generateIntroText(
      keyword,
      location,
      serviceCount,
      salonCount,
      avgPrice,
    );
    const metaTitle = this.generateMetaTitle(keyword, location);
    const metaDescription = this.generateMetaDescription(
      keyword,
      location,
      serviceCount,
    );

    // Generate links
    const relatedServices = await this.generateRelatedServices(
      keyword,
      location,
    );
    const nearbyLocations = await this.generateNearbyLocations(
      keyword,
      location,
    );

    // Generate schema markup
    const schemaMarkup = this.generateSchema({
      keyword,
      location,
      url,
      h1,
      h2Headings,
      h3Headings,
      introText,
      metaTitle,
      metaDescription,
      breadcrumbs: this.generateBreadcrumbs(keyword, location),
      relatedServices,
      nearbyLocations,
      serviceCount,
      salonCount,
      avgPrice,
    });

    // Save to database using UPSERT
    await this.prisma.seoPageCache.upsert({
      where: { url },
      create: {
        keywordId: keyword.id,
        locationId: location.id,
        url,
        h1,
        h2Headings,
        h3Headings,
        introText,
        metaTitle,
        metaDescription,
        schemaMarkup,
        relatedServices,
        nearbyLocations,
        serviceCount,
        salonCount,
        avgPrice: avgPrice ? new Decimal(avgPrice) : null,
        lastGenerated: new Date(),
      },
      update: {
        h1,
        h2Headings,
        h3Headings,
        introText,
        metaTitle,
        metaDescription,
        schemaMarkup,
        relatedServices,
        nearbyLocations,
        serviceCount,
        salonCount,
        avgPrice: avgPrice ? new Decimal(avgPrice) : null,
        lastGenerated: new Date(),
      },
    });

    return { url, action: existingPage ? 'updated' : 'created' };
  }

  /**
   * Build URL for keyword + location combination
   */
  private buildUrl(keywordSlug: string, location: SeoLocation): string {
    const parts = [keywordSlug, location.provinceSlug];

    if (location.type !== 'PROVINCE') {
      parts.push(location.slug);
    }

    return `/${parts.join('/')}`;
  }

  /**
   * Get service count for keyword and location
   */
  private async getServiceCount(
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

    return await this.prisma.service.count({
      where: {
        approvalStatus: 'APPROVED',
        salon: {
          approvalStatus: 'APPROVED',
          ...locationFilter,
        },
      },
    });
  }

  /**
   * Get salon count for location
   */
  private async getSalonCount(location: SeoLocation): Promise<number> {
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

    return await this.prisma.salon.count({
      where: {
        approvalStatus: 'APPROVED',
        ...locationFilter,
      },
    });
  }

  /**
   * Get average price for services
   */
  private async getAvgPrice(
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
   * Generate H1 heading
   */
  private generateH1(keyword: SeoKeyword, location: SeoLocation): string {
    const locationName = this.getLocationDisplayName(location);
    return `Find ${keyword.keyword} in ${locationName} | Book Online`;
  }

  /**
   * Generate H2 headings
   */
  private generateH2Headings(
    keyword: SeoKeyword,
    location: SeoLocation,
    serviceCount: number,
  ): string[] {
    const cityName =
      location.type === 'PROVINCE' ? location.name : location.name;

    const headings = [
      `Top-Rated ${keyword.keyword} in ${cityName}`,
      `${serviceCount}+ ${keyword.keyword} Services Available`,
      `Why Choose ${keyword.keyword} in ${this.getLocationDisplayName(location)}?`,
      `Book ${keyword.keyword} Appointments Online`,
    ];

    if (location.type !== 'PROVINCE') {
      headings.push(`Best ${keyword.keyword} Near You in ${cityName}`);
    }

    return headings.slice(0, 5);
  }

  /**
   * Generate H3 headings
   */
  private generateH3Headings(
    keyword: SeoKeyword,
    location: SeoLocation,
  ): string[] {
    const cityName =
      location.type === 'PROVINCE' ? location.name : location.name;

    return [
      `Professional ${keyword.keyword} Services`,
      `Verified ${keyword.keyword} Providers`,
      `Affordable ${keyword.keyword} Options`,
      `Same-Day ${keyword.keyword} Appointments`,
      `Highly Recommended ${keyword.keyword} in ${cityName}`,
      `Customer Reviews & Ratings`,
      `Compare ${keyword.keyword} Prices`,
      `Book with Confidence`,
    ].slice(0, 8);
  }

  /**
   * Generate intro text
   */
  private generateIntroText(
    keyword: SeoKeyword,
    location: SeoLocation,
    serviceCount: number,
    salonCount: number,
    avgPrice?: number,
  ): string {
    const locationName = this.getLocationDisplayName(location);
    const cityName =
      location.type === 'PROVINCE' ? location.name : location.name;
    const provinceName = location.province;

    // Select template based on location ID hash
    const templateIndex = this.hashLocationId(location.id) % 5;

    const templates = [
      `Looking for the best ${keyword.keyword} in ${locationName}? Stylr SA connects you with ${serviceCount} verified services from ${salonCount} top-rated salons and beauty professionals. Compare prices, read authentic reviews, and book appointments online instantly—all in one place.\n\nWhether you're searching for ${keyword.keyword} for a special occasion or regular maintenance, ${cityName} offers a diverse range of options to suit every style and budget. Our platform makes it easy to discover highly-rated professionals near you, view their portfolios, check real-time availability, and secure your booking in just a few clicks.\n\n${avgPrice ? `Average prices for ${keyword.keyword} in ${cityName} start from R${avgPrice.toFixed(0)}.` : ''} Browse verified reviews from real customers, compare service offerings, and find the perfect match for your beauty needs. Book with confidence knowing that all our listed professionals are vetted and highly recommended by the ${cityName} community.`,

      `Discover ${serviceCount} exceptional ${keyword.keyword} options in ${locationName}. Stylr SA is your trusted platform for finding and booking beauty services with ${salonCount} verified salons and independent professionals ready to serve you.\n\nSkip the hassle of endless searching and phone calls. Our platform lets you browse portfolios, read verified reviews, check real-time availability, and book appointments 24/7. Whether you need same-day service or want to plan ahead, finding the right professional in ${cityName} has never been easier.\n\n${avgPrice ? `With competitive pricing starting from R${avgPrice.toFixed(0)}, ` : ''}you'll find options for every budget without compromising on quality. All professionals on our platform are verified, insured, and committed to delivering exceptional service. Join thousands of satisfied customers who trust Stylr SA for their beauty needs in ${cityName}.`,

      `${cityName} is home to some of ${provinceName}'s finest beauty professionals, and Stylr SA brings them all together in one convenient platform. With ${serviceCount} services available from ${salonCount} top-rated providers, finding your perfect ${keyword.keyword} match has never been simpler.\n\nOur platform is designed specifically for the ${cityName} community, featuring local professionals who understand the unique style preferences and beauty trends of ${provinceName}. Browse detailed profiles, view before-and-after photos, read authentic customer reviews, and book appointments that fit your schedule—all from your phone or computer.\n\n${avgPrice ? `Transparent pricing starting from R${avgPrice.toFixed(0)} means no surprises.` : ''} Whether you're a ${cityName} local or just visiting, Stylr SA makes it easy to look and feel your best. Book online now and experience the convenience of modern beauty service booking.`,

      `Finding quality ${keyword.keyword} in ${locationName} just got easier. Stylr SA features ${serviceCount} carefully curated services from ${salonCount} verified beauty professionals who meet our strict quality standards. Every provider on our platform is vetted for professionalism, hygiene standards, and customer satisfaction.\n\nWhat sets us apart is our commitment to transparency and quality. Read detailed reviews from real customers, view comprehensive portfolios showcasing actual work, and compare services side-by-side. Our booking system shows real-time availability, making it simple to find appointments that work with your schedule.\n\n${avgPrice ? `With services starting from R${avgPrice.toFixed(0)}, ` : ''}${cityName} offers excellent value for professional beauty services. Whether you're looking for a trusted regular provider or trying something new, our platform helps you make informed decisions. Book your ${keyword.keyword} appointment today and discover why thousands of ${provinceName} residents trust Stylr SA.`,

      `Book ${keyword.keyword} in ${locationName} with just a few taps. Stylr SA streamlines your beauty booking experience with ${serviceCount} services from ${salonCount} professional providers, all available for instant online booking. No more phone tag or waiting for callbacks—see availability and book immediately.\n\nOur platform is built for modern life. Browse services during your commute, book appointments during your lunch break, and manage everything from your phone. Get instant booking confirmations, receive appointment reminders, and even reschedule if plans change. It's beauty booking designed for your busy lifestyle.\n\n${avgPrice ? `Competitive pricing from R${avgPrice.toFixed(0)} ` : 'Transparent pricing '}ensures you know exactly what to expect. Compare options, read reviews, and choose the perfect provider for your needs—all in ${cityName}. Join the growing community of ${provinceName} residents who've simplified their beauty routine with Stylr SA.`,
    ];

    return templates[templateIndex].trim();
  }

  /**
   * Generate meta title
   */
  private generateMetaTitle(
    keyword: SeoKeyword,
    location: SeoLocation,
  ): string {
    const locationName = this.getLocationDisplayName(location);
    let title = `${keyword.keyword} in ${locationName} | Book`;

    if (title.length > 60) {
      const cityName =
        location.type === 'PROVINCE' ? location.name : location.name;
      title = `${keyword.keyword} ${cityName} | Book`;

      if (title.length > 60) {
        const maxKeywordLength = 60 - cityName.length - 9;
        const truncatedKeyword = keyword.keyword.substring(
          0,
          maxKeywordLength,
        );
        title = `${truncatedKeyword} ${cityName} | Book`;
      }
    }

    return title;
  }

  /**
   * Generate meta description
   */
  private generateMetaDescription(
    keyword: SeoKeyword,
    location: SeoLocation,
    count: number,
  ): string {
    const locationName = this.getLocationDisplayName(location);
    let description = `Find the best ${keyword.keyword} in ${locationName}. Book appointments online with ${count}+ verified professionals. Compare prices & reviews.`;

    if (description.length > 160) {
      description = `Book ${keyword.keyword} in ${locationName}. ${count}+ verified professionals. Compare prices, read reviews & book online instantly.`;

      if (description.length > 160) {
        const cityName =
          location.type === 'PROVINCE' ? location.name : location.name;
        description = `Book ${keyword.keyword} in ${cityName}. ${count}+ verified pros. Compare & book online.`;
      }
    }

    return description;
  }

  /**
   * Generate related services
   */
  private async generateRelatedServices(
    keyword: SeoKeyword,
    location: SeoLocation,
  ): Promise<any> {
    const relatedKeywords = await this.prisma.seoKeyword.findMany({
      where: {
        category: keyword.category,
        id: { not: keyword.id },
      },
      orderBy: [{ priority: 'asc' }, { searchVolume: 'desc' }],
      take: 10,
    });

    return relatedKeywords.map((k) => ({
      label: `${k.keyword} in ${location.name}`,
      url: this.buildUrl(k.slug, location),
      type: 'service',
    }));
  }

  /**
   * Generate nearby locations
   */
  private async generateNearbyLocations(
    keyword: SeoKeyword,
    location: SeoLocation,
  ): Promise<any> {
    const nearbyLocations = await this.prisma.seoLocation.findMany({
      where: {
        provinceSlug: location.provinceSlug,
        id: { not: location.id },
        type: {
          in: ['CITY', 'TOWN'],
        },
      },
      orderBy: [{ population: 'desc' }, { salonCount: 'desc' }],
      take: 10,
    });

    return nearbyLocations.map((loc) => ({
      label: `${keyword.keyword} in ${loc.name}`,
      url: this.buildUrl(keyword.slug, loc),
      type: 'location',
    }));
  }

  /**
   * Generate breadcrumbs
   */
  private generateBreadcrumbs(
    keyword: SeoKeyword,
    location: SeoLocation,
  ): any[] {
    const breadcrumbs = [
      { label: 'Home', url: '/' },
      { label: keyword.keyword, url: `/${keyword.slug}` },
    ];

    if (location.type === 'PROVINCE') {
      breadcrumbs.push({
        label: location.name,
        url: `/${keyword.slug}/${location.provinceSlug}`,
      });
    } else {
      breadcrumbs.push({
        label: location.province,
        url: `/${keyword.slug}/${location.provinceSlug}`,
      });
      breadcrumbs.push({
        label: location.name,
        url: `/${keyword.slug}/${location.provinceSlug}/${location.slug}`,
      });
    }

    return breadcrumbs;
  }

  /**
   * Generate schema markup
   */
  private generateSchema(page: any): any {
    const baseUrl = process.env.FRONTEND_URL || 'https://www.stylrsa.co.za';
    const fullUrl = `${baseUrl}${page.url}`;

    return {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'Organization',
          '@id': `${baseUrl}/#organization`,
          name: 'Stylr SA',
          url: baseUrl,
          logo: {
            '@type': 'ImageObject',
            url: `${baseUrl}/logo.png`,
          },
        },
        {
          '@type': 'BreadcrumbList',
          '@id': `${fullUrl}#breadcrumb`,
          itemListElement: page.breadcrumbs.map((crumb: any, index: number) => ({
            '@type': 'ListItem',
            position: index + 1,
            name: crumb.label,
            item: `${baseUrl}${crumb.url}`,
          })),
        },
        {
          '@type': 'WebPage',
          '@id': `${fullUrl}#webpage`,
          url: fullUrl,
          name: page.metaTitle,
          description: page.metaDescription,
        },
      ],
    };
  }

  /**
   * Helper: Get location display name
   */
  private getLocationDisplayName(location: SeoLocation): string {
    if (location.type === 'PROVINCE') {
      return location.name;
    }
    return `${location.name}, ${location.province}`;
  }

  /**
   * Helper: Hash location ID
   */
  private hashLocationId(id: string): number {
    let hash = 0;
    for (let i = 0; i < id.length; i++) {
      const char = id.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash;
    }
    return Math.abs(hash);
  }
}

// Run if executed directly
if (require.main === module) {
  const generator = new SEOPagePreGenerator();
  generator
    .generateAllPages()
    .then(() => {
      console.log('✅ Script completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Script failed:', error);
      process.exit(1);
    });
}

export default SEOPagePreGenerator;
