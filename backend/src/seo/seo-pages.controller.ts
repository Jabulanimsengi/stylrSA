import { Controller, Get, Param, Query, NotFoundException, Logger, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SEOPageGeneratorService } from './page-generator.service';
import { KeywordService } from './keyword.service';
import { LocationService } from './location.service';

// Blocklist of patterns commonly used in security probes/scans
const BLOCKED_PATH_PATTERNS = [
  '.git',
  '.env',
  '.htaccess',
  '.htpasswd',
  '.svn',
  '.hg',
  'wp-admin',
  'wp-login',
  'wp-content',
  'wp-includes',
  'phpmyadmin',
  'admin',
  'config',
  'backup',
  '.php',
  '.asp',
  '.aspx',
  '.jsp',
  '.sql',
  '.bak',
  '.old',
  '.log',
  '.xml',
  '.json',
  '.yml',
  '.yaml',
  'node_modules',
  'package.json',
  'composer.json',
  '.well-known',
  'api/v1',
  'graphql',
  'debug',
  'test',
  'shell',
  'cmd',
  'exec',
];

@Controller('seo-pages')
export class SeoPagesController {
  private readonly logger = new Logger(SeoPagesController.name);

  constructor(
    private prisma: PrismaService,
    private pageGenerator: SEOPageGeneratorService,
    private keywordService: KeywordService,
    private locationService: LocationService,
  ) { }

  /**
   * Check if URL matches blocked security probe patterns
   */
  private isBlockedPath(url: string): boolean {
    const lowerUrl = url.toLowerCase();
    return BLOCKED_PATH_PATTERNS.some(pattern => lowerUrl.includes(pattern));
  }

  /**
   * Get SEO page data by URL - generates on-demand
   * NO DATABASE CACHING - Uses in-memory cache only
   */
  @Get('by-url')
  async getPageByUrl(@Query('url') url: string) {
    try {
      // Validate input
      if (!url || typeof url !== 'string') {
        throw new BadRequestException('URL parameter is required');
      }

      // Early security check - block common probe patterns
      if (this.isBlockedPath(url)) {
        this.logger.warn(`Blocked security probe attempt: ${url}`);
        throw new BadRequestException('Invalid request');
      }

      if (url.length > 500) {
        throw new BadRequestException('URL is too long');
      }

      // Normalize URL
      const normalizedUrl = url.toLowerCase().trim();

      // Validate URL format: /keyword/province or /keyword/province/city or /keyword/province/city/suburb
      const urlRegex = /^\/([a-z0-9-]+)(\/[a-z0-9-]+){1,3}$/;
      if (!urlRegex.test(normalizedUrl)) {
        throw new BadRequestException(`Invalid URL format: ${url}`);
      }

      // Parse URL to extract keyword and location slugs
      this.logger.debug(`Generating on-demand for: ${normalizedUrl}`);
      const urlParts = normalizedUrl.split('/').filter(Boolean);

      const [keywordSlug, provinceSlug, citySlug, suburbSlug] = urlParts;

      if (!keywordSlug || !provinceSlug) {
        throw new BadRequestException(`Invalid URL structure: ${url}`);
      }

      // Find keyword
      const keyword = await this.prisma.seoKeyword.findUnique({
        where: { slug: keywordSlug },
      });

      if (!keyword) {
        throw new NotFoundException(`Keyword not found: ${keywordSlug}`);
      }

      // Find location (most specific available)
      let location;
      if (suburbSlug) {
        location = await this.prisma.seoLocation.findFirst({
          where: {
            slug: suburbSlug,
            type: { in: ['SUBURB', 'TOWNSHIP'] },
            provinceSlug,
          },
        });
      } else if (citySlug) {
        location = await this.prisma.seoLocation.findFirst({
          where: {
            slug: citySlug,
            type: { in: ['CITY', 'TOWN', 'SUBURB', 'TOWNSHIP'] },
            provinceSlug,
          },
        });
      } else {
        location = await this.prisma.seoLocation.findFirst({
          where: {
            slug: provinceSlug,
            type: 'PROVINCE',
          },
        });
      }

      if (!location) {
        throw new NotFoundException(`Location not found for URL: ${url}`);
      }

      // Generate page data (uses in-memory cache)
      const pageData = await this.pageGenerator.generatePageData(keyword, location);

      this.logger.debug(`Generated page for URL: ${normalizedUrl}`);

      // Return generated data directly - NO DATABASE CACHING
      return pageData;
    } catch (error) {
      // Re-throw HTTP exceptions as-is (BadRequest, NotFound, etc.)
      if (error instanceof BadRequestException || error instanceof NotFoundException) {
        throw error;
      }
      // Only log actual application errors
      this.logger.error(`Error generating page for ${url}:`, error.message);
      throw new BadRequestException(`Failed to generate SEO page: ${error.message}`);
    }
  }

  /**
   * Get top keywords for static generation
   */
  @Get('keywords/top')
  async getTopKeywords(@Query('limit') limit?: string) {
    const take = limit ? parseInt(limit, 10) : 100;

    const keywords = await this.prisma.seoKeyword.findMany({
      orderBy: [{ priority: 'asc' }, { searchVolume: 'desc' }],
      take,
      select: { slug: true },
    });

    return keywords;
  }

  /**
   * Get all provinces
   */
  @Get('locations/provinces')
  async getProvinces() {
    const provinces = await this.prisma.seoLocation.findMany({
      where: { type: 'PROVINCE' },
      select: { provinceSlug: true },
    });

    return provinces;
  }

  /**
   * Get top cities for static generation
   */
  @Get('locations/cities/top')
  async getTopCities(@Query('limit') limit?: string) {
    const take = limit ? parseInt(limit, 10) : 100;

    const cities = await this.prisma.seoLocation.findMany({
      where: {
        type: { in: ['CITY', 'TOWN'] },
      },
      orderBy: [{ population: 'desc' }, { salonCount: 'desc' }],
      take,
      select: { slug: true, provinceSlug: true },
    });

    return cities;
  }

  /**
   * Get location by ID (for parent lookups)
   */
  @Get('locations/:id')
  async getLocationById(@Param('id') id: string) {
    const location = await this.prisma.seoLocation.findUnique({
      where: { id },
    });

    if (!location) {
      throw new NotFoundException(`Location not found with ID: ${id}`);
    }

    return location;
  }

  /**
   * Get first cached page for a keyword (any location)
   */
  @Get('keyword/:slug/first')
  async getFirstPageForKeyword(@Param('slug') slug: string) {
    const cachedPage = await this.prisma.seoPageCache.findFirst({
      where: {
        url: {
          startsWith: `/${slug}`,
        },
      },
      orderBy: {
        lastGenerated: 'desc',
      },
      include: {
        keyword: true,
        location: true,
      },
    });

    if (!cachedPage) {
      throw new NotFoundException(`No cached pages found for keyword: ${slug}`);
    }

    return cachedPage;
  }

  /**
   * Get keyword by slug
   */
  @Get('keywords/:slug')
  async getKeywordBySlug(@Param('slug') slug: string) {
    const keyword = await this.prisma.seoKeyword.findUnique({
      where: { slug },
    });

    if (!keyword) {
      throw new NotFoundException(`Keyword not found: ${slug}`);
    }

    return keyword;
  }
}
