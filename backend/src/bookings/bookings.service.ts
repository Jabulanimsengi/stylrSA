import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { BookingStatus, User, UserRole } from '@prisma/client';
import { NotificationsService } from 'src/notifications/notifications.service';
import { EventsGateway } from 'src/events/events.gateway';

@Injectable()
export class BookingsService {
  constructor(
    private prisma: PrismaService,
    private notificationsService: NotificationsService,
    private eventsGateway: EventsGateway,
  ) {}

  async create(userId: string, dto: CreateBookingDto) {
    const service = await this.prisma.service.findUnique({
      where: { id: dto.serviceId },
      include: { salon: true },
    });

    if (!service) {
      throw new Error('Service not found');
    }
    const totalCost = service.price; 

    const booking = await this.prisma.booking.create({
      data: {
        userId,
        salonId: service.salonId,
        serviceId: dto.serviceId,
        bookingTime: dto.bookingDate,
        isMobile: dto.isMobile,
        totalCost,
      },
    });
    
    // Create notification for salon owner
    await this.notificationsService.create(
      service.salon.ownerId,
      `You have a new booking request for ${service.title}.`,
      `/dashboard` // or a more specific link
    );
    
    // Emit real-time event
    this.eventsGateway.emitToUser(service.salon.ownerId, 'newNotification', { message: 'You have a new booking request!' });
    this.eventsGateway.emitToUser(service.salon.ownerId, 'newBooking', booking);


    return booking;
  }

  async updateBookingStatus(user: User, bookingId: string, status: string) {
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
      include: { salon: true, service: true },
    });

    if (!booking) {
      throw new Error('Booking not found');
    }

    if (user.role !== UserRole.ADMIN && booking.salon.ownerId !== user.id) {
      throw new UnauthorizedException('You do not have permission to update this booking.');
    }

    const updatedBooking = await this.prisma.booking.update({
      where: { id: bookingId },
      data: { status: status as BookingStatus },
    });

    // Create notification for the client
    await this.notificationsService.create(
      booking.userId,
      `Your booking for ${booking.service.title} has been ${status.toLowerCase()}.`,
      `/my-bookings`
    );
    
    // Emit real-time event to the client
    this.eventsGateway.emitToUser(booking.userId, 'newNotification', { message: `Your booking status has been updated.` });
    this.eventsGateway.emitToUser(booking.userId, 'bookingUpdate', updatedBooking);

    return updatedBooking;
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