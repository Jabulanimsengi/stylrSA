import {
  Injectable,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { calculateVisibilityScore } from 'src/common/visibility';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

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

    return this.prisma.product.create({
      data: {
        ...dto,
        sellerId: user.id,
      },
    });
  }

  async findAllApproved() {
    const products = await this.prisma.product.findMany({
      where: { approvalStatus: 'APPROVED' },
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
