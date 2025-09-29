import { Controller, Post, Body, UseGuards, Get, Param, Patch } from '@nestjs/common';
import { BookingsService } from './bookings.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { JwtGuard } from '../auth/guard/jwt.guard';
import { GetUser } from '../auth/decorator/get-user.decorator';
import { User } from '@prisma/client';

@UseGuards(JwtGuard)
@Controller('bookings')
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @Post()
  create(@GetUser() user: User, @Body() createBookingDto: CreateBookingDto) {
    return this.bookingsService.create(user.id, createBookingDto);
  }

  @Get('my-bookings')
  getMyBookings(@GetUser() user: User) {
    return this.bookingsService.getUserBookings(user.id);
  }

  @Patch(':id/status')
  updateBookingStatus(@GetUser() user: User, @Param('id') bookingId: string, @Body('status') status: string) {
    return this.bookingsService.updateBookingStatus(user, bookingId, status);
  }
}