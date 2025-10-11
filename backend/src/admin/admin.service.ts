// backend/src/admin/admin.service.ts

import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
type ApprovalStatus = 'PENDING' | 'APPROVED' | 'REJECTED';
type PlanCode = 'STARTER' | 'ESSENTIAL' | 'GROWTH' | 'PRO' | 'ELITE';
import { NotificationsService } from 'src/notifications/notifications.service';
import { EventsGateway } from 'src/events/events.gateway';

@Injectable()
export class AdminService {
  constructor(
    private prisma: PrismaService,
    private notificationsService: NotificationsService,
    private eventsGateway: EventsGateway,
  ) {}

  private async logAction(params: {
    adminId: string;
    action: string;
    targetType: string;
    targetId: string;
    reason?: string | null;
    metadata?: Record<string, unknown> | null;
  }) {
    const { adminId, action, targetType, targetId, reason, metadata } = params;
    try {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
      await (this.prisma as any).adminActionLog?.create?.({
        data: {
          adminId,
          action,
          targetType,
          targetId,
          reason: reason ?? null,
          metadata: (metadata ?? undefined) as any,
        },
      });
      return;
    } catch {
      // Fallback to raw SQL
    }
    try {
      const exists = (
        await (this.prisma as any).$queryRaw<{ exists: boolean }[]>`
          SELECT to_regclass('"AdminActionLog"') IS NOT NULL as exists
        `
      )[0]?.exists;
      if (exists) {
        const metaJson = metadata ? JSON.stringify(metadata) : null;
        await (this.prisma as any).$executeRawUnsafe(
          `INSERT INTO "AdminActionLog" ("adminId","action","targetType","targetId","reason","metadata")
           VALUES ($1,$2,$3,$4,$5,$6::jsonb)`,
          adminId,
          action,
          targetType,
          targetId,
          reason ?? null,
          metaJson,
        );
      }
    } catch {
      // noop
    }
  }

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
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        approvalStatus: true,
        createdAt: true,
        planCode: true,
        visibilityWeight: true,
        maxListings: true,
        featuredUntil: true,
        owner: {
          select: { id: true, email: true, firstName: true, lastName: true },
        },
      },
    });
  }

  async updateSalonStatus(
    salonId: string,
    status: ApprovalStatus,
    adminId?: string,
  ) {
    const updated = await this.prisma.salon.update({
      where: { id: salonId },
      data: { approvalStatus: status },
      include: {
        owner: { select: { id: true, firstName: true, lastName: true } },
      },
    });

    if (adminId) {
      void this.logAction({
        adminId,
        action: 'SALON_STATUS_UPDATE',
        targetType: 'SALON',
        targetId: salonId,
        metadata: { status },
      });
    }

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

  async updateServiceStatus(
    serviceId: string,
    status: ApprovalStatus,
    adminId?: string,
  ) {
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

    if (adminId) {
      void this.logAction({
        adminId,
        action: 'SERVICE_STATUS_UPDATE',
        targetType: 'SERVICE',
        targetId: serviceId,
        metadata: { status },
      });
    }

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

  async updateReviewStatus(
    reviewId: string,
    status: ApprovalStatus,
    adminId?: string,
  ) {
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

    if (adminId) {
      void this.logAction({
        adminId,
        action: 'REVIEW_STATUS_UPDATE',
        targetType: 'REVIEW',
        targetId: reviewId,
        metadata: { status },
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

  async updateProductStatus(
    productId: string,
    status: ApprovalStatus,
    adminId?: string,
  ) {
    const updated = await this.prisma.product.update({
      where: { id: productId },
      data: { approvalStatus: status },
      include: {
        seller: { select: { id: true } },
      },
    });

    if (adminId) {
      void this.logAction({
        adminId,
        action: 'PRODUCT_STATUS_UPDATE',
        targetType: 'PRODUCT',
        targetId: productId,
        metadata: { status },
      });
    }

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
    overrides?: {
      visibilityWeight?: number;
      maxListings?: number;
      featuredUntil?: Date | null;
    },
  ) {
    const FALLBACKS: Record<
      string,
      { visibilityWeight: number; maxListings: number }
    > = {
      STARTER: { visibilityWeight: 1, maxListings: 2 },
      ESSENTIAL: { visibilityWeight: 2, maxListings: 6 },
      GROWTH: { visibilityWeight: 3, maxListings: 11 },
      PRO: { visibilityWeight: 4, maxListings: 26 },
      ELITE: { visibilityWeight: 5, maxListings: 9999 },
    };
    type PlanPartial = {
      visibilityWeight?: number | null;
      maxListings?: number | null;
    };
    // Normalize and validate incoming plan code (handle 'undefined'/'null' strings)
    const normalizedPlan =
      !planCode || planCode === 'undefined' || planCode === 'null'
        ? undefined
        : planCode;
    const isValidPlan =
      !!normalizedPlan &&
      ['STARTER', 'ESSENTIAL', 'GROWTH', 'PRO', 'ELITE'].includes(
        normalizedPlan,
      );
    let plan: PlanPartial | null = null;
    try {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
      plan = isValidPlan
        ? ((await (this.prisma as any).plan.findUnique({
            where: { code: normalizedPlan },
          })) as unknown as PlanPartial)
        : null;
    } catch {
      // noop: Plan table may be absent in some environments; fallbacks cover values
    }
    const visibilityWeight =
      overrides?.visibilityWeight ??
      plan?.visibilityWeight ??
      (isValidPlan ? FALLBACKS[normalizedPlan] : undefined)?.visibilityWeight ??
      1;
    const maxListings =
      overrides?.maxListings ??
      plan?.maxListings ??
      (isValidPlan ? FALLBACKS[normalizedPlan] : undefined)?.maxListings ??
      2;
    const data: any = {
      visibilityWeight,
      maxListings,
    };
    if (isValidPlan) data.planCode = normalizedPlan as PlanCode;
    if (
      overrides &&
      Object.prototype.hasOwnProperty.call(overrides, 'featuredUntil')
    ) {
      data.featuredUntil = overrides.featuredUntil ?? null;
    }
    const updated = await this.prisma.salon.update({
      where: { id: salonId },
      data,
    });
    try {
      this.eventsGateway.server.emit('visibility:updated', {
        entity: 'salon',
        id: salonId,
      });
    } catch {
      // noop: websocket not critical for persistence
    }
    return updated;
  }

  async setSellerPlan(
    sellerId: string,
    planCode: string,
    overrides?: {
      visibilityWeight?: number;
      maxListings?: number;
      featuredUntil?: Date | null;
    },
  ) {
    const FALLBACKS: Record<
      string,
      { visibilityWeight: number; maxListings: number }
    > = {
      STARTER: { visibilityWeight: 1, maxListings: 2 },
      ESSENTIAL: { visibilityWeight: 2, maxListings: 6 },
      GROWTH: { visibilityWeight: 3, maxListings: 11 },
      PRO: { visibilityWeight: 4, maxListings: 26 },
      ELITE: { visibilityWeight: 5, maxListings: 9999 },
    };
    type SellerPlanPartial = {
      visibilityWeight?: number | null;
      maxListings?: number | null;
    };
    const normalizedPlan =
      !planCode || planCode === 'undefined' || planCode === 'null'
        ? undefined
        : planCode;
    const isValidPlan =
      !!normalizedPlan &&
      ['STARTER', 'ESSENTIAL', 'GROWTH', 'PRO', 'ELITE'].includes(
        normalizedPlan,
      );
    let plan: SellerPlanPartial | null = null;
    try {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
      plan = isValidPlan
        ? ((await (this.prisma as any).plan.findUnique({
            where: { code: normalizedPlan },
          })) as unknown as SellerPlanPartial)
        : null;
    } catch {
      // noop: Plan table may be absent in some environments; fallbacks cover values
    }
    const sellerVisibilityWeight =
      overrides?.visibilityWeight ??
      plan?.visibilityWeight ??
      (isValidPlan ? FALLBACKS[normalizedPlan] : undefined)?.visibilityWeight ??
      1;
    const sellerMaxListings =
      overrides?.maxListings ??
      plan?.maxListings ??
      (isValidPlan ? FALLBACKS[normalizedPlan] : undefined)?.maxListings ??
      2;
    const data: any = {
      sellerVisibilityWeight,
      sellerMaxListings,
    };
    if (isValidPlan) data.sellerPlanCode = normalizedPlan as PlanCode;
    if (
      overrides &&
      Object.prototype.hasOwnProperty.call(overrides, 'featuredUntil')
    ) {
      data.sellerFeaturedUntil = overrides.featuredUntil ?? null;
    }
    const updated = await this.prisma.user.update({
      where: { id: sellerId },
      data,
    });
    try {
      this.eventsGateway.server.emit('visibility:updated', {
        entity: 'seller',
        id: sellerId,
      });
    } catch {
      // noop: websocket not critical for persistence
    }
    return updated;
  }

  async deleteSalonWithCascade(
    salonId: string,
    adminId: string,
    reason?: string,
  ) {
    const salon = await this.prisma.salon.findUnique({
      where: { id: salonId },
      select: { id: true, name: true, ownerId: true },
    });
    if (!salon) throw new NotFoundException('Salon not found');

    // Snapshot salon and its services for archival
    try {
      const snapshot = await this.prisma.salon.findUnique({
        where: { id: salonId },
        select: {
          id: true,
          ownerId: true,
          name: true,
          description: true,
          backgroundImage: true,
          province: true,
          heroImages: true,
          city: true,
          town: true,
          address: true,
          latitude: true,
          longitude: true,
          contactEmail: true,
          phoneNumber: true,
          whatsapp: true,
          website: true,
          bookingType: true,
          offersMobile: true,
          mobileFee: true,
          isAvailableNow: true,
          operatingHours: true,
          operatingDays: true,
          approvalStatus: true,
          avgRating: true,
          planCode: true,
          visibilityWeight: true,
          maxListings: true,
          featuredUntil: true,
          services: {
            select: {
              id: true,
              title: true,
              description: true,
              price: true,
              duration: true,
              images: true,
              approvalStatus: true,
              categoryId: true,
              createdAt: true,
              updatedAt: true,
            },
          },
        },
      });
      if (snapshot) {
        let archived = false;
        // Try via Prisma Client model (when generated)
        try {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
          await (this.prisma as any).deletedSalonArchive?.create?.({
            data: {
              salonId: snapshot.id,
              ownerId: snapshot.ownerId,
              salon: snapshot as unknown as object,
              services: (snapshot.services ?? []) as unknown as object,
              reason: reason ?? null,
              deletedBy: adminId,
            },
          });
          archived = true;
        } catch {
          // fall through to raw SQL
        }

        if (!archived) {
          try {
            const exists = (
              await (this.prisma as any).$queryRaw<{ exists: boolean }[]>`
              SELECT to_regclass('"DeletedSalonArchive"') IS NOT NULL as exists
            `
            )[0]?.exists;
            if (exists) {
              // Use parameterized raw SQL with explicit JSONB casts
              const svcJson = JSON.stringify(snapshot.services ?? []);
              const salonJson = JSON.stringify({
                ...snapshot,
                services: undefined,
              });
              await (this.prisma as any).$executeRawUnsafe(
                `INSERT INTO "DeletedSalonArchive" ("salonId","ownerId","salon","services","reason","deletedBy")
                 VALUES ($1,$2,$3::jsonb,$4::jsonb,$5,$6)`,
                snapshot.id,
                snapshot.ownerId,
                salonJson,
                svcJson,
                reason ?? null,
                adminId,
              );
              archived = true;
            }
          } catch {
            // noop: archival fallback failed
          }
        }
      }
    } catch {
      // Archival is best-effort; proceed with deletion if archive table is unavailable
    }

    await (this.prisma as any).$transaction(async (tx: any) => {
      const services = await tx.service.findMany({
        where: { salonId },
        select: { id: true },
      });
      const serviceIds = services.map((s) => s.id);

      if (serviceIds.length > 0) {
        await tx.promotion.deleteMany({
          where: { serviceId: { in: serviceIds } },
        });
        await tx.serviceLike.deleteMany({
          where: { serviceId: { in: serviceIds } },
        });
      }

      await tx.review.deleteMany({ where: { salonId } });
      await tx.favorite.deleteMany({ where: { salonId } });
      await tx.galleryImage.deleteMany({ where: { salonId } });
      await tx.booking.deleteMany({ where: { salonId } });
      await tx.service.deleteMany({ where: { salonId } });
      await tx.salon.delete({ where: { id: salonId } });
    });

    try {
      const message =
        `Your salon "${salon.name}" has been removed by an administrator.` +
        (reason && reason.trim().length > 0 ? ` Reason: ${reason.trim()}` : '');
      const notification = await this.notificationsService.create(
        salon.ownerId,
        message,
        { link: '/create-salon' },
      );
      this.eventsGateway.sendNotificationToUser(
        salon.ownerId,
        'newNotification',
        notification,
      );
    } catch {
      // noop: notification is best-effort
    }

    try {
      this.eventsGateway.server.emit('salon:deleted', {
        id: salonId,
        by: adminId,
      });
    } catch {
      // noop
    }

    // Log action
    void this.logAction({
      adminId,
      action: 'SALON_DELETE',
      targetType: 'SALON',
      targetId: salonId,
      reason: reason ?? null,
    });

    return { ok: true };
  }

  async getDeletedSalons() {
    // Try typed client first
    try {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
      const rows = await (this.prisma as any).deletedSalonArchive?.findMany?.({
        orderBy: { deletedAt: 'desc' },
      });
      if (Array.isArray(rows)) return rows;
    } catch {
      // fall through
    }
    // Fallback to raw SQL if model or client is not generated
    try {
      const rows = await (this.prisma as any).$queryRawUnsafe(
        'SELECT id, "salonId", "ownerId", salon, services, reason, "deletedBy", "deletedAt", "restoredAt" FROM "DeletedSalonArchive" ORDER BY "deletedAt" DESC',
      );
      return Array.isArray(rows) ? rows : [];
    } catch {
      return [];
    }
  }

  async restoreDeletedSalon(archiveId: string) {
    // Load archive
    let archive: Record<string, any> | null = null;
    try {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
      archive = await (this.prisma as any).deletedSalonArchive?.findUnique?.({
        where: { id: archiveId },
      });
    } catch {
      archive = null;
    }
    if (!archive) {
      try {
        const rows = await (this.prisma as any).$queryRaw`
          SELECT id, "salonId", "ownerId", salon, services, reason, "deletedBy", "deletedAt", "restoredAt"
          FROM "DeletedSalonArchive" WHERE id = ${archiveId} LIMIT 1
        `;
        archive = rows?.[0] ?? null;
      } catch {
        archive = null;
      }
    }
    if (!archive) throw new NotFoundException('Archived profile not found');

    const salonId: string = archive.salonId as string;
    const ownerId: string = archive.ownerId as string;
    const salonData: any = archive.salon ?? {};
    const servicesData: any[] = Array.isArray(archive.services)
      ? archive.services
      : [];

    // Ensure no existing salon blocks restoration (ownerId is unique on Salon)
    const existing = await this.prisma.salon.findFirst({
      where: { OR: [{ id: salonId }, { ownerId }] },
    });
    if (existing) {
      throw new NotFoundException(
        'Cannot restore: owner already has a salon or id is taken',
      );
    }

    // Re-create salon
    const createdSalon = await this.prisma.salon.create({
      data: {
        id: salonId,
        ownerId,
        name: String(salonData.name),
        description: salonData.description ?? null,
        backgroundImage: salonData.backgroundImage ?? null,
        province: String(salonData.province ?? ''),
        heroImages: Array.isArray(salonData.heroImages)
          ? (salonData.heroImages as string[])
          : [],
        city: String(salonData.city ?? ''),
        town: String(salonData.town ?? ''),
        address: salonData.address ?? null,
        latitude: salonData.latitude ?? null,
        longitude: salonData.longitude ?? null,
        contactEmail: salonData.contactEmail ?? null,
        phoneNumber: salonData.phoneNumber ?? null,
        whatsapp: salonData.whatsapp ?? null,
        website: salonData.website ?? null,
        bookingType: salonData.bookingType ?? 'ONSITE',
        offersMobile: !!salonData.offersMobile,
        mobileFee: salonData.mobileFee ?? null,
        isAvailableNow: !!salonData.isAvailableNow,
        operatingHours: salonData.operatingHours ?? null,
        operatingDays: Array.isArray(salonData.operatingDays)
          ? (salonData.operatingDays as string[])
          : [],
        approvalStatus: salonData.approvalStatus ?? 'PENDING',
        avgRating:
          typeof salonData.avgRating === 'number' ? salonData.avgRating : 0,
        planCode: salonData.planCode ?? 'STARTER',
        visibilityWeight:
          typeof salonData.visibilityWeight === 'number'
            ? salonData.visibilityWeight
            : 1,
        maxListings:
          typeof salonData.maxListings === 'number' ? salonData.maxListings : 2,
        featuredUntil: salonData.featuredUntil
          ? new Date(salonData.featuredUntil)
          : null,
      },
    });

    // Re-create services
    for (const svc of servicesData) {
      try {
        await this.prisma.service.create({
          data: {
            id: String(svc.id),
            title: String(svc.title),
            description: String(svc.description ?? ''),
            price: Number(svc.price ?? 0),
            duration: Number(svc.duration ?? 0),
            images: Array.isArray(svc.images) ? (svc.images as string[]) : [],
            approvalStatus: svc.approvalStatus ?? 'PENDING',
            salonId: createdSalon.id,
            categoryId: (svc.categoryId as string | undefined) ?? null,
          },
        });
      } catch {
        // Skip individual service failures to ensure best-effort restoration
      }
    }

    try {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
      await (this.prisma as any).deletedSalonArchive?.update?.({
        where: { id: archiveId },
        data: { restoredAt: new Date() },
      });
    } catch {
      try {
        await (this.prisma as any).$executeRaw`
          UPDATE "DeletedSalonArchive" SET "restoredAt" = NOW() WHERE id = ${archiveId}
        `;
      } catch {
        // noop
      }
    }

    // Attempt to log restore action
    try {
      const ownerId: string = createdSalon.ownerId;
      void this.logAction({
        adminId: ownerId, // if we need real admin id, controller can pass it; using ownerId as placeholder otherwise
        action: 'SALON_RESTORE',
        targetType: 'SALON',
        targetId: createdSalon.id,
      });
    } catch {
      // noop
    }

    return createdSalon;
  }

  async getMetrics() {
    const [salonsPending, servicesPending, reviewsPending, productsPending] =
      await Promise.all([
        this.prisma.salon.count({ where: { approvalStatus: 'PENDING' } }),
        this.prisma.service.count({ where: { approvalStatus: 'PENDING' } }),
        this.prisma.review.count({ where: { approvalStatus: 'PENDING' } }),
        this.prisma.product.count({ where: { approvalStatus: 'PENDING' } }),
      ]);

    const oldestSalon = await this.prisma.salon.findFirst({
      where: { approvalStatus: 'PENDING' },
      orderBy: { createdAt: 'asc' },
      select: { createdAt: true },
    });
    const oldestService = await this.prisma.service.findFirst({
      where: { approvalStatus: 'PENDING' },
      orderBy: { createdAt: 'asc' },
      select: { createdAt: true },
    });
    const oldestReview = await this.prisma.review.findFirst({
      where: { approvalStatus: 'PENDING' },
      orderBy: { createdAt: 'asc' },
      select: { createdAt: true },
    });
    const oldestProduct = await this.prisma.product.findFirst({
      where: { approvalStatus: 'PENDING' },
      orderBy: { createdAt: 'asc' },
      select: { createdAt: true },
    });

    return {
      salonsPending,
      servicesPending,
      reviewsPending,
      productsPending,
      oldest: {
        salon: oldestSalon?.createdAt ?? null,
        service: oldestService?.createdAt ?? null,
        review: oldestReview?.createdAt ?? null,
        product: oldestProduct?.createdAt ?? null,
      },
    };
  }
}
