import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateSalonDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  province: string;

  @IsString()
  @IsNotEmpty()
  city: string;

  @IsString()
  @IsNotEmpty()
  town: string;

  @IsBoolean()
  @IsOptional()
  offersMobile?: boolean;

  @IsNumber()
  @IsOptional()
  mobileFee?: number;

  @IsString()
  @IsOptional()
  bookingType?: string;

  @IsObject()
  @IsOptional()
  operatingHours?: any;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  operatingDays?: string[];

  @IsNumber()
  @IsOptional()
  latitude?: number;

  @IsNumber()
  @IsOptional()
  longitude?: number;
}