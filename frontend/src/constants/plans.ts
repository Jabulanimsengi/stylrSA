export type PlanCode = 'STARTER' | 'ESSENTIAL' | 'GROWTH' | 'PRO' | 'ELITE';

export interface AppPlan {
  code: PlanCode;
  name: string;
  price: string;
  priceCents: number;
  maxListings: number | 'Unlimited';
  visibilityWeight: number;
  features: string[];
}

export const APP_PLANS: AppPlan[] = [
  {
    code: 'STARTER',
    name: 'Starter',
    price: 'R49',
    priceCents: 4900,
    maxListings: 2,
    visibilityWeight: 1,
    features: ['Up to 2 listings', 'Basic visibility', 'Email support'],
  },
  {
    code: 'ESSENTIAL',
    name: 'Essential',
    price: 'R99',
    priceCents: 9900,
    maxListings: 6,
    visibilityWeight: 2,
    features: ['Up to 6 listings', 'Higher placement', 'Basic analytics'],
  },
  {
    code: 'GROWTH',
    name: 'Growth',
    price: 'R199',
    priceCents: 19900,
    maxListings: 11,
    visibilityWeight: 3,
    features: ['Up to 11 listings', 'Priority placement', 'Analytics + highlights'],
  },
  {
    code: 'PRO',
    name: 'Pro',
    price: 'R299',
    priceCents: 29900,
    maxListings: 26,
    visibilityWeight: 4,
    features: ['Up to 26 listings', 'Top placement', 'Priority support', 'Featured eligibility'],
  },
  {
    code: 'ELITE',
    name: 'Elite',
    price: 'R499',
    priceCents: 49900,
    maxListings: 'Unlimited',
    visibilityWeight: 5,
    features: [
      'Unlimited listings',
      'Premium placement',
      'Dedicated support',
      'Early access promos',
    ],
  },
];

export const PLAN_BY_CODE: Record<PlanCode, AppPlan> = APP_PLANS.reduce(
  (acc, plan) => {
    acc[plan.code] = plan;
    return acc;
  },
  {} as Record<PlanCode, AppPlan>,
);
