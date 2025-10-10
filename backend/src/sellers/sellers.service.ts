import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class SellersService {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string) {
    const seller = await this.prisma.user.findFirst({
      where: { id, role: 'PRODUCT_SELLER' },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        createdAt: true,
        products: {
          where: { approvalStatus: 'APPROVED' },
          select: {
            id: true,
            name: true,
            description: true,
            price: true,
            images: true,
            stock: true,
            sellerId: true,
            isOnSale: true,
            salePrice: true,
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!seller) {
      throw new NotFoundException('Seller not found');
    }

    return seller;
  }
}
