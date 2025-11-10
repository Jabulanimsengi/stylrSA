import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

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

export enum KeywordCategory {
  HAIR = 'HAIR',
  NAILS = 'NAILS',
  SPA = 'SPA',
  MASSAGE = 'MASSAGE',
  MAKEUP = 'MAKEUP',
  LASHES = 'LASHES',
  BROWS = 'BROWS',
  MENS_GROOMING = 'MENS_GROOMING',
  AESTHETICS = 'AESTHETICS',
  TATTOO = 'TATTOO',
  PIERCING = 'PIERCING',
  HOLISTIC = 'HOLISTIC',
  GENERAL = 'GENERAL',
}

@Injectable()
export class KeywordService {
  private readonly logger = new Logger(KeywordService.name);
  private keywordCache: Map<string, SeoKeyword> = new Map();
  private allKeywordsCache: SeoKeyword[] | null = null;
  private cacheTimestamp: number = 0;
  private readonly CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

  constructor(private prisma: PrismaService) {}

  /**
   * Get all keywords from database with caching
   */
  async getAllKeywords(): Promise<SeoKeyword[]> {
    const now = Date.now();
    
    // Return cached data if still valid
    if (this.allKeywordsCache && (now - this.cacheTimestamp) < this.CACHE_TTL) {
      this.logger.debug('Returning cached keywords');
      return this.allKeywordsCache;
    }

    this.logger.log('Fetching all keywords from database');
    const keywords = await this.prisma.seoKeyword.findMany({
      orderBy: [
        { priority: 'asc' },
        { searchVolume: 'desc' },
      ],
    });

    // Update cache
    this.allKeywordsCache = keywords;
    this.cacheTimestamp = now;
    
    // Also populate individual keyword cache
    keywords.forEach(keyword => {
      this.keywordCache.set(keyword.slug, keyword);
    });

    this.logger.log(`Loaded ${keywords.length} keywords into cache`);
    return keywords;
  }

  /**
   * Get keywords by category
   */
  async getKeywordsByCategory(category: KeywordCategory | string): Promise<SeoKeyword[]> {
    this.logger.debug(`Fetching keywords for category: ${category}`);
    
    // Ensure cache is populated
    await this.getAllKeywords();
    
    const keywords = await this.prisma.seoKeyword.findMany({
      where: {
        category: category,
      },
      orderBy: [
        { priority: 'asc' },
        { searchVolume: 'desc' },
      ],
    });

    this.logger.debug(`Found ${keywords.length} keywords in category ${category}`);
    return keywords;
  }

  /**
   * Get keywords by priority tier (1 = highest, 3 = lowest)
   */
  async getKeywordsByPriority(priority: number): Promise<SeoKeyword[]> {
    this.logger.debug(`Fetching keywords with priority: ${priority}`);
    
    const keywords = await this.prisma.seoKeyword.findMany({
      where: {
        priority: priority,
      },
      orderBy: [
        { searchVolume: 'desc' },
        { keyword: 'asc' },
      ],
    });

    this.logger.debug(`Found ${keywords.length} keywords with priority ${priority}`);
    return keywords;
  }

  /**
   * Find keyword by slug with caching
   */
  async getKeywordBySlug(slug: string): Promise<SeoKeyword | null> {
    // Check cache first
    if (this.keywordCache.has(slug)) {
      this.logger.debug(`Cache hit for keyword slug: ${slug}`);
      return this.keywordCache.get(slug)!;
    }

    this.logger.debug(`Cache miss for keyword slug: ${slug}, fetching from database`);
    const keyword = await this.prisma.seoKeyword.findUnique({
      where: {
        slug: slug,
      },
    });

    if (keyword) {
      // Add to cache
      this.keywordCache.set(slug, keyword);
    }

    return keyword;
  }

  /**
   * Get top keywords by search volume
   */
  async getTopKeywords(limit: number = 100): Promise<SeoKeyword[]> {
    this.logger.debug(`Fetching top ${limit} keywords by search volume`);
    
    const keywords = await this.prisma.seoKeyword.findMany({
      orderBy: [
        { searchVolume: 'desc' },
        { priority: 'asc' },
      ],
      take: limit,
    });

    return keywords;
  }

  /**
   * Clear the cache (useful for testing or after bulk updates)
   */
  clearCache(): void {
    this.logger.log('Clearing keyword cache');
    this.keywordCache.clear();
    this.allKeywordsCache = null;
    this.cacheTimestamp = 0;
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): { size: number; age: number; isValid: boolean } {
    const age = Date.now() - this.cacheTimestamp;
    return {
      size: this.keywordCache.size,
      age: age,
      isValid: age < this.CACHE_TTL,
    };
  }
}
