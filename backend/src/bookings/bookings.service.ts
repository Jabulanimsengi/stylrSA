import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { User, UserRole, BookingStatus } from '@prisma/client';

@Injectable()
export class BookingsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, dto: CreateBookingDto) {
    const service = await this.prisma.service.findUnique({
      where: { id: dto.serviceId },
    });

    if (!service) {
      throw new Error('Service not found');
    }
    const totalCost = service.price; 

    return this.prisma.booking.create({
      data: {
        userId,
        salonId: service.salonId,
        serviceId: dto.serviceId,
        bookingTime: dto.bookingDate,
        isMobile: dto.isMobile,
        totalCost,
      },
    });
  }

  async updateBookingStatus(user: User, bookingId: string, status: string) {
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
      include: { salon: true },
    });

    if (!booking) {
      throw new Error('Booking not found');
    }

    if (user.role !== UserRole.SALON_OWNER || booking.salon.ownerId !== user.id) {
      throw new UnauthorizedException('You do not have permission to update this booking.');
    }

    return this.prisma.booking.update({
      where: { id: bookingId },
      data: { status: status as BookingStatus },
    });
  }

  async getUserBookings(userId: string) {
    return this.prisma.booking.findMany({
      where: { userId },
      include: {
        salon: true,
        service: true,
      },
      orderBy: {
        bookingTime: 'desc',
      },
    });
  }
}