import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateSalonDto } from './dto/create-salon.dto';
import { ApprovalStatus, Prisma, Salon, UserRole } from '@prisma/client';
import { UpdateSalonDto } from './dto/update-salon.dto';

@Injectable()
export class SalonsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, dto: CreateSalonDto) {
    const existingSalon = await this.prisma.salon.findUnique({
      where: { ownerId: userId },
    });
    if (existingSalon) {
      throw new ForbiddenException('You already own a salon.');
    }
    const salon = await this.prisma.$transaction(async (tx) => {
      const newSalon = await tx.salon.create({
        data: {
          ownerId: userId,
          name: dto.name,
          province: dto.province,
          city: dto.city,
          town: dto.town,
          offersMobile: dto.offersMobile,
          mobileFee: dto.mobileFee,
          bookingType: dto.bookingType,
          operatingHours: dto.operatingHours,
          operatingDays: dto.operatingDays,
          latitude: dto.latitude,
          longitude: dto.longitude,
        },
      });
      await tx.user.update({
        where: { id: userId },
        data: { role: UserRole.SALON_OWNER },
      });
      return newSalon;
    });
    return salon;
  }

  async findAllApproved(filters: {
    province?: string;
    city?: string;
    offersMobile?: string;
    sortBy?: string;
    openOn?: string;
  }) {
    const where: Prisma.SalonWhereInput = {
      approvalStatus: ApprovalStatus.APPROVED,
    };
    let orderBy: Prisma.SalonOrderByWithRelationInput = {};

    if (filters.province) {
      where.province = { contains: filters.province, mode: 'insensitive' };
    }
    if (filters.city) {
      where.city = { contains: filters.city, mode: 'insensitive' };
    }
    if (filters.offersMobile === 'true') {
      where.offersMobile = true;
    }
    if (filters.openOn) {
      where.operatingDays = { has: filters.openOn };
    }
    if (filters.sortBy === 'top_rated') {
      orderBy = { avgRating: 'desc' };
    }

    return this.prisma.salon.findMany({ where, orderBy });
  }

  async findOne(id: string) {
    const salon = await this.prisma.salon.findUnique({
      where: { id },
      include: {
        reviews: {
          where: { approvalStatus: ApprovalStatus.APPROVED },
          include: {
            author: { select: { firstName: true, lastName: true } },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });
    if (!salon) {
      throw new NotFoundException('Salon not found.');
    }
    return salon;
  }

  async findMySalon(userId: string) {
    const salon = await this.prisma.salon.findUnique({
      where: { ownerId: userId },
    });
    if (!salon) {
      throw new NotFoundException('You do not own a salon.');
    }
    return salon;
  }

  async findBookingsForMySalon(userId: string) {
    const salon = await this.findMySalon(userId);
    return this.prisma.booking.findMany({
      where: { salonId: salon.id },
      include: {
        client: { select: { firstName: true, lastName: true } },
        service: { select: { title: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findServicesForMySalon(userId: string) {
    const salon = await this.findMySalon(userId);
    return this.prisma.service.findMany({
      where: { salonId: salon.id },
      orderBy: { createdAt: 'desc' },
    });
  }
  
  async updateMySalon(userId: string, dto: UpdateSalonDto) {
    const salon = await this.findMySalon(userId); // Verifies ownership
    return this.prisma.salon.update({
      where: { id: salon.id },
      data: dto,
    });
  }

  async findNearby(lat: number, lon: number, radius: number = 25): Promise<Salon[]> {
    const result = await this.prisma.$queryRaw<Array<Salon & { distance: number }>>`
      SELECT *, (6371 * acos(cos(radians(${lat})) * cos(radians(latitude)) * cos(radians(longitude) - radians(${lon})) + sin(radians(${lat})) * sin(radians(latitude)))) AS distance
      FROM "Salon"
      WHERE "approvalStatus" = 'APPROVED' AND latitude IS NOT NULL AND longitude IS NOT NULL
      HAVING (6371 * acos(cos(radians(${lat})) * cos(radians(latitude)) * cos(radians(longitude) - radians(${lon})) + sin(radians(${lat})) * sin(radians(latitude)))) < ${radius}
      ORDER BY distance;
    `;
    return result;
  }
}