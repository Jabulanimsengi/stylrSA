import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, ApprovalStatus, User, UserRole } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';

@Injectable()
export class ServicesService {
  constructor(private prisma: PrismaService) {}

  async create(user: User, salonId: string, dto: CreateServiceDto) {
    const salon = await this.prisma.salon.findUnique({ where: { id: salonId } });
    if (!salon) {
      throw new NotFoundException('Salon not found.');
    }
    if (user.role !== UserRole.ADMIN && salon.ownerId !== user.id) {
      throw new ForbiddenException('You are not authorized to add services to this salon.');
    }
    return this.prisma.service.create({ data: { salonId, ...dto } });
  }

  // This method provides the public list of a salon's services
  async findAllForSalon(salonId: string) {
    return this.prisma.service.findMany({
      where: { 
        salonId: salonId,
        approvalStatus: ApprovalStatus.APPROVED, // Only show approved services publicly
      },
    });
  }
  
  // NEW: Paginated method to get all approved services
  async findAllApproved(page: number, pageSize: number) {
    const skip = (page - 1) * pageSize;
    const services = await this.prisma.service.findMany({
      where: { approvalStatus: ApprovalStatus.APPROVED },
      orderBy: { createdAt: 'desc' },
      skip: skip,
      take: pageSize,
      include: {
        salon: {
          select: { name: true, id: true },
        },
      },
    });
    const totalServices = await this.prisma.service.count({ where: { approvalStatus: ApprovalStatus.APPROVED } });
    return {
      services,
      totalPages: Math.ceil(totalServices / pageSize),
      currentPage: page,
    };
  }


  async update(user: User, serviceId: string, dto: UpdateServiceDto) {
    const service = await this.prisma.service.findUnique({
      where: { id: serviceId },
      include: { salon: true },
    });

    if (!service) {
      throw new NotFoundException('Service not found.');
    }
    if (user.role !== UserRole.ADMIN && service.salon.ownerId !== user.id) {
      throw new ForbiddenException('You are not authorized to modify this service.');
    }

    const dataToUpdate: Prisma.ServiceUpdateInput = { ...dto };

    if (service.approvalStatus === ApprovalStatus.APPROVED) {
      dataToUpdate.approvalStatus = ApprovalStatus.PENDING;
    }

    return this.prisma.service.update({
      where: { id: serviceId },
      data: dataToUpdate,
    });
  }

  async remove(user: User, serviceId: string) {
    const service = await this.prisma.service.findUnique({
      where: { id: serviceId },
      include: { salon: true },
    });

    if (!service) {
      throw new NotFoundException('Service not found.');
    }
    if (user.role !== UserRole.ADMIN && service.salon.ownerId !== user.id) {
      throw new ForbiddenException('You are not authorized to delete this service.');
    }
    return this.prisma.service.delete({ where: { id: serviceId } });
  }

  async findFeatured() {
    return this.prisma.service.findMany({
      where: { approvalStatus: ApprovalStatus.APPROVED },
      orderBy: { createdAt: 'desc' },
      take: 6,
      include: {
        salon: {
          select: { name: true, id: true },
        },
      },
    });
  }
}