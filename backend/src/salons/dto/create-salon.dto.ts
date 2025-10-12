import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsArray,
  IsNumber,
  Min,
  IsUrl,
  MaxLength,
  IsPhoneNumber,
  IsLatitude,
  IsLongitude,
  IsBoolean,
  IsIn,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { ValidateNested } from 'class-validator';
import { coerceOperatingHoursArray } from '../utils/operating-hours.util';

class OperatingHoursDto {
  @IsString()
  @IsNotEmpty()
  day: string;

  @IsString()
  @IsNotEmpty()
  open: string;

  @IsString()
  @IsNotEmpty()
  close: string;
}

export class CreateSalonDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  description: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  address: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  town: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  city: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  province: string;

  @IsString()
  @IsNotEmpty()
  @IsPhoneNumber('ZA') // Example: Validates for South Africa
  phone: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  email: string;

  @IsOptional()
  @IsUrl()
  website?: string;

  @IsOptional()
  @IsUrl()
  imageUrl?: string;

  @IsOptional()
  @IsLatitude()
  latitude?: number;

  @IsOptional()
  @IsLongitude()
  longitude?: number;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OperatingHoursDto)
  @Transform(({ value }) => {
    const entries = coerceOperatingHoursArray(value);
    return entries.length > 0 ? entries : undefined;
  })
  operatingHours?: OperatingHoursDto[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @Transform(({ value }) => {
    if (!Array.isArray(value)) return undefined;
    const cleaned = value
      .filter((item) => typeof item === 'string' && item.trim().length > 0)
      .map((item) => item.trim());
    return cleaned.length > 0 ? cleaned : undefined;
  })
  operatingDays?: string[];

  @IsOptional()
  @IsBoolean()
  offersMobile?: boolean;

  @IsOptional()
  @IsNumber()
  @Min(0)
  mobileFee?: number;

  @IsOptional()
  @IsString()
  @IsIn(['INSTANT', 'REQUEST'])
  bookingType?: string;

  @IsString()
  @IsNotEmpty()
  @IsIn(['STARTER', 'ESSENTIAL', 'GROWTH', 'PRO', 'ELITE'])
  planCode!: 'STARTER' | 'ESSENTIAL' | 'GROWTH' | 'PRO' | 'ELITE';

  @IsOptional()
  @IsBoolean()
  hasSentProof?: boolean;

  @IsOptional()
  @IsString()
  @MaxLength(160)
  paymentReference?: string | null;
}
