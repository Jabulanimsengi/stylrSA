// backend/src/services/services.service.ts
import {
  Injectable,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { Prisma, User } from '@prisma/client';

@Injectable()
export class ServicesService {
  constructor(private prisma: PrismaService) {}

  async create(user: User, dto: CreateServiceDto) {
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
    const maxListings = (salon as any).maxListings ?? 2;
    if (currentCount >= maxListings) {
      throw new ForbiddenException(
        `Listing limit reached for your plan (max ${maxListings} services). Upgrade your plan to add more.`,
      );
    }

    return this.prisma.service.create({ data: dto });
  }

  findAll() {
    return this.prisma.service.findMany();
  }

  findOne(id: string) {
    return this.prisma.service.findUnique({ where: { id } });
  }

  async update(user: User, id: string, dto: UpdateServiceDto) {
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

    return this.prisma.service.update({
      where: { id },
      data: dto,
    });
  }

  async remove(user: User, id: string) {
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

    return this.prisma.service.delete({ where: { id } });
  }

  async findAllForSalon(salonId: string) {
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

  async findAllApproved(page: number = 1, pageSize: number = 10) {
    // Rank globally by visibility score then recency, and only then paginate.
    const items = await this.prisma.service.findMany({
      where: { approvalStatus: 'APPROVED' },
      include: {
        salon: {
          select: {
            id: true,
            name: true,
            city: true,
            province: true,
            visibilityWeight: true,
            featuredUntil: true,
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

    const ordered = items.sort((a: any, b: any) => {
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

  async search(filters: any) {
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

    const where: Prisma.ServiceWhereInput = {
      approvalStatus: 'APPROVED',
    };

    if (q) {
      where.title = { contains: String(q), mode: 'insensitive' };
    }
    if (categoryId) {
      where.categoryId = String(categoryId);
    } else if (category) {
      where.category = {
        name: { contains: String(category), mode: 'insensitive' },
      };
    }
    if (priceMin || priceMax) {
      where.price = {};
      if (priceMin) where.price.gte = Number(priceMin);
      if (priceMax) where.price.lte = Number(priceMax);
    }
    const salonFilter: Prisma.SalonWhereInput = {};
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

    const items = await this.prisma.service.findMany({
      where,
      include: {
        salon: {
          select: {
            id: true,
            name: true,
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

    if (orderBy) {
      return items;
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
    return items.sort((a: any, b: any) => {
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
