import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePromotionDto } from './dto/create-promotion.dto';

@Injectable()
export class PromotionsService {
  constructor(private prisma: PrismaService) {}

  create(dto: CreatePromotionDto) {
    return this.prisma.promotion.create({
      data: {
        ...dto,
      },
    });
  }
}
