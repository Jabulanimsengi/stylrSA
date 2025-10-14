// backend/src/reviews/reviews.service.ts
import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { NotificationsService } from '../notifications/notifications.service';
import { EventsGateway } from '../events/events.gateway';

@Injectable()
export class ReviewsService {
  constructor(
    private prisma: PrismaService,
    private notificationsService: NotificationsService,
    private eventsGateway: EventsGateway,
  ) {}

  async create(userId: string, dto: CreateReviewDto) {
    const booking = await this.prisma.booking.findUnique({
      where: { id: dto.bookingId },
      include: { salon: { select: { name: true } } },
    });

    if (!booking) {
      throw new NotFoundException('Booking not found.');
    }
    if (booking.userId !== userId) {
      throw new ForbiddenException('You can only review your own bookings.');
    }

    const review = await this.prisma.review.create({
      data: {
        rating: dto.rating,
        comment: dto.comment,
        author: {
          connect: { id: userId },
        },
        salon: {
          connect: { id: booking.salonId },
        },
        booking: {
          connect: { id: dto.bookingId },
        },
      },
      include: {
        author: { select: { firstName: true, lastName: true } },
      },
    });

    const admins = await this.prisma.user.findMany({
      where: { role: 'ADMIN' },
      select: { id: true },
    });

    const authorName = review.author 
      ? `${review.author.firstName || ''} ${review.author.lastName || ''}`.trim() 
      : 'A user';

    for (const admin of admins) {
      const notification = await this.notificationsService.create(
        admin.id,
        `New review by ${authorName} for salon "${booking.salon.name}" is pending approval.`,
        { link: '/admin?tab=reviews' },
      );
      this.eventsGateway.sendNotificationToUser(
        admin.id,
        'newNotification',
        notification,
      );
    }

    return review;
  }
}
