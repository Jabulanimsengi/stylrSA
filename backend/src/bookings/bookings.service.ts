import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { EventsGateway } from '../events/events.gateway';
import { NotificationsService } from 'src/notifications/notifications.service';

type ServiceWithSalon = any;
type BookingWithServiceAndSalon = any;

@Injectable()
export class BookingsService {
  constructor(
    private prisma: PrismaService,
    private eventsGateway: EventsGateway,
    private notificationsService: NotificationsService,
  ) {}

  async create(user: any, dto: CreateBookingDto) {
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

    const notification = await this.notificationsService.create(
      service.salon.ownerId,
      `New booking for ${service.title} by ${user.firstName}.`,
      {
        bookingId: booking.id,
        link: '/dashboard?tab=bookings',
      },
    );

    this.eventsGateway.sendNotificationToUser(
      service.salon.ownerId,
      'newNotification',
      notification,
    );

    return booking;
  }

  async findAllForUser(user: any) {
    return this.prisma.booking.findMany({
      where: { userId: user.id },
      include: {
        service: true,
        salon: true,
        review: true,
      },
      orderBy: {
        bookingTime: 'desc',
      },
    });
  }

  async findOne(user: any, id: string) {
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
    user: any,
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

    // Customize notification message based on status
    let notificationMessage = `Your booking for ${booking.service.title} has been ${status.toLowerCase()}.`;
    let notificationLink = '/my-bookings';

    // Special message for COMPLETED bookings to encourage reviews
    if (status === 'COMPLETED') {
      notificationMessage = `Your booking for ${booking.service.title} at ${booking.service.salon.name} is complete! We'd love to hear about your experience. Please leave a review.`;
      notificationLink = '/my-bookings?action=review';
    }

    const notification = await this.notificationsService.create(
      booking.userId,
      notificationMessage,
      {
        bookingId: booking.id,
        link: notificationLink,
      },
    );

    this.eventsGateway.sendNotificationToUser(
      booking.userId,
      'newNotification',
      notification,
    );

    return updatedBooking;
  }

  async remove(user: any, id: string) {
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
