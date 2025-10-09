// backend/src/admin/admin.service.ts

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ApprovalStatus } from '@prisma/client';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  async getPendingSalons() {
    return this.prisma.salon.findMany({
      where: { approvalStatus: 'PENDING' },
      // FIX: Use `select` to prevent circular references and leaking sensitive data.
      include: {
        owner: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
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
    const existing = await this.prisma.review.findUnique({
      where: { id: reviewId },
      select: { salonId: true },
    });
    const updated = await this.prisma.review.update({
      where: { id: reviewId },
      data: { approvalStatus: status },
    });
    if (existing?.salonId) {
      const agg = await this.prisma.review.aggregate({
        where: { salonId: existing.salonId, approvalStatus: 'APPROVED' },
        _avg: { rating: true },
      });
      await this.prisma.salon.update({
        where: { id: existing.salonId },
        data: { avgRating: agg._avg.rating ?? 0 },
      });
    }
    return updated;
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
