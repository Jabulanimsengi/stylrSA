import {
  IsArray,
  IsEnum,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  IsUrl,
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

  @IsString()
  @IsOptional()
  contactEmail?: string;

  @IsString()
  @IsOptional()
  phoneNumber?: string;

  @IsString()
  @IsOptional()
  whatsapp?: string;

  @IsUrl()
  @IsOptional()
  website?: string;

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
}