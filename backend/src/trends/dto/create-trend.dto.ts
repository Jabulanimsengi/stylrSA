import {
  IsString,
  IsArray,
  IsEnum,
  IsOptional,
  IsBoolean,
  IsInt,
  MinLength,
  ArrayMinSize,
} from 'class-validator';
import { TrendCategory, AgeGroup } from '@prisma/client';

export class CreateTrendDto {
  @IsString()
  @MinLength(3)
  title: string;

  @IsString()
  @MinLength(10)
  description: string;

  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  images: string[];

  @IsEnum(TrendCategory)
  category: TrendCategory;

  @IsArray()
  @ArrayMinSize(1)
  @IsEnum(AgeGroup, { each: true })
  ageGroups: AgeGroup[];

  @IsOptional()
  @IsString()
  styleName?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsInt()
  priority?: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  relatedServiceCategories?: string[];
}
