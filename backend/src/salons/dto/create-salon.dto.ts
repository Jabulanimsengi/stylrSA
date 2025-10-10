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
import { Type } from 'class-transformer';
import { ValidateNested } from 'class-validator';

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
  operatingHours?: OperatingHoursDto[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
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
}
