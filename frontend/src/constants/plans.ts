export type PlanCode = 'FREE' | 'STARTER' | 'ESSENTIAL' | 'GROWTH' | 'PRO' | 'ELITE';

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
    code: 'FREE',
    name: 'Free',
    price: 'R0',
    priceCents: 0,
    maxListings: 1,
    visibilityWeight: 0,
    features: ['1 service listing', 'Gallery up to 5 images', 'Community support'],
  },
  {
    code: 'STARTER',
    name: 'Starter',
    price: 'R49',
    priceCents: 4900,
    maxListings: 3,
    visibilityWeight: 1,
    features: ['Up to 3 listings', 'Basic visibility', 'Email support'],
  },
  {
    code: 'ESSENTIAL',
    name: 'Essential',
    price: 'R99',
    priceCents: 9900,
    maxListings: 7,
    visibilityWeight: 2,
    features: ['Up to 7 listings', 'Higher placement', 'Basic analytics'],
  },
  {
    code: 'GROWTH',
    name: 'Growth',
    price: 'R199',
    priceCents: 19900,
    maxListings: 15,
    visibilityWeight: 3,
    features: ['Up to 15 listings', 'Priority placement', 'Analytics + highlights'],
  },
  {
    code: 'PRO',
    name: 'Pro',
    price: 'R299',
    priceCents: 29900,
    maxListings: 27,
    visibilityWeight: 4,
    features: ['Up to 27 listings', 'Top placement', 'Priority support', 'Featured eligibility'],
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
