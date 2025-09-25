// backend/src/admin/dto/update-service-status.dto.ts
import { IsEnum, IsNotEmpty } from 'class-validator';
import { ApprovalStatus } from '@prisma/client';

export class UpdateServiceStatusDto {
  @IsEnum(ApprovalStatus)
  @IsNotEmpty()
  approvalStatus: ApprovalStatus;
}