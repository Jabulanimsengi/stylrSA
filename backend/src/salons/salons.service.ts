import {
  Injectable,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSalonDto, UpdateSalonDto } from './dto';
import { BookingType, User, Prisma } from '@prisma/client';

@Injectable()
export class SalonsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, dto: CreateSalonDto) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user || user.role !== 'SALON_OWNER') {
      throw new ForbiddenException('You are not authorized to create a salon');
    }

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
      bookingType: ((dto as any).bookingType as BookingType) ?? 'ONSITE',
      operatingHours: (dto as any).operatingHours || Prisma.JsonNull,
      // Ensure required array field is always provided
      operatingDays: (Array.isArray((dto as any).operatingDays)
        ? (dto as any).operatingDays
        : Array.isArray((dto as any).operatingHours)
          ? (dto as any).operatingHours
              .map((oh: any) => oh?.day)
              .filter((d: any) => typeof d === 'string' && d.length > 0)
          : []) as string[],
    };

    try {
      return await this.prisma.salon.create({ data });
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
  }

  findAll() {
    return this.prisma.salon.findMany({
      include: {
        reviews: true,
        services: true,
      },
    });
  }

  async findOne(id: string) {
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

    return salon;
  }

  async update(user: User, id: string, dto: UpdateSalonDto) {
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

    if (updateData.bookingType) {
      updateData.bookingType = updateData.bookingType as BookingType;
    }
    // operatingHours already whitelisted above; no extra transformation required

    return this.prisma.salon.update({
      where: { id },
      data: updateData,
    });
  }

  async remove(user: User, id: string) {
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

  async findMySalon(user: User, ownerId: string) {
    if (user.id !== ownerId && user.role !== 'ADMIN') {
      throw new ForbiddenException('You are not authorized to view this salon');
    }
    return this.prisma.salon.findFirst({ where: { ownerId } });
  }

  async findAllApproved(filters: any, user: User) {
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

    const where: Prisma.SalonWhereInput = {
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
    if (openNow === 'true' || openNow === true) where.isAvailableNow = true;

    // Service-based filters
    const servicesFilter: Prisma.ServiceWhereInput = {};
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
      if (priceMin) (servicesFilter.price as any).gte = Number(priceMin);
      if (priceMax) (servicesFilter.price as any).lte = Number(priceMax);
    }
    if (Object.keys(servicesFilter).length > 0) {
      (where as any).services = { some: servicesFilter };
    }

    let orderBy: Prisma.SalonOrderByWithRelationInput | undefined;
    if (sortBy === 'rating' || sortBy === 'top_rated')
      orderBy = { avgRating: 'desc' };

    // Fetch base list
    let salons = await this.prisma.salon.findMany({ where, orderBy });

    // Default ranking by visibility score when no explicit distance/price sort
    if (!sortBy || sortBy === 'latest') {
      const now = Date.now();
      const visibilityScore = (s: any) => {
        const w = s.visibilityWeight ?? 1;
        const boost = s.featuredUntil && new Date(s.featuredUntil).getTime() > now ? 10 : 0;
        return w + boost;
      };
      salons = salons.sort((a: any, b: any) => {
        const sv = visibilityScore(b) - visibilityScore(a);
        if (sv !== 0) return sv;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
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
            return { ...s, __dist: Number.POSITIVE_INFINITY } as any;
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
          return { ...s, __dist: d } as any;
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
      })) as any;
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
        (a, b) => (minMap.get(a.id) ?? 0) - (minMap.get(b.id) ?? 0),
      );
    }

    return salons;
  }

  async findNearby(lat: number, lon: number) {
    console.log(`Finding salons near lat: ${lat}, lon: ${lon}`);
    return this.prisma.salon.findMany();
  }

  async updateMySalon(user: User, dto: UpdateSalonDto, ownerId: string) {
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

  async toggleAvailability(user: User, ownerId: string) {
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

  async findBookingsForMySalon(user: User, ownerId: string) {
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

  async findServicesForMySalon(user: User, ownerId: string) {
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
