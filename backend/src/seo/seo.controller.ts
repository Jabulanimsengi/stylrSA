import { Controller, Get, Param, Header } from '@nestjs/common';
import { SitemapService } from './sitemap.service';

@Controller('seo')
export class SeoController {
  constructor(private readonly sitemapService: SitemapService) {}

  /**
   * Get sitemap index
   * GET /seo/sitemap-index
   */
  @Get('sitemap-index')
  @Header('Content-Type', 'application/xml')
  @Header('Cache-Control', 'public, max-age=3600')
  async getSitemapIndex(): Promise<string> {
    return await this.sitemapService.generateSitemapIndex();
  }

  /**
   * Get paginated sitemap
   * GET /seo/sitemap/:segment
   */
  @Get('sitemap/:segment')
  @Header('Content-Type', 'application/xml')
  @Header('Cache-Control', 'public, max-age=3600')
  async getSitemap(@Param('segment') segment: string): Promise<string> {
    const segmentNum = parseInt(segment, 10);
    if (isNaN(segmentNum) || segmentNum < 0) {
      throw new Error('Invalid segment number');
    }
    return await this.sitemapService.generateSitemap(segmentNum);
  }

  /**
   * Get sitemap statistics
   * GET /seo/sitemap-stats
   */
  @Get('sitemap-stats')
  async getSitemapStats() {
    return await this.sitemapService.getSitemapStats();
  }
}
