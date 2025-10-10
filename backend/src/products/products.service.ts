import {
  Injectable,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { User, UserRole, ApprovalStatus } from '@prisma/client';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  async create(user: User, dto: CreateProductDto) {
    return this.prisma.product.create({
      data: {
        ...dto,
        sellerId: user.id,
      },
    });
  }

  async findAllApproved() {
    return this.prisma.product.findMany({
      where: { approvalStatus: ApprovalStatus.APPROVED },
      include: {
        seller: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
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
    const product = await this.findProductAndCheckOwnership(productId, user);
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
