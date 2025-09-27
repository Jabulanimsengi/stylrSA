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

    return this.prisma.$transaction(async (tx) => {
      if (existingLike) {
        // User has already liked it, so UNLIKE
        await tx.serviceLike.delete({
          where: { userId_serviceId: { userId, serviceId } },
        });
        await tx.service.update({
          where: { id: serviceId },
          data: { likeCount: { decrement: 1 } },
        });
        return { liked: false };
      } else {
        // User has not liked it, so LIKE
        await tx.serviceLike.create({
          data: { userId, serviceId },
        });
        await tx.service.update({
          where: { id: serviceId },
          data: { likeCount: { increment: 1 } },
        });
        return { liked: true };
      }
    });
  }
}