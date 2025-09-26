// backend/src/reviews/reviews.service.ts
import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateReviewDto } from './dto/create-review.dto'; // Corrected typo here

@Injectable()
export class ReviewsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, dto: CreateReviewDto) { // Corrected typo here
    const booking = await this.prisma.booking.findUnique({
      where: { id: dto.bookingId },
    });

    if (!booking) {
      throw new NotFoundException('Booking not found.');
    }
    if (booking.userId !== userId) {
      throw new ForbiddenException('You can only review your own bookings.');
    }

    // This is the correct syntax for your schema
    return this.prisma.review.create({
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
    });
  }
}