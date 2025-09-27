import { BookingType } from '@prisma/client';
import {
  IsArray,
  IsEnum,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
} from 'class-validator';

export class UpdateSalonDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  backgroundImage?: string;

  @IsString()
  @IsOptional()
  province?: string;

  @IsString()
  @IsOptional()
  city?: string;
  
  @IsString()
  @IsOptional()
  town?: string;

  @IsNumber()
  @IsOptional()
  mobileFee?: number;

  @IsEnum(BookingType)
  @IsOptional()
  bookingType?: BookingType;

  @IsObject()
  @IsOptional()
  operatingHours?: any;
  
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  operatingDays?: string[];
}