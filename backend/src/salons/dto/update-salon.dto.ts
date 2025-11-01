import {
  IsString,
  IsOptional,
  IsUrl,
  IsNumber,
  IsLatitude,
  IsLongitude,
  IsPhoneNumber,
  IsEmail,
  ValidateNested,
  IsArray,
  MaxLength,
  IsEnum,
  IsBoolean,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';

enum BookingType {
  ONSITE = 'ONSITE',
  MOBILE = 'MOBILE',
  BOTH = 'BOTH',
}

class OperatingHoursDto {
  @IsString()
  @IsOptional()
  day?: string;

  @IsString()
  @IsOptional()
  open?: string;

  @IsString()
  @IsOptional()
  close?: string;
}

export class UpdateSalonDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  address?: string;

  @IsString()
  @IsOptional()
  city?: string;

  @IsString()
  @IsOptional()
  province?: string;

  @IsString()
  @IsOptional()
  town?: string;

  @IsString()
  @IsOptional()
  postalCode?: string;

  @IsLatitude()
  @IsOptional()
  latitude?: number;

  @IsLongitude()
  @IsOptional()
  longitude?: number;

  @IsPhoneNumber('ZA')
  @IsOptional()
  phoneNumber?: string;

  @IsEmail()
  @IsOptional()
  contactEmail?: string;

  @IsUrl()
  @IsOptional()
  website?: string;

  @IsString()
  @IsOptional()
  whatsapp?: string;

  @IsString()
  @MaxLength(500)
  @IsOptional()
  description?: string;

  @IsUrl()
  @IsOptional()
  backgroundImage?: string | null; // This line has been changed to allow null

  @IsUrl()
  @IsOptional()
  logo?: string | null;

  @IsArray()
  @IsUrl({}, { each: true })
  @IsOptional()
  heroImages?: string[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OperatingHoursDto)
  operatingHours?: OperatingHoursDto[];

  @IsEnum(BookingType)
  @IsOptional()
  bookingType?: BookingType;

  @IsBoolean()
  @IsOptional()
  offersMobile?: boolean;

  @IsNumber()
  @IsOptional()
  mobileFee?: number;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  operatingDays?: string[];
}
