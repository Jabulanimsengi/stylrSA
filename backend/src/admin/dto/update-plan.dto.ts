export type PlanCode =
  | 'STARTER'
  | 'ESSENTIAL'
  | 'GROWTH'
  | 'PRO'
  | 'ELITE';

export class UpdatePlanDto {
  planCode: PlanCode;
  visibilityWeight?: number;
  maxListings?: number;
  featuredUntil?: string; // ISO date string
}
