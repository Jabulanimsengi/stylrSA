// backend/src/likes/likes.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class LikesService {
  constructor(private prisma: PrismaService) {}

  async toggleLike(userId: string, serviceId: string) {
    const existingLike = await this.prisma.serviceLike.findUnique({
      where: { userId_serviceId: { userId, serviceId } },
    });

    if (existingLike) {
      await this.prisma.serviceLike.delete({
        where: { userId_serviceId: { userId, serviceId } },
      });
      await this.prisma.service.update({
        where: { id: serviceId },
        data: { likeCount: { decrement: 1 } },
      });
      return { liked: false };
    } else {
      await this.prisma.serviceLike.create({
        data: { userId, serviceId },
      });
      await this.prisma.service.update({
        where: { id: serviceId },
        data: { likeCount: { increment: 1 } },
      });
      return { liked: true };
    }
  }
}