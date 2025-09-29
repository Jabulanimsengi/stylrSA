import { IsIn } from 'class-validator';

export class UpdateServiceStatusDto {
  @IsIn(['APPROVED', 'REJECTED'])
  approvalStatus: string;
}