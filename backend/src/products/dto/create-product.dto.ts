import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsBoolean,
  IsArray,
} from 'class-validator';

export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsNumber()
  price: number;

  @IsArray()
  @IsString({ each: true })
  images: string[];

  @IsBoolean()
  @IsOptional()
  isOnSale?: boolean;

  @IsNumber()
  @IsOptional()
  salePrice?: number;
}