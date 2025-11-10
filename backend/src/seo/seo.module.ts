import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { KeywordService } from './keyword.service';
import { LocationService } from './location.service';
import { SEOPageGeneratorService } from './page-generator.service';
import { SitemapService } from './sitemap.service';
import { SeoController } from './seo.controller';
import { SeoPagesController } from './seo-pages.controller';

@Module({
  imports: [PrismaModule],
  controllers: [SeoController, SeoPagesController],
  providers: [
    KeywordService,
    LocationService,
    SEOPageGeneratorService,
    SitemapService,
  ],
  exports: [
    KeywordService,
    LocationService,
    SEOPageGeneratorService,
    SitemapService,
  ],
})
export class SeoModule {}
