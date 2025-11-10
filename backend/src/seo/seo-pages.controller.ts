import { Controller, Get, Param, Query, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SEOPageGeneratorService } from './page-generator.service';
import { KeywordService } from './keyword.service';
import { LocationService } from './location.service';

@Controller('seo-pages')
export class SeoPagesController {
  private readonly logger = new Logger(SeoPagesController.name);

  constructor(
    private prisma: PrismaService,
    private pageGenerator: SEOPageGeneratorService,
    private keywordService: KeywordService,
    private locationService: LocationService,
  ) {}

  /**
   * Get SEO page data by URL - generates on-demand if not cached
   */
  @Get('by-url')
  async getPageByUrl(@Query('url') url: string) {
    if (!url) {
      throw new NotFoundException('URL parameter is required');
    }

    // Check cache first
    let cachedPage = await this.prisma.seoPageCache.findUnique({
      where: { url },
      include: {
        keyword: true,
        location: true,
      },
    });

    if (cachedPage) {
      this.logger.log(`Cache hit for URL: ${url}`);
      return cachedPage;
    }

    // Parse URL to extract keyword and location slugs
    this.logger.log(`Cache miss for URL: ${url}, generating on-demand...`);
    const urlParts = url.split('/').filter(Boolean);
    
    if (urlParts.length < 2) {
      throw new NotFoundException(`Invalid URL format: ${url}`);
    }

    const [keywordSlug, provinceSlug, citySlug, suburbSlug] = urlParts;

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
        where: { slug: suburbSlug, type: 'SUBURB', provinceSlug },
      });
    } else if (citySlug) {
      location = await this.prisma.seoLocation.findFirst({
        where: { slug: citySlug, type: { in: ['CITY', 'TOWN'] }, provinceSlug },
      });
    } else {
      location = await this.prisma.seoLocation.findFirst({
        where: { slug: provinceSlug, type: 'PROVINCE' },
      });
    }

    if (!location) {
      throw new NotFoundException(`Location not found for URL: ${url}`);
    }

    // Generate page data
    const pageData = await this.pageGenerator.generatePageData(keyword, location);

    // Cache the generated page
    cachedPage = await this.prisma.seoPageCache.create({
      data: {
        keywordId: keyword.id,
        locationId: location.id,
        url: pageData.url,
        h1: pageData.h1,
        h2Headings: pageData.h2Headings,
        h3Headings: pageData.h3Headings,
        introText: pageData.introText,
        metaTitle: pageData.metaTitle,
        metaDescription: pageData.metaDescription,
        schemaMarkup: pageData.breadcrumbs as any,
        relatedServices: pageData.relatedServices as any,
        nearbyLocations: pageData.nearbyLocations as any,
        serviceCount: pageData.serviceCount,
        salonCount: pageData.salonCount,
        avgPrice: pageData.avgPrice,
      },
      include: {
        keyword: true,
        location: true,
      },
    });

    this.logger.log(`Generated and cached page for URL: ${url}`);
    return cachedPage;
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
      where: { id: parseInt(id, 10) },
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
