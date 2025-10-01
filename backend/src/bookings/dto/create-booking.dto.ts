import { IsBoolean, IsDateString, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateBookingDto {
  @IsString()
  @IsNotEmpty()
  serviceId: string;

  @IsDateString()
  @IsNotEmpty()
  bookingDate: string;

  @IsBoolean()
  isMobile: boolean;

  @IsString()
  @IsOptional()
  clientPhone?: string;
}