// backend/src/salons/salons.service.ts
import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateSalonDto } from './dto/create-salon.dto';
import { ApprovalStatus, Prisma, UserRole } from '@prisma/client';

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
  }) {
    const where: Prisma.SalonWhereInput = {
      approvalStatus: ApprovalStatus.APPROVED,
    };

    if (filters.province) {
      where.province = { contains: filters.province, mode: 'insensitive' };
    }
    if (filters.city) {
      where.city = { contains: filters.city, mode: 'insensitive' };
    }
    if (filters.offersMobile === 'true') {
      where.offersMobile = true;
    }

    return this.prisma.salon.findMany({ where });
  }

  async findOne(id: string) {
    const salon = await this.prisma.salon.findUnique({
      where: { id },
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
}