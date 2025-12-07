import { IsString, IsOptional, IsEnum, IsNumber, IsObject } from 'class-validator';

export class CreateTop10RequestDto {
  @IsString()
  fullName: string;

  @IsString()
  phone: string;

  @IsOptional()
  @IsString()
  whatsapp?: string;

  @IsOptional()
  @IsString()
  email?: string;

  @IsString()
  category: string;

  @IsString()
  serviceNeeded: string;

  @IsOptional()
  @IsString()
  styleOrLook?: string;

  @IsString()
  budget: string;

  @IsEnum(['onsite', 'inhouse'])
  serviceType: 'onsite' | 'inhouse';

  @IsString()
  location: string;

  @IsOptional()
  @IsObject()
  locationCoords?: { lat: number; lng: number };

  @IsString()
  preferredDate: string;

  @IsOptional()
  @IsString()
  preferredTime?: string;

  @IsOptional()
  @IsString()
  formattedMessage?: string;
}
