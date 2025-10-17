import {
  IsBoolean,
  IsIn,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class UpdateSellerPlanDto {
  @IsString()
  @IsIn(['FREE', 'STARTER', 'ESSENTIAL', 'GROWTH', 'PRO', 'ELITE'])
  planCode!: 'FREE' | 'STARTER' | 'ESSENTIAL' | 'GROWTH' | 'PRO' | 'ELITE';

  @IsOptional()
  @IsBoolean()
  hasSentProof?: boolean;

  @IsOptional()
  @IsString()
  @MaxLength(160)
  paymentReference?: string | null;
}
