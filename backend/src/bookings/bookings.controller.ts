import {
  Controller,
  Post,
  Body,
  UseGuards,
  Get,
  Param,
  Patch,
} from '@nestjs/common';
import { BookingsService } from './bookings.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { JwtGuard } from '../auth/guard/jwt.guard';
import { GetUser } from '../auth/decorator/get-user.decorator';
import { User } from '@prisma/client';

@Controller('api/bookings')
@UseGuards(JwtGuard)
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @Post()
  create(@GetUser() user: User, @Body() createBookingDto: CreateBookingDto) {
    // FIX: Passing the full 'user' object instead of just user.id
    return this.bookingsService.create(user, createBookingDto);
  }

  @Get('my-bookings')
  getMyBookings(@GetUser() user: User) {
    // FIX: Corrected method name from 'getUserBookings' to 'findAllForUser'
    return this.bookingsService.findAllForUser(user);
  }

  @Patch(':id/status')
  updateBookingStatus(
    @GetUser() user: User,
    @Param('id') bookingId: string,
    @Body('status') status: 'CONFIRMED' | 'CANCELLED' | 'COMPLETED',
  ) {
    // FIX: Corrected method name from 'updateBookingStatus' to 'updateStatus'
    return this.bookingsService.updateStatus(user, bookingId, status);
  }
}
