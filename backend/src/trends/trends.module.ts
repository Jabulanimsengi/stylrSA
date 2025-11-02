import { Module } from '@nestjs/common';
import { TrendsController } from './trends.controller';
import { TrendsService } from './trends.service';
import { TrendsSalonsService } from './trends-salons.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [TrendsController],
  providers: [TrendsService, TrendsSalonsService],
  exports: [TrendsService, TrendsSalonsService],
})
export class TrendsModule {}
