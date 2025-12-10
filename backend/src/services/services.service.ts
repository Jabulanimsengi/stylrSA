// backend/src/services/services.service.ts
import {
  Injectable,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { NotificationsService } from '../notifications/notifications.service';
import { EventsGateway } from '../events/events.gateway';

@Injectable()
export class ServicesService {
  constructor(
    private prisma: PrismaService,
    private notificationsService: NotificationsService,
    private eventsGateway: EventsGateway,
  ) { }

  async create(user: any, dto: CreateServiceDto) {
    const salon = await this.prisma.salon.findUnique({
      where: { id: dto.salonId },
    });

    if (!salon) {
      throw new NotFoundException('Salon not found.');
    }

    // FIX: Allow ADMIN or the actual owner to create a service for the salon
    if (salon.ownerId !== user.id && user.role !== 'ADMIN') {
      throw new ForbiddenException(
        'You are not authorized to add a service to this salon',
      );
    }

    // Enforce plan-based listing cap
    const currentCount = await this.prisma.service.count({
      where: { salonId: salon.id },
    });
    const maxListings = salon.maxListings ?? 2;
    if (currentCount >= maxListings) {
      throw new ForbiddenException(
        `Listing limit reached for your plan (max ${maxListings} services). Upgrade your plan to add more.`,
      );
    }

    // Handle empty string categoryId by converting to undefined
    const createData = {
      ...dto,
      images: dto.images || [],
      categoryId:
        dto.categoryId && dto.categoryId.trim() !== ''
          ? dto.categoryId
          : undefined,
    };

    const service = await this.prisma.service.create({ data: createData });

    const admins = await this.prisma.user.findMany({
      where: { role: 'ADMIN' },
      select: { id: true },
    });

    for (const admin of admins) {
      const notification = await this.notificationsService.create(
        admin.id,
        `New service "${service.title}" for salon "${salon.name}" is pending approval.`,
        { link: '/admin?tab=services' },
      );
      this.eventsGateway.sendNotificationToUser(
        admin.id,
        'newNotification',
        notification,
      );
    }

    return service;
  }

  findAll() {
    return this.prisma.service.findMany();
  }

  findOne(id: string) {
    return this.prisma.service.findUnique({ where: { id } });
  }

  async update(user: any, id: string, dto: UpdateServiceDto) {
    const service = await this.prisma.service.findUnique({
      where: { id },
      include: { salon: true },
    });

    if (!service) {
      throw new NotFoundException('Service not found.');
    }

    // FIX: Allow ADMIN to update any service
    if (service.salon.ownerId !== user.id && user.role !== 'ADMIN') {
      throw new ForbiddenException(
        'You are not authorized to update this service',
      );
    }

    // Handle empty string categoryId by converting to undefined
    const updateData = {
      ...dto,
      categoryId:
        dto.categoryId !== undefined && dto.categoryId.trim() === ''
          ? undefined
          : dto.categoryId,
    };

    return this.prisma.service.update({
      where: { id },
      data: updateData,
    });
  }

  async remove(user: any, id: string) {
    const service = await this.prisma.service.findUnique({
      where: { id },
      include: { salon: true },
    });

    if (!service) {
      throw new NotFoundException('Service not found.');
    }

    // FIX: Allow ADMIN to delete any service
    if (service.salon.ownerId !== user.id && user.role !== 'ADMIN') {
      throw new ForbiddenException(
        'You are not authorized to delete this service',
      );
    }

    const bookingCount = await this.prisma.booking.count({
      where: { serviceId: id },
    });

    if (bookingCount > 0) {
      throw new ForbiddenException(
        'Cannot delete service with existing bookings. Please contact support if you need to remove this service.',
      );
    }

    return this.prisma.$transaction(async (tx) => {
      await tx.serviceLike.deleteMany({ where: { serviceId: id } });
      await tx.promotion.deleteMany({ where: { serviceId: id } });
      return tx.service.delete({ where: { id } });
    });
  }

  findAllForSalon(salonId: string) {
    return this.prisma.service.findMany({
      where: { salonId: salonId },
    });
  }

  async findFeatured() {
    const items = await this.prisma.service.findMany({
      where: { approvalStatus: 'APPROVED' },
      include: {
        salon: {
          select: {
            id: true,
            name: true,
            slug: true,
            city: true,
            province: true,
            ownerId: true,
            visibilityWeight: true,
            featuredUntil: true,
            createdAt: true,
          },
        },
      },
      take: 20,
    });
    const now = Date.now();
    const score = (s: any) => {
      const w = s.salon?.visibilityWeight ?? 1;
      const fu = s.salon?.featuredUntil
        ? new Date(s.salon.featuredUntil).getTime()
        : 0;
      const boost = fu > now ? 10 : 0;
      return w + boost;
    };
    return items
      .sort((a: any, b: any) => {
        const sv = score(b) - score(a);
        if (sv !== 0) return sv;
        return (
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      })
      .slice(0, 5);
  }

  async findAllApproved(page: number = 1, pageSize: number = 10, user?: any) {
    // Rank globally by visibility score then recency, and only then paginate.
    // Only include services that have at least one image (for featured display on home page)
    const items = await this.prisma.service.findMany({
      where: {
        approvalStatus: 'APPROVED',
        images: { isEmpty: false },
      },
      include: {
        salon: {
          select: {
            id: true,
            name: true,
            slug: true,
            city: true,
            province: true,
            ownerId: true,
            visibilityWeight: true,
            featuredUntil: true,
          },
        },
        category: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    const now = Date.now();
    const score = (s: any) => {
      const w = s.salon?.visibilityWeight ?? 1;
      const fu = s.salon?.featuredUntil
        ? new Date(s.salon.featuredUntil).getTime()
        : 0;
      const boost = fu > now ? 10 : 0;
      return w + boost;
    };

    // Attach isLikedByCurrentUser if user present
    const userId: string | null = user?.id ?? null;
    let withLikeFlag = items as any[];
    if (userId) {
      const serviceIds = items.map((s) => s.id);
      const liked = await this.prisma.serviceLike.findMany({
        where: { userId, serviceId: { in: serviceIds } },
        select: { serviceId: true },
      });
      const likedSet = new Set(liked.map((l) => l.serviceId));
      withLikeFlag = items.map((s: any) => ({ ...s, isLikedByCurrentUser: likedSet.has(s.id) }));
    }

    const ordered = withLikeFlag.sort((a: any, b: any) => {
      const sv = score(b) - score(a);
      if (sv !== 0) return sv;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    const total = ordered.length;
    const start = (page - 1) * pageSize;
    const end = start + pageSize;

    return {
      services: ordered.slice(start, end),
      currentPage: page,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  async search(filters: any, user?: any) {
    const {
      q,
      category,
      categoryId,
      priceMin,
      priceMax,
      province,
      city,
      sortBy,
    } = filters || {};

    console.log('[ServicesService] Search filters:', filters);

    const where: any = {
      approvalStatus: 'APPROVED',
      // Only include services with images (exclude menu-style listings)
      images: { isEmpty: false },
    };

    if (q) {
      where.title = { contains: String(q), mode: 'insensitive' };
      console.log('[ServicesService] Filtering by service name:', q);
    }
    if (categoryId) {
      where.categoryId = String(categoryId);
      console.log('[ServicesService] Filtering by categoryId:', categoryId);
    } else if (category) {
      where.category = {
        name: { contains: String(category), mode: 'insensitive' },
      };
      console.log('[ServicesService] Filtering by category name:', category);
    }
    if (priceMin || priceMax) {
      where.price = {};
      if (priceMin) where.price.gte = Number(priceMin);
      if (priceMax) where.price.lte = Number(priceMax);
    }
    const salonFilter: any = {};
    if (province) {
      salonFilter.province = {
        equals: String(province),
        mode: 'insensitive',
      };
    }
    if (city) {
      salonFilter.OR = [
        { city: { equals: String(city), mode: 'insensitive' } },
        { town: { equals: String(city), mode: 'insensitive' } },
      ];
    }
    if (Object.keys(salonFilter).length > 0) {
      where.salon = { is: salonFilter };
    }

    let orderBy: Record<string, 'asc' | 'desc'> | undefined;
    if (sortBy === 'price') orderBy = { price: 'asc' };
    if (sortBy === 'latest') orderBy = { createdAt: 'desc' };

    console.log('[ServicesService] Prisma where clause:', JSON.stringify(where, null, 2));

    const items = await this.prisma.service.findMany({
      where,
      include: {
        salon: {
          select: {
            id: true,
            name: true,
            slug: true,
            city: true,
            province: true,
            ownerId: true,
            visibilityWeight: true,
            featuredUntil: true,
          },
        },
        category: { select: { id: true, name: true } },
      },
    });

    console.log('[ServicesService] Found', items.length, 'services');
    if (items.length > 0 && items.length <= 5) {
      console.log('[ServicesService] Sample results:', items.map(s => ({
        id: s.id,
        title: s.title,
        categoryId: s.categoryId,
        categoryName: s.category?.name
      })));
    }

    // Attach isLikedByCurrentUser if user present
    const userId: string | null = user?.id ?? null;
    let withLikeFlag = items as any[];
    if (userId) {
      const serviceIds = items.map((s) => s.id);
      const liked = await this.prisma.serviceLike.findMany({
        where: { userId, serviceId: { in: serviceIds } },
        select: { serviceId: true },
      });
      const likedSet = new Set(liked.map((l) => l.serviceId));
      withLikeFlag = items.map((s: any) => ({ ...s, isLikedByCurrentUser: likedSet.has(s.id) }));
    }

    if (orderBy) {
      return withLikeFlag;
    }
    const now = Date.now();
    const score = (s: any) => {
      const w = s.salon?.visibilityWeight ?? 1;
      const fu = s.salon?.featuredUntil
        ? new Date(s.salon.featuredUntil).getTime()
        : 0;
      const boost = fu > now ? 10 : 0;
      return w + boost;
    };
    return withLikeFlag.sort((a: any, b: any) => {
      const sv = score(b) - score(a);
      if (sv !== 0) return sv;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }

  async autocomplete(q: string) {
    if (!q || String(q).trim().length === 0) {
      return [] as {
        id: string;
        title: string;
        salon?: { id: string; name: string };
      }[];
    }
    const results = await this.prisma.service.findMany({
      where: { title: { contains: String(q), mode: 'insensitive' } },
      select: {
        id: true,
        title: true,
        salon: { select: { id: true, name: true } },
      },
      take: 10,
      distinct: ['title'],
      orderBy: { title: 'asc' },
    });
    return results.map((r) => ({
      id: r.id,
      title: r.title,
      salon: r.salon,
    }));
  }
}
