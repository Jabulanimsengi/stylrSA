import { PlanCode } from '@prisma/client';

export class UpdatePlanDto {
  planCode: PlanCode;
  visibilityWeight?: number;
  maxListings?: number;
  featuredUntil?: string; // ISO date string
}
