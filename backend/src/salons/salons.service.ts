import {
  Injectable,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSalonDto, UpdateSalonDto, UpdateSalonPlanDto } from './dto';
import { compareByVisibilityThenRecency } from 'src/common/visibility';
import {
  normalizeOperatingHours,
  isOpenNowFromHours,
} from './utils/operating-hours.util';
import { NotificationsService } from '../notifications/notifications.service';
import { EventsGateway } from '../events/events.gateway';

type PlanCode = 'FREE' | 'STARTER' | 'ESSENTIAL' | 'GROWTH' | 'PRO' | 'ELITE';
type PlanPaymentStatus =
  | 'PENDING_SELECTION'
  | 'AWAITING_PROOF'
  | 'PROOF_SUBMITTED'
  | 'VERIFIED';

const PLAN_FALLBACKS: Record<
  PlanCode,
  { visibilityWeight: number; maxListings: number; priceCents: number }
> = {
  FREE: { visibilityWeight: 0, maxListings: 1, priceCents: 0 },
  STARTER: { visibilityWeight: 1, maxListings: 3, priceCents: 4900 },
  ESSENTIAL: { visibilityWeight: 2, maxListings: 7, priceCents: 9900 },
  GROWTH: { visibilityWeight: 3, maxListings: 15, priceCents: 19900 },
  PRO: { visibilityWeight: 4, maxListings: 27, priceCents: 29900 },
  ELITE: { visibilityWeight: 5, maxListings: 9999, priceCents: 49900 },
};

@Injectable()
export class SalonsService {
  constructor(
    private prisma: PrismaService,
    private notificationsService: NotificationsService,
    private eventsGateway: EventsGateway,
  ) {}

  private async resolvePlanMeta(planCode: PlanCode) {
    try {
      const plan = await this.prisma.plan.findUnique({
        where: { code: planCode },
        select: {
          visibilityWeight: true,
          maxListings: true,
          priceCents: true,
        },
      });
      if (plan) {
        return plan;
      }
    } catch {
      // fall back to static defaults below
    }
    return PLAN_FALLBACKS[planCode];
  }

  async create(userId: string, dto: CreateSalonDto) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user || user.role !== 'SALON_OWNER') {
      throw new ForbiddenException('You are not authorized to create a salon');
    }

    const requestedPlan = (dto as any).planCode as PlanCode | undefined;
    if (!requestedPlan || !PLAN_FALLBACKS[requestedPlan]) {
      throw new ForbiddenException('Please select a valid package.');
    }

    const planMeta = await this.resolvePlanMeta(requestedPlan);
    const hasSentProof = Boolean((dto as any).hasSentProof);
    const paymentReferenceRaw = (dto as any).paymentReference;
    const paymentReference =
      typeof paymentReferenceRaw === 'string' &&
      paymentReferenceRaw.trim().length > 0
        ? paymentReferenceRaw.trim()
        : dto.name.trim();
    const planPaymentStatus: PlanPaymentStatus = requestedPlan === 'FREE'
      ? 'VERIFIED'
      : hasSentProof
        ? 'PROOF_SUBMITTED'
        : 'AWAITING_PROOF';

    const normalizedOperatingHours = normalizeOperatingHours(
      (dto as any).operatingHours,
    );

    const normalizedOperatingDays = Array.isArray((dto as any).operatingDays)
      ? (dto as any).operatingDays.filter(
          (day: any) => typeof day === 'string' && day.trim().length > 0,
        )
      : normalizedOperatingHours.map((oh) => oh.day);

    const data: any = {
      ownerId: userId,
      name: dto.name,
      description: (dto as any).description,
      address: (dto as any).address,
      province: (dto as any).province,
      city: (dto as any).city,
      town: (dto as any).town,
      website: (dto as any).website,
      latitude: (dto as any).latitude,
      longitude: (dto as any).longitude,
      heroImages: (dto as any).heroImages ?? [],
      backgroundImage: (dto as any).backgroundImage,
      contactEmail: (dto as any).email ?? (dto as any).contactEmail,
      phoneNumber: (dto as any).phone ?? (dto as any).phoneNumber,
      offersMobile: (dto as any).offersMobile,
      mobileFee: (dto as any).mobileFee,
      bookingType: (dto as any).bookingType ?? 'ONSITE',
      operatingHours: normalizedOperatingHours,
      operatingDays: normalizedOperatingDays,
      planCode: requestedPlan,
      visibilityWeight: planMeta.visibilityWeight,
      maxListings: planMeta.maxListings,
      planPriceCents: planMeta.priceCents,
      planPaymentStatus,
      planPaymentReference: paymentReference,
      planProofSubmittedAt: requestedPlan === 'FREE' ? null : hasSentProof ? new Date() : null,
      planVerifiedAt: requestedPlan === 'FREE' ? new Date() : null,
    };

    let salon;
    try {
      salon = await this.prisma.salon.create({ data });
    } catch (err: any) {
      // Log the actual Prisma error for debugging in development
      // eslint-disable-next-line no-console
      console.error(
        'Salon create failed:',
        err?.message || err,
        err?.meta || '',
      );
      throw err; // Let global filter map to friendly message
    }

    const admins = await this.prisma.user.findMany({
      where: { role: 'ADMIN' },
      select: { id: true },
    });

    for (const admin of admins) {
      const notification = await this.notificationsService.create(
        admin.id,
        `New salon "${salon.name}" created by ${user.firstName || 'a user'} is pending approval.`,
        { link: '/admin?tab=salons' },
      );
      this.eventsGateway.sendNotificationToUser(
        admin.id,
        'newNotification',
        notification,
      );
    }

    return salon;
  }

  findAll() {
    return this.prisma.salon.findMany({
      include: {
        reviews: true,
        services: true,
      },
    });
  }

  async updatePlan(user: any, dto: UpdateSalonPlanDto, ownerId: string) {
    if (user.id !== ownerId && user.role !== 'ADMIN') {
      throw new ForbiddenException(
        'You are not authorized to update this plan',
      );
    }

    const salon = await this.prisma.salon.findFirst({
      where: { ownerId },
      select: {
        id: true,
        name: true,
        planCode: true,
        planPaymentStatus: true,
        planPaymentReference: true,
        planProofSubmittedAt: true,
        planVerifiedAt: true,
      },
    });
    if (!salon) {
      throw new NotFoundException('Salon not found');
    }

    const data: any = {};
    const planCodeRaw = dto.planCode
      ? (dto.planCode as string).toUpperCase()
      : undefined;
    let normalizedPlan: PlanCode | undefined;
    if (planCodeRaw) {
      if (!PLAN_FALLBACKS[planCodeRaw as PlanCode]) {
        throw new ForbiddenException('Invalid package selection.');
      }
      normalizedPlan = planCodeRaw as PlanCode;
      const planMeta = await this.resolvePlanMeta(normalizedPlan);
      data.planCode = normalizedPlan;
      data.visibilityWeight = planMeta.visibilityWeight;
      data.maxListings = planMeta.maxListings;
      data.planPriceCents = planMeta.priceCents;
    }

    const planChanged =
      normalizedPlan && normalizedPlan !== (salon.planCode as PlanCode | null);
    const currentStatus = (salon.planPaymentStatus ??
      'PENDING_SELECTION') as PlanPaymentStatus;
    let nextStatus: PlanPaymentStatus | undefined;

    if (planChanged) {
      nextStatus = normalizedPlan === 'FREE' ? 'VERIFIED' : dto.hasSentProof ? 'PROOF_SUBMITTED' : 'AWAITING_PROOF';
    }
    if (typeof dto.hasSentProof === 'boolean') {
      if (dto.hasSentProof) {
        nextStatus = 'PROOF_SUBMITTED';
      } else {
        nextStatus =
          planChanged || currentStatus !== 'PENDING_SELECTION'
            ? 'AWAITING_PROOF'
            : 'PENDING_SELECTION';
      }
    }
    if (!planChanged && currentStatus === 'VERIFIED') {
      nextStatus = 'VERIFIED';
    }

    if (normalizedPlan === 'FREE') {
      data.planPaymentStatus = 'VERIFIED';
      data.planProofSubmittedAt = null;
      data.planVerifiedAt = salon.planVerifiedAt ?? new Date();
    } else if (nextStatus) {
      data.planPaymentStatus = nextStatus;
      if (nextStatus === 'PROOF_SUBMITTED') {
        data.planProofSubmittedAt = salon.planProofSubmittedAt ?? new Date();
        data.planVerifiedAt = null;
      } else if (
        nextStatus === 'AWAITING_PROOF' ||
        nextStatus === 'PENDING_SELECTION'
      ) {
        data.planProofSubmittedAt = null;
        data.planVerifiedAt = null;
      } else if (nextStatus === 'VERIFIED') {
        // Preserve existing verification timestamp when already verified
        data.planVerifiedAt = salon.planVerifiedAt ?? new Date();
      }
    }

    if (typeof dto.paymentReference !== 'undefined') {
      const trimmed =
        typeof dto.paymentReference === 'string' &&
        dto.paymentReference.trim().length > 0
          ? dto.paymentReference.trim()
          : salon.name.trim();
      data.planPaymentReference = trimmed;
    }

    if (Object.keys(data).length === 0) {
      return this.prisma.salon.findFirst({ where: { ownerId } });
    }

    return this.prisma.salon.update({
      where: { id: salon.id },
      data,
    });
  }

  async findOne(id: string, user?: any) {
    const salon = await this.prisma.salon.findUnique({
      where: { id },
      include: {
        reviews: {
          where: { approvalStatus: 'APPROVED' },
          include: {
            author: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
        services: {
          where: {
            approvalStatus: 'APPROVED',
          },
          orderBy: {
            createdAt: 'asc',
          },
        },
        gallery: true,
        owner: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    if (!salon) {
      throw new NotFoundException(`Salon with ID ${id} not found`);
    }

    // Attach isLikedByCurrentUser for returned services if user is present
    const userId: string | null = user?.id ?? null;
    if (!userId || !Array.isArray((salon as any).services) || (salon as any).services.length === 0) {
      return salon;
    }
    const svcIds = (salon as any).services.map((s: any) => s.id);
    const liked = await this.prisma.serviceLike.findMany({
      where: { userId, serviceId: { in: svcIds } },
      select: { serviceId: true },
    });
    const likedSet = new Set(liked.map((l) => l.serviceId));
    (salon as any).services = (salon as any).services.map((s: any) => ({
      ...s,
      isLikedByCurrentUser: likedSet.has(s.id),
    }));
    return salon;
  }

  async update(user: any, id: string, dto: UpdateSalonDto) {
    const salon = await this.prisma.salon.findUnique({
      where: { id },
    });

    if (!salon) {
      throw new NotFoundException('Salon not found');
    }

    // FIX: Allow ADMIN to update any salon
    if (salon.ownerId !== user.id && user.role !== 'ADMIN') {
      throw new ForbiddenException(
        'You are not authorized to update this salon',
      );
    }

    // Whitelist fields that exist on the Prisma Salon model to avoid unknown-argument errors
    const allowedFields: (
      | keyof UpdateSalonDto
      | 'backgroundImage'
      | 'heroImages'
    )[] = [
      'name',
      'description',
      'backgroundImage',
      'heroImages',
      'province',
      'city',
      'town',
      'address',
      'latitude',
      'longitude',
      'contactEmail',
      'phoneNumber',
      'whatsapp',
      'website',
      'bookingType',
      'offersMobile',
      'mobileFee',
      'operatingHours',
    ];

    const updateData: any = {};
    for (const key of allowedFields) {
      const value = (dto as any)[key];
      if (value !== undefined) {
        updateData[key] = value;
      }
    }

    // bookingType passes through as a string
    // operatingHours already whitelisted above; no extra transformation required

    if (updateData.operatingHours) {
      const normalizedHours = normalizeOperatingHours(
        updateData.operatingHours,
      );
      updateData.operatingHours = normalizedHours;
      updateData.operatingDays = normalizedHours.map((entry) => entry.day);
    }

    return this.prisma.salon.update({
      where: { id },
      data: updateData,
    });
  }

  async remove(user: any, id: string) {
    const salon = await this.prisma.salon.findUnique({
      where: { id },
    });

    if (!salon) {
      throw new NotFoundException('Salon not found');
    }

    // FIX: Allow ADMIN to delete any salon
    if (salon.ownerId !== user.id && user.role !== 'ADMIN') {
      throw new ForbiddenException(
        'You are not authorized to delete this salon',
      );
    }

    return this.prisma.salon.delete({
      where: { id },
    });
  }

  findMySalon(user: any, ownerId: string) {
    if (user.id !== ownerId && user.role !== 'ADMIN') {
      throw new ForbiddenException('You are not authorized to view this salon');
    }
    return this.prisma.salon.findFirst({ where: { ownerId } });
  }

  async findAllApproved(filters: any, user: any) {
    const {
      province,
      city,
      service,
      category,
      q,
      offersMobile,
      sortBy,
      openNow,
      priceMin,
      priceMax,
      lat,
      lon,
    } = filters || {};

    const where: any = {
      approvalStatus: 'APPROVED',
    };

    if (province)
      where.province = { equals: String(province), mode: 'insensitive' } as any;
    if (city) {
      where.OR = [
        { city: { equals: String(city), mode: 'insensitive' } as any },
        { town: { equals: String(city), mode: 'insensitive' } as any },
      ];
    }
    if (offersMobile === 'true' || offersMobile === true)
      where.offersMobile = true;

    // Service-based filters
    const servicesFilter: any = {};
    if (service || q) {
      servicesFilter.title = {
        contains: String(service || q),
        mode: 'insensitive',
      } as any;
    }
    if (category) {
      servicesFilter.OR = [
        {
          category: {
            name: { contains: String(category), mode: 'insensitive' } as any,
          },
        },
      ];
    }
    if (priceMin || priceMax) {
      servicesFilter.price = {};
      if (priceMin) servicesFilter.price.gte = Number(priceMin);
      if (priceMax) servicesFilter.price.lte = Number(priceMax);
    }
    if (Object.keys(servicesFilter).length > 0) {
      where.services = { some: servicesFilter };
    }

    let orderBy: Prisma.SalonOrderByWithRelationInput | undefined;
    if (sortBy === 'rating' || sortBy === 'top_rated')
      orderBy = { avgRating: 'desc' };

    // Fetch base list
    let salons = await this.prisma.salon.findMany({ where, orderBy });

    // Derive availability from operatingHours at query-time
    const now = new Date();
    salons = salons.map((s: any) => ({
      ...s,
      isAvailableNow: isOpenNowFromHours(s.operatingHours, now),
    }));

    // Filter by availability if requested
    if (openNow === 'true' || openNow === true) {
      salons = salons.filter((s: any) => s.isAvailableNow);
    }

    // Default ranking by visibility score when no explicit distance/price sort
    if (!sortBy || sortBy === 'latest') {
      salons = salons.sort((a: any, b: any) =>
        compareByVisibilityThenRecency(
          {
            visibilityWeight: a.visibilityWeight,
            featuredUntil: a.featuredUntil,
            createdAt: a.createdAt,
          },
          {
            visibilityWeight: b.visibilityWeight,
            featuredUntil: b.featuredUntil,
            createdAt: b.createdAt,
          },
        ),
      );
    }

    // Sort by distance in memory if requested and coordinates provided
    if (sortBy === 'distance' && lat && lon) {
      const R = 6371; // km
      const toRad = (v: number) => (v * Math.PI) / 180;
      const userLat = Number(lat);
      const userLon = Number(lon);
      salons = salons
        .map((s) => {
          if (s.latitude == null || s.longitude == null)
            return { ...s, __dist: Number.POSITIVE_INFINITY };
          const dLat = toRad(s.latitude - userLat);
          const dLon = toRad(s.longitude - userLon);
          const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(toRad(userLat)) *
              Math.cos(toRad(s.latitude)) *
              Math.sin(dLon / 2) *
              Math.sin(dLon / 2);
          const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
          const d = R * c;
          return { ...s, __dist: d };
        })
        .sort((a: any, b: any) => a.__dist - b.__dist)
        .map(({ __dist, ...rest }: any) => rest);
    }

    // Attach favorite flag if logged-in
    if (user) {
      const favoriteSalons = await this.prisma.favorite.findMany({
        where: { userId: user.id },
        select: { salonId: true },
      });
      const favoriteSalonIds = new Set(favoriteSalons.map((f) => f.salonId));
      salons = salons.map((salon) => ({
        ...salon,
        isFavorited: favoriteSalonIds.has(salon.id),
      }));
    }

    // Optional price sort using min service price
    if (sortBy === 'price') {
      const mins = await this.prisma.service.groupBy({
        by: ['salonId'],
        _min: { price: true },
        where: { salonId: { in: salons.map((s) => s.id) } },
      });
      const minMap = new Map(mins.map((m) => [m.salonId, m._min.price ?? 0]));
      salons = salons.sort(
        (a, b) => Number(minMap.get(a.id) ?? 0) - Number(minMap.get(b.id) ?? 0),
      );
    }

    return salons;
  }

  findNearby(lat: number, lon: number) {
    console.log(`Finding salons near lat: ${lat}, lon: ${lon}`);
    return this.prisma.salon.findMany();
  }

  async findFeatured(user?: any) {
    const now = new Date();
    const where: any = {
      approvalStatus: 'APPROVED',
      featuredUntil: {
        gte: now,
      },
    };

    let salons = await this.prisma.salon.findMany({
      where,
      orderBy: [
        { visibilityWeight: 'desc' },
        { createdAt: 'desc' },
      ],
      take: 12, // Limit to 12 featured salons
    });

    // Attach favorite flag if logged-in
    if (user) {
      const favoriteSalons = await this.prisma.favorite.findMany({
        where: { userId: user.id },
        select: { salonId: true },
      });
      const favoriteSalonIds = new Set(favoriteSalons.map((f) => f.salonId));
      salons = salons.map((salon) => ({
        ...salon,
        isFavorited: favoriteSalonIds.has(salon.id),
      }));
    }

    return salons;
  }

  async updateMySalon(user: any, dto: UpdateSalonDto, ownerId: string) {
    // FIX: Allow ADMIN to update any salon
    if (user.id !== ownerId && user.role !== 'ADMIN') {
      throw new ForbiddenException(
        'You are not authorized to update this salon',
      );
    }
    const salon = await this.prisma.salon.findFirst({
      where: { ownerId: ownerId }, // Use ownerId to find the salon
    });
    if (!salon) {
      throw new NotFoundException('Salon not found');
    }
    return this.update(user, salon.id, dto);
  }

  async toggleAvailability(user: any, ownerId: string) {
    // FIX: Allow ADMIN to update any salon
    if (user.id !== ownerId && user.role !== 'ADMIN') {
      throw new ForbiddenException(
        'You are not authorized to update this salon',
      );
    }
    const salon = await this.prisma.salon.findFirst({
      where: { ownerId: ownerId }, // Use ownerId to find the salon
    });
    if (!salon) {
      throw new NotFoundException('Salon not found');
    }
    return this.prisma.salon.update({
      where: { id: salon.id },
      data: { isAvailableNow: !salon.isAvailableNow },
    });
  }

  async findBookingsForMySalon(user: any, ownerId: string) {
    if (user.id !== ownerId && user.role !== 'ADMIN') {
      throw new ForbiddenException(
        'You are not authorized to view these bookings',
      );
    }
    const salon = await this.prisma.salon.findFirst({
      where: { ownerId: ownerId },
    });
    if (!salon) {
      throw new NotFoundException('Salon not found');
    }
    return this.prisma.booking.findMany({
      where: { salonId: salon.id },
      include: {
        service: true,
        user: true,
      },
    });
  }

  async findServicesForMySalon(user: any, ownerId: string) {
    if (user.id !== ownerId && user.role !== 'ADMIN') {
      throw new ForbiddenException(
        'You are not authorized to view these services',
      );
    }
    const salon = await this.prisma.salon.findFirst({
      where: { ownerId: ownerId },
    });
    if (!salon) {
      throw new NotFoundException('Salon not found');
    }
    return this.prisma.service.findMany({ where: { salonId: salon.id } });
  }
}
