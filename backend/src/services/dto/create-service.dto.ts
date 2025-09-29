// backend/src/services/dto/create-service.dto.ts
import {
  ArrayMaxSize,
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
  Min,
} from 'class-validator';

export class CreateServiceDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsNumber()
  @Min(0)
  price: number;
  
  @IsNumber()
  @Min(0)
  duration: number;

  @IsArray()
  @ArrayMaxSize(3) // As per your requirements
  @IsUrl({}, { each: true }) // Validates that each item in the array is a URL
  @IsOptional()
  images?: string[];
}