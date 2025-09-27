import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { BookingStatus, UserRole } from '@prisma/client';
import { EventsGateway } from 'src/events/events.gateway';

@Injectable()
export class BookingsService {
  constructor(
    private prisma: PrismaService,
    private eventsGateway: EventsGateway,
  ) {}

  async create(clientId: string, dto: CreateBookingDto) {
    const service = await this.prisma.service.findUnique({
      where: { id: dto.serviceId },
      include: { salon: true },
    });

    if (!service) {
      throw new NotFoundException('Service not found.');
    }

    let totalCost = service.price;
    if (dto.isMobile) {
      if (!service.salon.offersMobile || service.salon.mobileFee === null) {
        throw new Error('This salon does not offer mobile services.');
      }
      totalCost += service.salon.mobileFee;
    }

    const newBooking = await this.prisma.booking.create({
      data: {
        userId: clientId,
        salonId: service.salonId,
        serviceId: dto.serviceId,
        bookingDate: new Date(dto.bookingDate),
        isMobile: dto.isMobile,
        totalCost: totalCost,
        status: BookingStatus.PENDING,
      },
      include: { 
        client: { select: { firstName: true } },
        service: { select: { title: true } } 
      },
    });

    this.eventsGateway.emitToUser(
      service.salon.ownerId,
      'newBooking',
      newBooking,
    );

    return newBooking;
  }

  async updateStatus(
    userId: string,
    userRole: UserRole,
    bookingId: string,
    status: BookingStatus,
  ) {
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
      include: { salon: true },
    });
    if (!booking) throw new NotFoundException('Booking not found.');

    if (userRole !== UserRole.SALON_OWNER || booking.salon.ownerId !== userId) {
      throw new ForbiddenException('You are not authorized to update this booking.');
    }

    const updatedBooking = await this.prisma.booking.update({
      where: { id: bookingId },
      data: { status },
    });

    this.eventsGateway.emitToUser(
      booking.userId,
      'bookingUpdate',
      updatedBooking,
    );

    return updatedBooking;
  }

  async findAllForUser(clientId: string) {
    return this.prisma.booking.findMany({
      where: { userId: clientId },
      include: {
        salon: { select: { name: true } },
        service: { select: { title: true } },
        review: { select: { id: true } },
      },
      orderBy: {
        bookingDate: 'desc',
      },
    });
  }
}