// backend/src/salons/salons.service.ts
import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateSalonDto } from './dto/create-salon.dto';
import { ApprovalStatus, UserRole } from '@prisma/client';

@Injectable()
export class SalonsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, dto: CreateSalonDto) {
    // Check if the user already owns a salon
    const existingSalon = await this.prisma.salon.findUnique({
      where: { ownerId: userId },
    });

    if (existingSalon) {
      throw new ForbiddenException('You already own a salon.');
    }

    // Use a transaction to ensure both operations succeed or fail together
    const salon = await this.prisma.$transaction(async (tx) => {
      // 1. Create the salon
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

      // 2. Update the user's role to SALON_OWNER
      await tx.user.update({
        where: { id: userId },
        data: { role: UserRole.SALON_OWNER },
      });

      return newSalon;
    });

    return salon;
  }

  // Find all APPROVED salons (for public listing)
  async findAllApproved() {
    return this.prisma.salon.findMany({
      where: { approvalStatus: ApprovalStatus.APPROVED },
    });
  }

  // Find a single salon by its ID
  async findOne(id: string) {
    const salon = await this.prisma.salon.findUnique({
      where: { id },
    });
    if (!salon) {
      throw new NotFoundException('Salon not found.');
    }
    return salon;
  }

  // Find the salon owned by the logged-in user
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