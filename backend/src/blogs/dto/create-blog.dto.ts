import { IsString, IsNotEmpty, IsOptional, IsBoolean, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class BlogContentSection {
  @IsString()
  @IsNotEmpty()
  heading: string;

  @IsString()
  @IsNotEmpty()
  content: string;
}

export class CreateBlogDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  slug: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BlogContentSection)
  content: BlogContentSection[];

  @IsString()
  @IsNotEmpty()
  category: string;

  @IsOptional()
  @IsBoolean()
  featured?: boolean;

  @IsOptional()
  @IsBoolean()
  published?: boolean;

  @IsOptional()
  @IsString()
  readTime?: string;
}



