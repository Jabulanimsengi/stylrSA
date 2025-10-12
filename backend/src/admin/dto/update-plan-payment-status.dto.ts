import { IsIn, IsOptional, IsString } from 'class-validator';

export class UpdatePlanPaymentStatusDto {
  @IsString()
  @IsIn(['PENDING_SELECTION', 'AWAITING_PROOF', 'PROOF_SUBMITTED', 'VERIFIED'])
  status!: 'PENDING_SELECTION' | 'AWAITING_PROOF' | 'PROOF_SUBMITTED' | 'VERIFIED';

  @IsOptional()
  @IsString()
  paymentReference?: string | null;
}
