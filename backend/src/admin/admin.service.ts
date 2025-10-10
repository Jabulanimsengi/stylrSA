// backend/src/admin/admin.service.ts

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ApprovalStatus } from '@prisma/client';
import { NotificationsService } from 'src/notifications/notifications.service';
import { EventsGateway } from 'src/events/events.gateway';

@Injectable()
export class AdminService {
  constructor(
    private prisma: PrismaService,
    private notificationsService: NotificationsService,
    private eventsGateway: EventsGateway,
  ) {}

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
      include: { owner: { select: { id: true, email: true, firstName: true, lastName: true } } },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        approvalStatus: true,
        createdAt: true,
        owner: true,
        visibilityWeight: true,
        maxListings: true,
        featuredUntil: true,
      } as any,
    });
  }

  async updateSalonStatus(salonId: string, status: ApprovalStatus) {
    const updated = await this.prisma.salon.update({
      where: { id: salonId },
      data: { approvalStatus: status },
      include: {
        owner: { select: { id: true, firstName: true, lastName: true } },
      },
    });

    if (updated.owner) {
      const message = `Your salon "${updated.name}" has been ${status.toLowerCase()}.`;
      const notification = await this.notificationsService.create(
        updated.owner.id,
        message,
        { link: '/dashboard' },
      );
      this.eventsGateway.sendNotificationToUser(
        updated.owner.id,
        'newNotification',
        notification,
      );
    }

    return updated;
  }

  async getPendingServices() {
    return this.prisma.service.findMany({
      where: { approvalStatus: 'PENDING' },
      include: { salon: true },
    });
  }

  async updateServiceStatus(serviceId: string, status: ApprovalStatus) {
    const updated = await this.prisma.service.update({
      where: { id: serviceId },
      data: { approvalStatus: status },
      include: {
        salon: {
          select: {
            name: true,
            owner: { select: { id: true } },
          },
        },
      },
    });

    const ownerId = updated.salon?.owner?.id;
    if (ownerId) {
      const message = `Your service "${updated.title}" has been ${status.toLowerCase()}.`;
      const notification = await this.notificationsService.create(
        ownerId,
        message,
        { link: '/dashboard?tab=services' },
      );
      this.eventsGateway.sendNotificationToUser(
        ownerId,
        'newNotification',
        notification,
      );
    }

    return updated;
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
      include: {
        author: { select: { id: true } },
        salon: { select: { name: true } },
      },
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

    if (updated.author) {
      const message = `Your review for ${updated.salon?.name ?? 'the salon'} has been ${status.toLowerCase()}.`;
      const notification = await this.notificationsService.create(
        updated.author.id,
        message,
        { link: '/my-profile?tab=reviews' },
      );
      this.eventsGateway.sendNotificationToUser(
        updated.author.id,
        'newNotification',
        notification,
      );
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
    const updated = await this.prisma.product.update({
      where: { id: productId },
      data: { approvalStatus: status },
      include: {
        seller: { select: { id: true } },
      },
    });

    if (updated.seller) {
      const message = `Your product "${updated.name}" has been ${status.toLowerCase()}.`;
      const notification = await this.notificationsService.create(
        updated.seller.id,
        message,
        { link: '/product-dashboard' },
      );
      this.eventsGateway.sendNotificationToUser(
        updated.seller.id,
        'newNotification',
        notification,
      );
    }

    return updated;
  }

  async setSalonPlan(
    salonId: string,
    planCode: string,
    overrides?: { visibilityWeight?: number; maxListings?: number; featuredUntil?: Date | null },
  ) {
    const FALLBACKS: Record<string, { visibilityWeight: number; maxListings: number }> = {
      STARTER: { visibilityWeight: 1, maxListings: 2 },
      ESSENTIAL: { visibilityWeight: 2, maxListings: 6 },
      GROWTH: { visibilityWeight: 3, maxListings: 11 },
      PRO: { visibilityWeight: 4, maxListings: 26 },
      ELITE: { visibilityWeight: 5, maxListings: 9999 },
    };
    let plan: any = null;
    try {
      plan = await (this.prisma as any).plan.findUnique({ where: { code: planCode } });
    } catch {}
    const visibilityWeight = overrides?.visibilityWeight ?? plan?.visibilityWeight ?? FALLBACKS[planCode]?.visibilityWeight ?? 1;
    const maxListings = overrides?.maxListings ?? plan?.maxListings ?? FALLBACKS[planCode]?.maxListings ?? 2;
    const data: any = { visibilityWeight, maxListings };
    if (overrides && Object.prototype.hasOwnProperty.call(overrides, 'featuredUntil')) {
      data.featuredUntil = overrides.featuredUntil ?? null;
    }
    return this.prisma.salon.update({ where: { id: salonId }, data });
  }

  async setSellerPlan(
    sellerId: string,
    planCode: string,
    overrides?: { visibilityWeight?: number; maxListings?: number; featuredUntil?: Date | null },
  ) {
    const FALLBACKS: Record<string, { visibilityWeight: number; maxListings: number }> = {
      STARTER: { visibilityWeight: 1, maxListings: 2 },
      ESSENTIAL: { visibilityWeight: 2, maxListings: 6 },
      GROWTH: { visibilityWeight: 3, maxListings: 11 },
      PRO: { visibilityWeight: 4, maxListings: 26 },
      ELITE: { visibilityWeight: 5, maxListings: 9999 },
    };
    let plan: any = null;
    try {
      plan = await (this.prisma as any).plan.findUnique({ where: { code: planCode } });
    } catch {}
    const sellerVisibilityWeight = overrides?.visibilityWeight ?? plan?.visibilityWeight ?? FALLBACKS[planCode]?.visibilityWeight ?? 1;
    const sellerMaxListings = overrides?.maxListings ?? plan?.maxListings ?? FALLBACKS[planCode]?.maxListings ?? 2;
    const data: any = { sellerVisibilityWeight, sellerMaxListings };
    if (overrides && Object.prototype.hasOwnProperty.call(overrides, 'featuredUntil')) {
      data.sellerFeaturedUntil = overrides.featuredUntil ?? null;
    }
    return this.prisma.user.update({ where: { id: sellerId }, data });
  }
}
