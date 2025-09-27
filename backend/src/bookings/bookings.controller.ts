import { Controller, Post, Body, UseGuards, Get, Patch, Param } from '@nestjs/common';
import { BookingsService } from './bookings.service';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from 'src/auth/decorator/get-user.decorator';
import { User, BookingStatus } from '@prisma/client';
import { CreateBookingDto } from './dto/create-booking.dto';

@Controller('api/bookings')
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @UseGuards(AuthGuard('jwt'))
  @Post()
  create(@Body() createBookingDto: CreateBookingDto, @GetUser() user: User) {
    return this.bookingsService.create(user.id, createBookingDto);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('mine')
  findAllForUser(@GetUser() user: User) {
    return this.bookingsService.findAllForUser(user.id);
  }

  @UseGuards(AuthGuard('jwt'))
  @Patch(':id/status')
  updateStatus(
    @Param('id') id: string,
    @Body('status') status: BookingStatus,
    @GetUser() user: User,
  ) {
    return this.bookingsService.updateStatus(user.id, user.role, id, status);
  }
}