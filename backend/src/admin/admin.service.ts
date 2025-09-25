// backend/src/admin/admin.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { UpdateServiceStatusDto } from './dto/update-service-status.dto';

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
}