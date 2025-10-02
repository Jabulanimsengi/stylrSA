import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsInt,
  Min,
  MaxLength,
  IsOptional,
  IsUrl,
} from 'class-validator';

export class CreateServiceDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  title: string; // Changed from 'name' to 'title'

  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  description: string;

  @IsNumber()
  @Min(0)
  price: number;

  @IsInt()
  @Min(1)
  duration: number; // Duration in minutes

  @IsString()
  @IsNotEmpty()
  salonId: string;

  @IsOptional()
  @IsUrl()
  imageUrl?: string;
}