import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { User, UserRole } from '@prisma/client';

@Injectable()
export class BookingsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, dto: CreateBookingDto) {
    return this.prisma.booking.create({
      data: {
        userId,
        ...dto,
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
      data: { status },
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