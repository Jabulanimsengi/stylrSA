import {
  Injectable,
  ForbiddenException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePromotionDto } from './dto/create-promotion.dto';
import { NotificationsService } from '../notifications/notifications.service';
import { EventsGateway } from '../events/events.gateway';

@Injectable()
export class PromotionsService {
  constructor(
    private prisma: PrismaService,
    private notificationsService: NotificationsService,
    private eventsGateway: EventsGateway,
  ) {}

  async create(user: any, dto: CreatePromotionDto) {
    // Get the salon owned by this user
    const salon = await this.prisma.salon.findFirst({
      where: { ownerId: user.id },
    });

    if (!salon) {
      throw new NotFoundException('You do not have a salon profile');
    }

    // Ensure either serviceId or productId is provided
    if (!dto.serviceId && !dto.productId) {
      throw new BadRequestException(
        'Either serviceId or productId must be provided',
      );
    }

    // Validate service belongs to this salon
    let originalPrice = 0;
    if (dto.serviceId) {
      const service = await this.prisma.service.findUnique({
        where: { id: dto.serviceId },
      });

      if (!service || service.salonId !== salon.id) {
        throw new ForbiddenException('Service does not belong to your salon');
      }

      // Check if service already has an active or pending promotion
      const existingPromo = await this.prisma.promotion.findFirst({
        where: {
          serviceId: dto.serviceId,
          approvalStatus: { in: ['PENDING', 'APPROVED'] },
        },
      });

      if (existingPromo) {
        throw new BadRequestException(
          'This service already has an active or pending promotion',
        );
      }

      originalPrice = service.price;
    }

    // Validate product belongs to this seller
    if (dto.productId) {
      const product = await this.prisma.product.findUnique({
        where: { id: dto.productId },
      });

      if (!product || product.sellerId !== user.id) {
        throw new ForbiddenException('Product does not belong to you');
      }

      // Check if product already has an active or pending promotion
      const existingPromo = await this.prisma.promotion.findFirst({
        where: {
          productId: dto.productId,
          approvalStatus: { in: ['PENDING', 'APPROVED'] },
        },
      });

      if (existingPromo) {
        throw new BadRequestException(
          'This product already has an active or pending promotion',
        );
      }

      originalPrice = product.price;
    }

    // Validate dates
    const startDate = new Date(dto.startDate);
    const endDate = new Date(dto.endDate);
    const now = new Date();

    if (startDate < now) {
      throw new BadRequestException('Start date cannot be in the past');
    }

    if (endDate <= startDate) {
      throw new BadRequestException('End date must be after start date');
    }

    // Calculate promotional price
    const promotionalPrice =
      originalPrice * (1 - dto.discountPercentage / 100);

    // Create promotion
    const promotion = await this.prisma.promotion.create({
      data: {
        description: dto.description,
        discountPercentage: dto.discountPercentage,
        originalPrice,
        promotionalPrice,
        startDate,
        endDate,
        serviceId: dto.serviceId,
        productId: dto.productId,
        salonId: salon.id,
        approvalStatus: 'PENDING',
      },
      include: {
        service: true,
        product: true,
      },
    });

    // Notify admins
    const admins = await this.prisma.user.findMany({
      where: { role: 'ADMIN' },
      select: { id: true },
    });

    const itemName = promotion.service
      ? promotion.service.title
      : promotion.product?.name || 'Item';

    for (const admin of admins) {
      const notification = await this.notificationsService.create(
        admin.id,
        `New promotion for "${itemName}" (${dto.discountPercentage}% off) is pending approval.`,
        { link: '/admin?tab=promotions' },
      );
      this.eventsGateway.sendNotificationToUser(
        admin.id,
        'newNotification',
        notification,
      );
    }

    return promotion;
  }

  async findAllPublic(salonId?: string) {
    const now = new Date();
    const where: any = {
      approvalStatus: 'APPROVED',
      startDate: { lte: now },
      endDate: { gte: now },
    };

    // Filter by salon if provided
    if (salonId) {
      where.salonId = salonId;
    }

    return this.prisma.promotion.findMany({
      where,
      include: {
        service: {
          include: {
            salon: {
              select: {
                id: true,
                name: true,
                slug: true,
                city: true,
                province: true,
              },
            },
          },
        },
        product: {
          include: {
            seller: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findForSalon(user: any) {
    const salon = await this.prisma.salon.findFirst({
      where: { ownerId: user.id },
    });

    if (!salon) {
      throw new NotFoundException('You do not have a salon profile');
    }

    const now = new Date();

    // Get active promotions
    const active = await this.prisma.promotion.findMany({
      where: {
        salonId: salon.id,
        approvalStatus: { in: ['PENDING', 'APPROVED'] },
        endDate: { gte: now },
      },
      include: {
        service: true,
        product: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Get expired promotions
    const expired = await this.prisma.promotion.findMany({
      where: {
        salonId: salon.id,
        endDate: { lt: now },
      },
      include: {
        service: true,
        product: true,
      },
      orderBy: {
        endDate: 'desc',
      },
      take: 20, // Limit to last 20 expired
    });

    return { active, expired };
  }

  async findAllForAdmin() {
    return this.prisma.promotion.findMany({
      where: {
        approvalStatus: 'PENDING',
      },
      include: {
        service: {
          include: {
            salon: {
              select: {
                id: true,
                name: true,
                ownerId: true,
              },
            },
          },
        },
        product: {
          include: {
            seller: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    });
  }

  async approve(adminUser: any, promotionId: string) {
    if (adminUser.role !== 'ADMIN') {
      throw new ForbiddenException('Only admins can approve promotions');
    }

    const promotion = await this.prisma.promotion.findUnique({
      where: { id: promotionId },
      include: {
        service: {
          include: {
            salon: {
              select: {
                ownerId: true,
                name: true,
              },
            },
          },
        },
        product: {
          include: {
            seller: {
              select: {
                id: true,
              },
            },
          },
        },
      },
    });

    if (!promotion) {
      throw new NotFoundException('Promotion not found');
    }

    if (promotion.approvalStatus !== 'PENDING') {
      throw new BadRequestException('Promotion is not pending approval');
    }

    const updated = await this.prisma.promotion.update({
      where: { id: promotionId },
      data: {
        approvalStatus: 'APPROVED',
        approvedBy: adminUser.id,
        approvedAt: new Date(),
      },
    });

    // Notify the salon owner
    const ownerId = promotion.service
      ? promotion.service.salon.ownerId
      : promotion.product?.seller.id;

    if (ownerId) {
      const itemName = promotion.service
        ? promotion.service.title
        : promotion.product?.name || 'Item';

      const notification = await this.notificationsService.create(
        ownerId,
        `Your promotion for "${itemName}" has been approved!`,
        { link: '/dashboard?tab=promotions' },
      );

      this.eventsGateway.sendNotificationToUser(
        ownerId,
        'newNotification',
        notification,
      );
    }

    return updated;
  }

  async reject(adminUser: any, promotionId: string, reason?: string) {
    if (adminUser.role !== 'ADMIN') {
      throw new ForbiddenException('Only admins can reject promotions');
    }

    const promotion = await this.prisma.promotion.findUnique({
      where: { id: promotionId },
      include: {
        service: {
          include: {
            salon: {
              select: {
                ownerId: true,
              },
            },
          },
        },
        product: {
          include: {
            seller: {
              select: {
                id: true,
              },
            },
          },
        },
      },
    });

    if (!promotion) {
      throw new NotFoundException('Promotion not found');
    }

    if (promotion.approvalStatus !== 'PENDING') {
      throw new BadRequestException('Promotion is not pending approval');
    }

    const updated = await this.prisma.promotion.update({
      where: { id: promotionId },
      data: {
        approvalStatus: 'REJECTED',
      },
    });

    // Notify the salon owner
    const ownerId = promotion.service
      ? promotion.service.salon.ownerId
      : promotion.product?.seller.id;

    if (ownerId) {
      const itemName = promotion.service
        ? promotion.service.title
        : promotion.product?.name || 'Item';

      const message = reason
        ? `Your promotion for "${itemName}" was rejected. Reason: ${reason}`
        : `Your promotion for "${itemName}" was rejected.`;

      const notification = await this.notificationsService.create(
        ownerId,
        message,
        { link: '/dashboard?tab=promotions' },
      );

      this.eventsGateway.sendNotificationToUser(
        ownerId,
        'newNotification',
        notification,
      );
    }

    return updated;
  }

  async delete(user: any, promotionId: string) {
    const promotion = await this.prisma.promotion.findUnique({
      where: { id: promotionId },
      include: {
        service: {
          include: {
            salon: true,
          },
        },
        product: true,
      },
    });

    if (!promotion) {
      throw new NotFoundException('Promotion not found');
    }

    // Check ownership
    const isOwner = promotion.service
      ? promotion.service.salon.ownerId === user.id
      : promotion.product?.sellerId === user.id;

    if (!isOwner && user.role !== 'ADMIN') {
      throw new ForbiddenException('You cannot delete this promotion');
    }

    await this.prisma.promotion.delete({
      where: { id: promotionId },
    });

    return { message: 'Promotion deleted successfully' };
  }

  // Cron job method to auto-delete expired promotions
  async cleanupExpiredPromotions() {
    const now = new Date();
    const result = await this.prisma.promotion.deleteMany({
      where: {
        endDate: { lt: now },
      },
    });
    return result;
  }
}
