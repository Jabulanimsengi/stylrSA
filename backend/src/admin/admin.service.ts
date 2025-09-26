// backend/src/admin/admin.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { UpdateServiceStatusDto } from './dto/update-service-status.dto';
import { ApprovalStatus } from '@prisma/client';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  async updateServiceStatus(
    serviceId: string,
    dto: UpdateServiceStatusDto,
  ) {
    const service = await this.prisma.service.findUnique({
      where: { id: serviceId },
    });

    if (!service) {
      throw new NotFoundException('Service not found.');
    }

    return this.prisma.service.update({
      where: { id: serviceId },
      data: { approvalStatus: dto.approvalStatus },
    });
  }

  async updateSalonStatus(salonId: string, dto: UpdateServiceStatusDto) {
    const salon = await this.prisma.salon.findUnique({ where: { id: salonId } });
    if (!salon) {
      throw new NotFoundException('Salon not found.');
    }
    return this.prisma.salon.update({
      where: { id: salonId },
      data: { approvalStatus: dto.approvalStatus },
    });
  }

  async getPendingServices() {
    return this.prisma.service.findMany({
      where: { approvalStatus: ApprovalStatus.PENDING },
      include: { salon: { select: { name: true } } }, // Include salon name for context
    });
  }

  async getPendingSalons() {
    return this.prisma.salon.findMany({
      where: { approvalStatus: ApprovalStatus.PENDING },
      include: { owner: { select: { email: true } } }, // Include owner email for context
    });
  }
}