import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { User, Service, Salon, Booking } from '@prisma/client';
import { EventsGateway } from '../events/events.gateway';

type ServiceWithSalon = Service & { salon: Salon };
type BookingWithServiceAndSalon = Booking & { service: ServiceWithSalon };

@Injectable()
export class BookingsService {
  constructor(
    private prisma: PrismaService,
    private eventsGateway: EventsGateway,
  ) {}

  async create(user: User, dto: CreateBookingDto) {
    const service: ServiceWithSalon | null =
      await this.prisma.service.findUnique({
        where: { id: dto.serviceId },
        include: { salon: true },
      });

    if (!service) {
      throw new NotFoundException('Service not found');
    }

    const booking = await this.prisma.booking.create({
      data: {
        userId: user.id,
        serviceId: dto.serviceId,
        salonId: service.salonId,
        bookingTime: new Date(dto.bookingTime),
        isMobile: dto.isMobile,
        clientPhone: dto.clientPhone,
        status: 'PENDING',
        totalCost: service.price,
      },
      include: {
        service: true,
        user: true,
      },
    });

    const notification = await this.prisma.notification.create({
      data: {
        userId: service.salon.ownerId,
        message: `New booking for ${service.title} by ${user.firstName}.`,
        bookingId: booking.id,
      },
    });

    // FIX: Corrected method name back to 'sendNotificationToUser'
    this.eventsGateway.sendNotificationToUser(
      service.salon.ownerId,
      'newBooking',
      {
        message: `New booking for ${service.title} by ${user.firstName}.`,
        booking,
      },
    );

    return booking;
  }

  async findAllForUser(user: User) {
    return this.prisma.booking.findMany({
      where: { userId: user.id },
      include: {
        service: true,
        salon: true,
      },
      orderBy: {
        bookingTime: 'desc',
      },
    });
  }

  async findOne(user: User, id: string) {
    const booking: BookingWithServiceAndSalon | null =
      await this.prisma.booking.findUnique({
        where: { id },
        include: {
          service: {
            include: {
              salon: true,
            },
          },
        },
      });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    if (
      booking.userId !== user.id &&
      booking.service.salon.ownerId !== user.id
    ) {
      throw new ForbiddenException(
        'You are not authorized to view this booking',
      );
    }

    return booking;
  }

  async updateStatus(
    user: User,
    id: string,
    status: 'CONFIRMED' | 'CANCELLED' | 'COMPLETED',
  ) {
    const booking = await this.prisma.booking.findUnique({
      where: { id },
      include: {
        service: {
          include: {
            salon: true,
          },
        },
        user: true,
      },
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    if (booking.service.salon.ownerId !== user.id) {
      throw new ForbiddenException(
        'You are not authorized to update this booking',
      );
    }

    const updatedBooking = await this.prisma.booking.update({
      where: { id },
      data: { status },
    });

    const notificationMessage = `Your booking for ${booking.service.title} has been ${status.toLowerCase()}.`;
    await this.prisma.notification.create({
      data: {
        userId: booking.userId,
        message: notificationMessage,
        bookingId: booking.id,
      },
    });

    // FIX: Corrected method name back to 'sendNotificationToUser'
    this.eventsGateway.sendNotificationToUser(
      booking.userId,
      'bookingStatusUpdate',
      {
        message: notificationMessage,
        booking: updatedBooking,
      },
    );

    return updatedBooking;
  }

  async remove(user: User, id: string) {
    const booking = await this.prisma.booking.findUnique({
      where: { id },
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    if (booking.userId !== user.id) {
      throw new ForbiddenException(
        'You are not authorized to delete this booking',
      );
    }

    return this.prisma.booking.delete({ where: { id } });
  }
}
