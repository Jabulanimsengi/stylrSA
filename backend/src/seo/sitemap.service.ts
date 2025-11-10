import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

interface SitemapUrl {
  loc: string;
  lastmod: string;
  changefreq: 'daily' | 'weekly' | 'monthly';
  priority: string;
}

@Injectable()
export class SitemapService {
  private readonly logger = new Logger(SitemapService.name);
  private readonly URLS_PER_SITEMAP = 50000;
  private readonly BASE_URL =
    process.env.FRONTEND_URL || 'https://www.stylrsa.co.za';

  constructor(private prisma: PrismaService) {}

  /**
   * Generate sitemap index XML
   * Lists all paginated sitemaps
   */
  async generateSitemapIndex(): Promise<string> {
    this.logger.log('Generating sitemap index');

    // Calculate total possible URLs from keywords × locations
    const keywordCount = await this.prisma.seoKeyword.count();
    const locationCount = await this.prisma.seoLocation.count();
    const totalUrls = keywordCount * locationCount;
    const totalSitemaps = Math.ceil(totalUrls / this.URLS_PER_SITEMAP);

    this.logger.log(
      `Total possible URLs: ${totalUrls} (${keywordCount} keywords × ${locationCount} locations), Total sitemaps: ${totalSitemaps}`,
    );

    // Build sitemap index XML
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml +=
      '<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

    for (let i = 0; i < totalSitemaps; i++) {
      xml += '  <sitemap>\n';
      xml += `    <loc>${this.BASE_URL}/sitemap-${i}.xml</loc>\n`;
      xml += `    <lastmod>${new Date().toISOString()}</lastmod>\n`;
      xml += '  </sitemap>\n';
    }

    xml += '</sitemapindex>';

    return xml;
  }

  /**
   * Generate a paginated sitemap XML
   * @param segment - The sitemap segment number (0, 1, 2, etc.)
   */
  async generateSitemap(segment: number): Promise<string> {
    this.logger.log(`Generating sitemap segment ${segment}`);

    const skip = segment * this.URLS_PER_SITEMAP;
    const urls = await this.getAllSEOUrls(skip, this.URLS_PER_SITEMAP);

    this.logger.log(`Retrieved ${urls.length} URLs for segment ${segment}`);

    // Build sitemap XML
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

    for (const url of urls) {
      xml += '  <url>\n';
      xml += `    <loc>${this.BASE_URL}${url.loc}</loc>\n`;
      xml += `    <lastmod>${url.lastmod}</lastmod>\n`;
      xml += `    <changefreq>${url.changefreq}</changefreq>\n`;
      xml += `    <priority>${url.priority}</priority>\n`;
      xml += '  </url>\n';
    }

    xml += '</urlset>';

    return xml;
  }

  /**
   * Get all SEO URLs with pagination
   * Generates URLs from all keyword × location combinations
   */
  async getAllSEOUrls(skip: number, limit: number): Promise<SitemapUrl[]> {
    // Get keywords and locations separately, then combine them
    const keywords = await this.prisma.seoKeyword.findMany({
      orderBy: [{ priority: 'asc' }, { searchVolume: 'desc' }],
      select: {
        slug: true,
        priority: true,
        searchVolume: true,
      },
    });

    const locations = await this.prisma.seoLocation.findMany({
      orderBy: [{ population: 'desc' }, { name: 'asc' }],
      select: {
        slug: true,
        provinceSlug: true,
        type: true,
        population: true,
      },
    });

    // Generate all combinations
    const allUrls: SitemapUrl[] = [];
    const now = new Date().toISOString();

    for (const keyword of keywords) {
      for (const location of locations) {
        // Build URL based on location type
        let url: string;
        if (location.type === 'PROVINCE') {
          url = `/${keyword.slug}/${location.provinceSlug}`;
        } else {
          url = `/${keyword.slug}/${location.provinceSlug}/${location.slug}`;
        }

        allUrls.push({
          loc: url,
          lastmod: now,
          changefreq: this.calculateChangeFreq(keyword, location),
          priority: this.calculatePriority(keyword, location),
        });
      }
    }

    // Apply pagination
    return allUrls.slice(skip, skip + limit);
  }

  /**
   * Calculate priority based on keyword tier and location importance
   * Priority scale: 0.0 to 1.0
   */
  private calculatePriority(keyword: any, location: any): string {
    let priority = 0.5; // Base priority

    // Keyword priority (Tier 1 = highest)
    if (keyword.priority === 1) {
      priority += 0.3; // Tier 1: +0.3
    } else if (keyword.priority === 2) {
      priority += 0.2; // Tier 2: +0.2
    } else {
      priority += 0.1; // Tier 3: +0.1
    }

    // Location type importance
    if (location.type === 'PROVINCE') {
      priority += 0.1; // Province pages are important
    } else if (location.type === 'CITY' || location.type === 'TOWN') {
      priority += 0.05; // City pages are moderately important
    }
    // Suburbs get no bonus

    // Population bonus (if available)
    if (location.population) {
      if (location.population > 1000000) {
        priority += 0.05; // Major cities
      } else if (location.population > 100000) {
        priority += 0.03; // Large cities
      }
    }

    // Cap at 1.0
    priority = Math.min(priority, 1.0);

    return priority.toFixed(2);
  }

  /**
   * Calculate change frequency based on keyword and location
   */
  private calculateChangeFreq(
    keyword: any,
    location: any,
  ): 'daily' | 'weekly' | 'monthly' {
    // High-priority keywords and major locations change more frequently
    if (keyword.priority === 1) {
      if (
        location.type === 'PROVINCE' ||
        (location.population && location.population > 500000)
      ) {
        return 'daily'; // Top keywords in major areas
      }
      return 'weekly'; // Top keywords in smaller areas
    }

    if (keyword.priority === 2) {
      return 'weekly'; // Mid-tier keywords
    }

    return 'monthly'; // Long-tail keywords
  }

  /**
   * Get sitemap statistics
   */
  async getSitemapStats(): Promise<{
    totalUrls: number;
    totalSitemaps: number;
    cachedUrls: number;
    lastGenerated: Date | null;
  }> {
    const keywordCount = await this.prisma.seoKeyword.count();
    const locationCount = await this.prisma.seoLocation.count();
    const totalUrls = keywordCount * locationCount;
    const totalSitemaps = Math.ceil(totalUrls / this.URLS_PER_SITEMAP);
    const cachedUrls = await this.prisma.seoPageCache.count();

    // Get the most recent page generation date
    const latestPage = await this.prisma.seoPageCache.findFirst({
      orderBy: { lastGenerated: 'desc' },
      select: { lastGenerated: true },
    });

    return {
      totalUrls,
      totalSitemaps,
      cachedUrls,
      lastGenerated: latestPage?.lastGenerated || null,
    };
  }
}
