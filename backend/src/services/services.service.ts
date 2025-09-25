// backend/src/services/services.service.ts
import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';

@Injectable()
export class ServicesService {
  constructor(private prisma: PrismaService) {}

  // CREATE (already done)
  async create(userId: string, salonId: string, dto: CreateServiceDto) {
    const salon = await this.prisma.salon.findUnique({ where: { id: salonId } });
    if (!salon) {
      throw new NotFoundException('Salon not found.');
    }
    if (salon.ownerId !== userId) {
      throw new ForbiddenException('You are not authorized to add services to this salon.');
    }
    return this.prisma.service.create({ data: { salonId, ...dto } });
  }

  // READ ALL for a specific salon
  async findAllForSalon(salonId: string) {
    return this.prisma.service.findMany({
      where: { salonId },
    });
  }

  // UPDATE a specific service
  async update(userId: string, serviceId: string, dto: UpdateServiceDto) {
    const service = await this.prisma.service.findUnique({
      where: { id: serviceId },
      include: { salon: true }, // Include salon to get ownerId
    });

    if (!service) {
      throw new NotFoundException('Service not found.');
    }
    if (service.salon.ownerId !== userId) {
      throw new ForbiddenException('You are not authorized to modify this service.');
    }
    return this.prisma.service.update({ where: { id: serviceId }, data: dto });
  }

  // DELETE a specific service
  async remove(userId: string, serviceId: string) {
    const service = await this.prisma.service.findUnique({
      where: { id: serviceId },
      include: { salon: true },
    });

    if (!service) {
      throw new NotFoundException('Service not found.');
    }
    if (service.salon.ownerId !== userId) {
      throw new ForbiddenException('You are not authorized to delete this service.');
    }
    return this.prisma.service.delete({ where: { id: serviceId } });
  }
}