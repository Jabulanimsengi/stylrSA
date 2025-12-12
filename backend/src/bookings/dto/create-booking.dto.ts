// backend/src/bookings/dto/create-booking.dto.ts
import {
  IsBoolean,
  IsDateString,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateBookingDto {
  @IsString()
  @IsNotEmpty()
  serviceId: string;

  @IsDateString()
  @IsNotEmpty()
  bookingTime: string;

  @IsBoolean()
  isMobile: boolean;

  @IsString()
  @IsOptional()
  clientPhone?: string;

  @IsString()
  @IsOptional()
  teamMemberId?: string; // Optional: selected professional/stylist

  @IsString()
  @IsOptional()
  clientNotes?: string; // Optional: notes/preferences for the appointment
}
