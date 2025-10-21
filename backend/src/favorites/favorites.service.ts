import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class FavoritesService {
  constructor(private prisma: PrismaService) {}

  async getMyFavorites(userId: string) {
    return this.prisma.favorite.findMany({
      where: { userId },
      include: {
        salon: {
          include: {
            reviews: {
              where: {
                approvalStatus: 'APPROVED',
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

  async toggleFavorite(userId: string, salonId: string) {
    const existingFavorite = await this.prisma.favorite.findUnique({
      where: { userId_salonId: { userId, salonId } },
    });

    if (existingFavorite) {
      // It exists, so we remove it
      await this.prisma.favorite.delete({
        where: { userId_salonId: { userId, salonId } },
      });
      return { favorited: false };
    } else {
      // It does not exist, so we add it
      await this.prisma.favorite.create({
        data: { userId, salonId },
      });
      return { favorited: true };
    }
  }
}
