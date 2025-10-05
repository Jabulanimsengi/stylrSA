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

    return this.prisma.salon.create({
      data: {
        ownerId: userId,
        ...dto,
        operatingHours: (dto.operatingHours as any) || Prisma.JsonNull,
        bookingType: dto.bookingType as BookingType,
      },
    });
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

    if (!salon || salon.ownerId !== user.id) {
      throw new ForbiddenException(
        'You are not authorized to update this salon',
      );
    }

    const updateData: any = { ...dto };
    if (dto.bookingType) {
      updateData.bookingType = dto.bookingType as BookingType;
    }
    if (dto.operatingHours) {
      updateData.operatingHours = dto.operatingHours as any;
    }

    return this.prisma.salon.update({
      where: { id },
      data: updateData,
    });
  }

  async remove(user: User, id: string) {
    const salon = await this.prisma.salon.findUnique({
      where: { id },
    });

    if (!salon || salon.ownerId !== user.id) {
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
    console.log('Filters received:', filters);
    const salons = await this.prisma.salon.findMany({
      where: {
        approvalStatus: 'APPROVED'
      },
    });

    if (user) {
      const favoriteSalons = await this.prisma.favorite.findMany({
        where: { userId: user.id },
        select: { salonId: true },
      });
      const favoriteSalonIds = new Set(favoriteSalons.map(f => f.salonId));
      return salons.map(salon => ({
        ...salon,
        isFavorited: favoriteSalonIds.has(salon.id),
      }));
    }

    return salons;
  }

  async findNearby(lat: number, lon: number) {
    console.log(`Finding salons near lat: ${lat}, lon: ${lon}`);
    return this.prisma.salon.findMany();
  }

  async updateMySalon(user: User, dto: UpdateSalonDto, ownerId: string) {
    if (user.id !== ownerId) {
      throw new ForbiddenException('You are not authorized to update this salon');
    }
    const salon = await this.prisma.salon.findFirst({
      where: { ownerId: user.id },
    });
    if (!salon) {
      throw new NotFoundException('Salon not found');
    }
    return this.update(user, salon.id, dto);
  }

  async toggleAvailability(user: User, ownerId: string) {
    if (user.id !== ownerId) {
      throw new ForbiddenException('You are not authorized to update this salon');
    }
    const salon = await this.prisma.salon.findFirst({
      where: { ownerId: user.id },
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
      throw new ForbiddenException('You are not authorized to view these bookings');
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
      }
    });
  }

  async findServicesForMySalon(user: User, ownerId: string) {
    if (user.id !== ownerId && user.role !== 'ADMIN') {
      throw new ForbiddenException('You are not authorized to view these services');
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