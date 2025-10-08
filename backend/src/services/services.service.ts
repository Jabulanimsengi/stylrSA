// backend/src/services/services.service.ts
import {
  Injectable,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { User } from '@prisma/client';

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
    return this.prisma.service.findMany({
      take: 5,
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findAllApproved(page: number = 1, pageSize: number = 10) {
    const [services, total] = await this.prisma.$transaction([
      this.prisma.service.findMany({
        skip: (page - 1) * pageSize,
        take: pageSize,
        where: {
          approvalStatus: 'APPROVED',
        },
        include: {
          salon: {
            select: {
              id: true,
              name: true,
              city: true,
              province: true,
            },
          },
        },
      }),
      this.prisma.service.count({ where: { approvalStatus: 'APPROVED' } }),
    ]);

    return {
      services,
      currentPage: page,
      totalPages: Math.ceil(total / pageSize),
    };
  }
}
