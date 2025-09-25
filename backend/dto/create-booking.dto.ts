// backend/src/bookings/dto/create-booking.dto.ts
import { IsBoolean, IsDateString, IsNotEmpty, IsString } from 'class-validator';

export class CreateBookingDto {
  @IsString()
  @IsNotEmpty()
  serviceId: string;

  @IsDateString()
  @IsNotEmpty()
  bookingDate: string;

  @IsBoolean()
  isMobile: boolean;
}