export type PlanCode = 'STARTER' | 'PRO' | 'ELITE';

// Legacy plan codes for existing users (not available for new signups)
export type LegacyPlanCode = 'FREE' | 'ESSENTIAL' | 'GROWTH';
export type AllPlanCodes = PlanCode | LegacyPlanCode;

export interface PlanFeature {
  name: string;
  starter: string | boolean;
  pro: string | boolean;
  elite: string | boolean;
}

export interface AppPlan {
  code: PlanCode | LegacyPlanCode;
  name: string;
  price: string;
  priceCents: number;
  maxListings: number | 'Unlimited';
  visibilityWeight: number;
  description: string;
  features: string[];
  popular?: boolean;
  isLegacy?: boolean;
}

// Feature comparison for pricing table
export const PLAN_FEATURES: PlanFeature[] = [
  { name: 'Guaranteed Monthly Leads', starter: '5–10', pro: '10–25', elite: '30+' },
  { name: 'Service Listings', starter: '10', pro: '25', elite: 'Unlimited' },
  { name: 'Gallery Images', starter: '20', pro: '60', elite: 'Unlimited' },
  { name: 'Short Video Uploads', starter: false, pro: true, elite: true },
  { name: 'Before & After Gallery', starter: false, pro: true, elite: true },
  { name: 'Analytics Dashboard', starter: 'Basic', pro: 'Advanced', elite: 'Premium' },
  { name: 'Search Placement', starter: 'Standard', pro: 'Priority', elite: 'Premium' },
  { name: 'Team Member Profiles', starter: false, pro: '5', elite: 'Unlimited' },
  { name: 'Job Posting Board', starter: false, pro: false, elite: true },
  { name: 'Support', starter: 'Email', pro: 'Priority', elite: 'Dedicated Manager' },
  { name: 'Featured Salon Priority', starter: false, pro: true, elite: true },
  { name: 'Early Access to Features', starter: false, pro: false, elite: true },
];

// Active plans available for new signups
export const APP_PLANS: AppPlan[] = [
  {
    code: 'STARTER',
    name: 'Starter',
    price: 'R229/month',
    priceCents: 22900,
    maxListings: 10,
    visibilityWeight: 2,
    description: 'Perfect for small salons or solo stylists getting started.',
    features: [
      '5–10 guaranteed leads/month',
      'Up to 10 service listings',
      'Gallery up to 20 images',
      'Basic analytics dashboard',
      'Email support',
    ],
  },
  {
    code: 'PRO',
    name: 'Pro',
    price: 'R329/month',
    priceCents: 32900,
    maxListings: 25,
    visibilityWeight: 3,
    description: 'For growing salons ready for more clients and higher visibility.',
    features: [
      '10–25 guaranteed leads/month',
      'Up to 25 service listings',
      'Gallery up to 60 images',
      'Short video uploads',
      'Before & after gallery',
      'Priority search placement',
      'Analytics + performance insights',
      'Up to 5 team member profiles',
      'Priority support',
    ],
    popular: true,
  },
  {
    code: 'ELITE',
    name: 'Elite',
    price: 'R499/month',
    priceCents: 49900,
    maxListings: 'Unlimited',
    visibilityWeight: 5,
    description: 'For established salons, franchises, and premium brands.',
    features: [
      '30+ guaranteed leads/month',
      'Unlimited service listings',
      'Unlimited gallery images',
      'Short video uploads',
      'Before & after gallery',
      'Premium search placement',
      'Featured salon priority',
      'Unlimited team member profiles',
      'Job posting board access',
      'Dedicated account manager',
      'Early access to new features',
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
    description: 'Legacy free tier',
    features: ['1 service listing', 'Gallery up to 5 images', 'Community support'],
    isLegacy: true,
  },
  {
    code: 'ESSENTIAL',
    name: 'Essential (Legacy)',
    price: 'R99/month',
    priceCents: 9900,
    maxListings: 7,
    visibilityWeight: 2,
    description: 'Legacy essential plan',
    features: ['Up to 7 listings', 'Basic visibility', 'Email support'],
    isLegacy: true,
  },
  {
    code: 'GROWTH',
    name: 'Growth (Legacy)',
    price: 'R199/month',
    priceCents: 19900,
    maxListings: 15,
    visibilityWeight: 3,
    description: 'Legacy growth plan',
    features: ['Up to 15 listings', 'Priority visibility', 'Email support'],
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
export const DEFAULT_PLAN: PlanCode = 'STARTER';
