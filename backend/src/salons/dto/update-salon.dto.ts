import {
  IsString,
  IsOptional,
  IsUrl,
  IsNumber,
  IsLatitude,
  IsLongitude,
  IsPhoneNumber,
  IsEmail,
  IsObject,
  ValidateNested,
  IsArray,
  MaxLength,
  IsEnum,
  IsBoolean,
} from 'class-validator';
import { Type } from 'class-transformer';

enum BookingType {
  ONSITE = 'ONSITE',
  MOBILE = 'MOBILE',
  BOTH = 'BOTH',
}

class OperatingHoursDto {
  @IsString()
  @IsOptional()
  monday?: string;

  @IsString()
  @IsOptional()
  tuesday?: string;

  @IsString()
  @IsOptional()
  wednesday?: string;

  @IsString()
  @IsOptional()
  thursday?: string;

  @IsString()
  @IsOptional()
  friday?: string;

  @IsString()
  @IsOptional()
  saturday?: string;

  @IsString()
  @IsOptional()
  sunday?: string;
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
  backgroundImage?: string;

  @IsArray()
  @IsString({ each: true })
  @IsUrl({}, { each: true })
  @IsOptional()
  heroImages?: string[];

  @IsObject()
  @ValidateNested()
  @Type(() => OperatingHoursDto)
  @IsOptional()
  operatingHours?: OperatingHoursDto;

  @IsEnum(BookingType)
  @IsOptional()
  bookingType?: BookingType;
  
  @IsBoolean()
  @IsOptional()
  offersMobile?: boolean;

  @IsNumber()
  @IsOptional()
  mobileFee?: number;
}