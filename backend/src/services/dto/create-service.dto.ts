// backend/src/services/dto/create-service.dto.ts
import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsArray,
  IsOptional,
  IsUUID,
} from 'class-validator';

export class CreateServiceDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsNumber()
  price: number;

  @IsNumber()
  duration: number;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  images: string[];

  @IsString()
  @IsNotEmpty()
  salonId: string;

  @IsUUID() // Use IsUUID to validate that it's a valid UUID
  @IsOptional() // Make categoryId optional to match the database schema
  categoryId?: string; // Add the new categoryId property
}
