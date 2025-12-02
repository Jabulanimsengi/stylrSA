export type PlanCode = 'ESSENTIAL' | 'GROWTH' | 'PRO' | 'ELITE';

// Legacy plan codes for existing users (not available for new signups)
export type LegacyPlanCode = 'FREE' | 'STARTER';
export type AllPlanCodes = PlanCode | LegacyPlanCode;

export interface AppPlan {
  code: PlanCode | LegacyPlanCode;
  name: string;
  price: string;
  priceCents: number;
  maxListings: number | 'Unlimited';
  visibilityWeight: number;
  features: string[];
  popular?: boolean;
  isLegacy?: boolean; // Plans no longer available for new signups
}

// Active plans available for new signups
export const APP_PLANS: AppPlan[] = [
  {
    code: 'ESSENTIAL',
    name: 'Essential',
    price: 'R99/month',
    priceCents: 9900,
    maxListings: 7,
    visibilityWeight: 2,
    features: [
      'Up to 7 service listings',
      'Gallery up to 15 images',
      'Basic analytics dashboard',
      'Email support',
    ],
  },
  {
    code: 'GROWTH',
    name: 'Growth',
    price: 'R199/month',
    priceCents: 19900,
    maxListings: 15,
    visibilityWeight: 3,
    features: [
      'Up to 15 service listings',
      'Gallery up to 30 images',
      'Priority search placement',
      'Analytics + performance insights',
      'Short video uploads',
      'Before & after gallery',
    ],
    popular: true,
  },
  {
    code: 'PRO',
    name: 'Pro',
    price: 'R299/month',
    priceCents: 29900,
    maxListings: 27,
    visibilityWeight: 4,
    features: [
      'Up to 27 service listings',
      'Unlimited gallery images',
      'Top search placement',
      'Featured salon eligibility',
      'Priority support',
      'Short video uploads',
      'Before & after gallery',
      'Team member profiles',
    ],
  },
  {
    code: 'ELITE',
    name: 'Elite',
    price: 'R499/month',
    priceCents: 49900,
    maxListings: 'Unlimited',
    visibilityWeight: 5,
    features: [
      'Unlimited service listings',
      'Unlimited gallery images',
      'Premium search placement',
      'Featured salon priority',
      'Dedicated account manager',
      'Early access to new features',
      'Short video uploads',
      'Before & after gallery',
      'Team member profiles',
      'Job posting board',
    ],
  },
];

// Legacy plans for existing users only (grandfathered)
export const LEGACY_PLANS: AppPlan[] = [
  {
    code: 'FREE',
    name: 'Free (Legacy)',
    price: 'R0',
    priceCents: 0,
    maxListings: 1,
    visibilityWeight: 0,
    features: ['1 service listing', 'Gallery up to 5 images', 'Community support'],
    isLegacy: true,
  },
  {
    code: 'STARTER',
    name: 'Starter (Legacy)',
    price: 'R49',
    priceCents: 4900,
    maxListings: 3,
    visibilityWeight: 1,
    features: ['Up to 3 listings', 'Basic visibility', 'Email support'],
    isLegacy: true,
  },
];

// All plans including legacy (for displaying existing user's plan)
export const ALL_PLANS: AppPlan[] = [...LEGACY_PLANS, ...APP_PLANS];

// Lookup by code (includes legacy plans for existing users)
export const PLAN_BY_CODE: Record<AllPlanCodes, AppPlan> = ALL_PLANS.reduce(
  (acc, plan) => {
    acc[plan.code as AllPlanCodes] = plan;
    return acc;
  },
  {} as Record<AllPlanCodes, AppPlan>,
);

// Default plan for new signups
export const DEFAULT_PLAN: PlanCode = 'ESSENTIAL';
