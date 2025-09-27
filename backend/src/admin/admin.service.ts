import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { UpdateServiceStatusDto } from './dto/update-service-status.dto';
import { ApprovalStatus } from '@prisma/client';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  async updateServiceStatus(
    serviceId: string,
    dto: UpdateServiceStatusDto,
  ) {
    const service = await this.prisma.service.findUnique({
      where: { id: serviceId },
    });
    if (!service) {
      throw new NotFoundException('Service not found.');
    }
    return this.prisma.service.update({
      where: { id: serviceId },
      data: { approvalStatus: dto.approvalStatus },
    });
  }

  async updateSalonStatus(salonId: string, dto: UpdateServiceStatusDto) {
    const salon = await this.prisma.salon.findUnique({ where: { id: salonId } });
    if (!salon) {
      throw new NotFoundException('Salon not found.');
    }
    return this.prisma.salon.update({
      where: { id: salonId },
      data: { approvalStatus: dto.approvalStatus },
    });
  }

  async getPendingServices() {
    return this.prisma.service.findMany({
      where: { approvalStatus: ApprovalStatus.PENDING },
      include: { salon: { select: { name: true } } },
    });
  }

  async getPendingSalons() {
    return this.prisma.salon.findMany({
      where: { approvalStatus: ApprovalStatus.PENDING },
      include: { owner: { select: { email: true } } },
    });
  }

  async getPendingReviews() {
    return this.prisma.review.findMany({
      where: { approvalStatus: ApprovalStatus.PENDING },
      include: {
        author: { select: { firstName: true, lastName: true } },
        salon: { select: { name: true } },
      },
    });
  }

  async updateReviewStatus(reviewId: string, dto: UpdateServiceStatusDto) {
    const updatedReview = await this.prisma.review.update({
      where: { id: reviewId },
      data: { approvalStatus: dto.approvalStatus },
    });

    if (updatedReview.approvalStatus === ApprovalStatus.APPROVED) {
      const salonReviews = await this.prisma.review.findMany({
        where: {
          salonId: updatedReview.salonId,
          approvalStatus: ApprovalStatus.APPROVED,
        },
      });
      const avgRating =
        salonReviews.reduce((acc, review) => acc + review.rating, 0) /
        salonReviews.length;

      await this.prisma.salon.update({
        where: { id: updatedReview.salonId },
        data: { avgRating: parseFloat(avgRating.toFixed(2)) },
      });
    }

    return updatedReview;
  }
}