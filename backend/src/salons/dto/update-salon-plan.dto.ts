import {
  IsBoolean,
  IsIn,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class UpdateSalonPlanDto {
  @IsOptional()
  @IsString()
  @IsIn(['STARTER', 'ESSENTIAL', 'GROWTH', 'PRO', 'ELITE'])
  planCode?: 'STARTER' | 'ESSENTIAL' | 'GROWTH' | 'PRO' | 'ELITE';

  @IsOptional()
  @IsBoolean()
  hasSentProof?: boolean;

  @IsOptional()
  @IsString()
  @MaxLength(160)
  paymentReference?: string | null;
}
