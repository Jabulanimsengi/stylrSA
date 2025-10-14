import {
  Injectable,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { calculateVisibilityScore } from 'src/common/visibility';
import { NotificationsService } from '../notifications/notifications.service';
import { EventsGateway } from '../events/events.gateway';

interface ProductFilters {
  category?: string;
  priceMin?: string;
  priceMax?: string;
  search?: string;
  inStock?: string;
}

@Injectable()
export class ProductsService {
  constructor(
    private prisma: PrismaService,
    private notificationsService: NotificationsService,
    private eventsGateway: EventsGateway,
  ) {}

  async create(user: any, dto: CreateProductDto) {
    // Enforce plan-based listing cap for product seller
    const currentCount = await this.prisma.product.count({
      where: { sellerId: user.id },
    });
    const maxListings = user.sellerMaxListings ?? 2;
    if (currentCount >= maxListings) {
      throw new ForbiddenException(
        `Listing limit reached for your plan (max ${maxListings} products). Upgrade your plan to add more.`,
      );
    }

    const product = await this.prisma.product.create({
      data: {
        ...dto,
        sellerId: user.id,
      },
    });

    const admins = await this.prisma.user.findMany({
      where: { role: 'ADMIN' },
      select: { id: true },
    });

    const sellerName = user.firstName 
      ? `${user.firstName} ${user.lastName || ''}`.trim() 
      : 'A seller';

    for (const admin of admins) {
      const notification = await this.notificationsService.create(
        admin.id,
        `New product "${product.name}" by ${sellerName} is pending approval.`,
        { link: '/admin?tab=products' },
      );
      this.eventsGateway.sendNotificationToUser(
        admin.id,
        'newNotification',
        notification,
      );
    }

    return product;
  }

  async findAllApproved(filters: ProductFilters = {}) {
    const { category, priceMin, priceMax, search, inStock } = filters;

    const where: any = {
      approvalStatus: 'APPROVED',
    };

    if (category) {
      where.category = { equals: category, mode: 'insensitive' };
    }

    if (search) {
      const term = search.trim();
      if (term.length > 0) {
        where.OR = [
          { name: { contains: term, mode: 'insensitive' } },
          { description: { contains: term, mode: 'insensitive' } },
        ];
      }
    }

    if (priceMin || priceMax) {
      where.price = {};
      if (priceMin) {
        const min = Number(priceMin);
        if (!Number.isNaN(min)) where.price.gte = min;
      }
      if (priceMax) {
        const max = Number(priceMax);
        if (!Number.isNaN(max)) where.price.lte = max;
      }
    }

    if (inStock === 'true') {
      where.stock = { gt: 0 };
    }

    const products = await this.prisma.product.findMany({
      where,
      include: {
        seller: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            // following fields may not exist in older prisma types
            sellerVisibilityWeight: true,
            sellerFeaturedUntil: true,
          },
        },
      },
    });

    const score = (p: {
      seller?: {
        sellerVisibilityWeight?: number | null;
        sellerFeaturedUntil?: Date | string | null;
      } | null;
      createdAt: Date | string;
    }) =>
      calculateVisibilityScore({
        visibilityWeight: p.seller?.sellerVisibilityWeight ?? 1,
        featuredUntil: p.seller?.sellerFeaturedUntil ?? null,
        createdAt: p.createdAt,
      });

    return products.sort((a, b) => {
      const sb = score(b) - score(a);
      if (sb !== 0) return sb;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }

  findMyProducts(user: any) {
    return this.prisma.product.findMany({
      where: { sellerId: user.id },
    });
  }

  findProductsForSeller(user: any, sellerId: string) {
    if (user.id !== sellerId && user.role !== 'ADMIN') {
      throw new ForbiddenException(
        'You are not authorized to view these products.',
      );
    }

    return this.prisma.product.findMany({ where: { sellerId } });
  }

  async update(user: any, productId: string, dto: UpdateProductDto) {
    await this.findProductAndCheckOwnership(productId, user);
    return this.prisma.product.update({
      where: { id: productId },
      data: { ...dto, approvalStatus: 'PENDING' },
    });
  }

  async remove(user: any, productId: string) {
    await this.findProductAndCheckOwnership(productId, user);
    await this.prisma.product.delete({ where: { id: productId } });
  }

  private async findProductAndCheckOwnership(productId: string, user: any) {
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
    });
    if (!product) {
      throw new NotFoundException('Product not found');
    }
    if (product.sellerId !== user.id && user.role !== 'ADMIN') {
      throw new ForbiddenException(
        'You are not authorized to perform this action.',
      );
    }
    return product;
  }
}
