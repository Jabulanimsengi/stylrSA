import { IsOptional, IsString, IsNumber, IsIn } from 'class-validator';

export type PlanCode = 'STARTER' | 'ESSENTIAL' | 'GROWTH' | 'PRO' | 'ELITE';

export class UpdatePlanDto {
  @IsOptional()
  @IsIn(['STARTER', 'ESSENTIAL', 'GROWTH', 'PRO', 'ELITE'])
  planCode?: PlanCode;

  @IsOptional()
  @IsNumber()
  visibilityWeight?: number;

  @IsOptional()
  @IsNumber()
  maxListings?: number;

  @IsOptional()
  @IsString()
  featuredUntil?: string; // ISO date string
}
