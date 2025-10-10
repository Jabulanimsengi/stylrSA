import {
  Injectable,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePromotionDto } from './dto/create-promotion.dto';
import { User, UserRole } from '@prisma/client';

@Injectable()
export class PromotionsService {
  constructor(private prisma: PrismaService) {}

  async create(user: User, dto: CreatePromotionDto) {
    await this.assertCanManageSalon(user, dto.salonId);
    return this.prisma.promotion.create({
      data: {
        ...dto,
      },
    });
  }

  async findForSalon(user: User, salonId: string) {
    await this.assertCanManageSalon(user, salonId);
    return this.prisma.promotion.findMany({ where: { salonId } });
  }

  private async assertCanManageSalon(user: User, salonId: string) {
    const salon = await this.prisma.salon.findUnique({
      where: { id: salonId },
    });
    if (!salon) {
      throw new NotFoundException('Salon not found');
    }

    if (salon.ownerId !== user.id && user.role !== UserRole.ADMIN) {
      throw new ForbiddenException(
        'You are not authorized to manage promotions for this salon',
      );
    }
  }
}
