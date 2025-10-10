import {
  Injectable,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { User, UserRole, ApprovalStatus } from '@prisma/client';
import { calculateVisibilityScore } from 'src/common/visibility';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  async create(user: User, dto: CreateProductDto) {
    // Enforce plan-based listing cap for product seller
    const currentCount = await this.prisma.product.count({
      where: { sellerId: user.id },
    });
    const maxListings =
      (user as User & { sellerMaxListings?: number }).sellerMaxListings ?? 2;
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
      where: { approvalStatus: ApprovalStatus.APPROVED },
      include: {
        seller: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            // following fields may not exist in older prisma types
            // @ts-expect-error - field is present in our schema but may be missing in older generated types
            sellerVisibilityWeight: true,
            // @ts-expect-error - field is present in our schema but may be missing in older generated types
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

  async findMyProducts(user: User) {
    return this.prisma.product.findMany({
      where: { sellerId: user.id },
    });
  }

  async findProductsForSeller(user: User, sellerId: string) {
    if (user.id !== sellerId && user.role !== UserRole.ADMIN) {
      throw new ForbiddenException(
        'You are not authorized to view these products.',
      );
    }

    return this.prisma.product.findMany({ where: { sellerId } });
  }

  async update(user: User, productId: string, dto: UpdateProductDto) {
    await this.findProductAndCheckOwnership(productId, user);
    return this.prisma.product.update({
      where: { id: productId },
      data: { ...dto, approvalStatus: ApprovalStatus.PENDING },
    });
  }

  async remove(user: User, productId: string) {
    await this.findProductAndCheckOwnership(productId, user);
    await this.prisma.product.delete({ where: { id: productId } });
  }

  private async findProductAndCheckOwnership(productId: string, user: User) {
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
    });
    if (!product) {
      throw new NotFoundException('Product not found');
    }
    if (product.sellerId !== user.id && user.role !== UserRole.ADMIN) {
      throw new ForbiddenException(
        'You are not authorized to perform this action.',
      );
    }
    return product;
  }
}
