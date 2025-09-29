import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  async getPendingSalons() {
    return this.prisma.salon.findMany({
      where: { approvalStatus: 'PENDING' },
      include: { owner: true },
    });
  }

  async updateSalonStatus(salonId: string, status: string) {
    return this.prisma.salon.update({
      where: { id: salonId },
      data: { approvalStatus: status },
    });
  }

  async getPendingServices() {
    return this.prisma.service.findMany({
      where: { approvalStatus: 'PENDING' },
      include: { salon: true },
    });
  }

  async updateServiceStatus(serviceId: string, status: string) {
    return this.prisma.service.update({
      where: { id: serviceId },
      data: { approvalStatus: status },
    });
  }
}