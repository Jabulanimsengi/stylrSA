import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateSalonDto } from './dto/create-salon.dto';
import { ApprovalStatus, BookingType, Prisma, Salon, User, UserRole } from '@prisma/client';
import { UpdateSalonDto } from './dto/update-salon.dto';
import { EventsGateway } from 'src/events/events.gateway';

@Injectable()
export class SalonsService {
  constructor(
    private prisma: PrismaService,
    private eventsGateway: EventsGateway,
  ) {}

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
          bookingType: dto.bookingType as any,
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
    service?: string;
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
    if (filters.service) {
      where.services = {
        some: {
          title: {
            contains: filters.service,
            mode: 'insensitive',
          },
        },
      };
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

  async findOne(id: string, user: User | null) {
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

    let isFavorited = false;
    if (user && user.id) {
      const favorite = await this.prisma.favorite.findUnique({
        where: { userId_salonId: { userId: user.id, salonId: id } },
      });
      isFavorited = !!favorite;
    }

    // Conditionally return contact info
    if (user) {
      return { ...salon, isFavorited };
    } else {
      const { contactEmail, phoneNumber, whatsapp, website, ...publicSalon } = salon as Salon & { whatsapp?: string, website?: string };
      return { ...publicSalon, isFavorited };
    }
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
    const bookings = await this.prisma.booking.findMany({
      where: { salonId: salon.id },
      include: {
        user: { select: { firstName: true, lastName: true } },
        service: { select: { title: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return bookings.map(booking => {
      const { user, bookingTime, ...rest } = booking;
      return { ...rest, bookingDate: bookingTime, client: user };
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
    const salon = await this.findMySalon(userId);
    const dataToUpdate: Prisma.SalonUpdateInput = { ...dto, bookingType: dto.bookingType as BookingType };
    
    if (salon.approvalStatus === ApprovalStatus.APPROVED) {
      dataToUpdate.approvalStatus = ApprovalStatus.PENDING;
    }

    return this.prisma.salon.update({
      where: { id: salon.id },
      data: dataToUpdate,
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
  
  async toggleAvailability(userId: string) {
    const salon = await this.findMySalon(userId);
    const updatedSalon = await this.prisma.salon.update({
      where: { id: salon.id },
      data: { isAvailableNow: !salon.isAvailableNow },
    });
    this.eventsGateway.emitToSalonRoom(
      salon.id,
      'availabilityUpdate',
      { isAvailableNow: updatedSalon.isAvailableNow }
    );
    return updatedSalon;
  }
}