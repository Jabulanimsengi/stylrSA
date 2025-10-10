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
    const salon = await this.assertCanManageSalon(user, dto.salonId);
    // Optional safety checks: ensure referenced service/product belongs to this salon/seller
    if (dto.serviceId) {
      const svc = await this.prisma.service.findUnique({ where: { id: dto.serviceId } });
      if (!svc || svc.salonId !== salon.id) {
        throw new ForbiddenException('Service does not belong to this salon');
      }
    }
    if (dto.productId) {
      const prod = await this.prisma.product.findUnique({ where: { id: dto.productId } });
      if (!prod || prod.sellerId !== salon.ownerId) {
        throw new ForbiddenException('Product not associated with this salon owner');
      }
    }

    return this.prisma.promotion.create({
      data: {
        description: dto.description,
        discountPercentage: dto.discountPercentage,
        startDate: new Date(dto.startDate),
        endDate: new Date(dto.endDate),
        serviceId: dto.serviceId,
        productId: dto.productId,
      },
    });
  }

  async findForSalon(user: User, salonId: string) {
    const salon = await this.assertCanManageSalon(user, salonId);
    return this.prisma.promotion.findMany({
      where: {
        OR: [
          { service: { salonId } },
          { product: { sellerId: salon.ownerId } },
        ],
      },
    });
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
    return salon;
  }
}
