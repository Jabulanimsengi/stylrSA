import { IsNotEmpty, IsOptional, IsString, IsUrl } from 'class-validator';

export class CreateGalleryImageDto {
  @IsUrl()
  @IsNotEmpty()
  imageUrl: string;

  @IsString()
  @IsOptional()
  caption?: string;
}