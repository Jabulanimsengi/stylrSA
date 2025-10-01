import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ApprovalStatus } from '@prisma/client';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  async getPendingSalons() {
    return this.prisma.salon.findMany({
      where: { approvalStatus: 'PENDING' },
      include: { owner: true },
    });
  }

  async getAllSalons() {
    return this.prisma.salon.findMany({
      include: { owner: { select: { id: true, email: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateSalonStatus(salonId: string, status: ApprovalStatus) {
    return this.prisma.salon.update({
      where: { id: salonId },
      data: { approvalStatus: status },
    });
  }

  async getPendingServices() {
    return this.prisma.service.findMany({
      where: { approvalStatus: 'PENDING' },
      include: { salon: true },
    });
  }

  async updateServiceStatus(serviceId: string, status: ApprovalStatus) {
    return this.prisma.service.update({
      where: { id: serviceId },
      data: { approvalStatus: status },
    });
  }

  async getPendingReviews() {
    return this.prisma.review.findMany({
      where: { approvalStatus: 'PENDING' },
      include: {
        author: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
        salon: {
          select: {
            name: true,
          },
        },
      },
    });
  }

  async updateReviewStatus(reviewId: string, status: ApprovalStatus) {
    return this.prisma.review.update({
      where: { id: reviewId },
      data: { approvalStatus: status },
    });
  }

  async getPendingProducts() {
    return this.prisma.product.findMany({
      where: { approvalStatus: 'PENDING' },
      include: { seller: { select: { firstName: true, lastName: true } } },
    });
  }

  async updateProductStatus(productId: string, status: ApprovalStatus) {
    return this.prisma.product.update({
      where: { id: productId },
      data: { approvalStatus: status },
    });
  }
}