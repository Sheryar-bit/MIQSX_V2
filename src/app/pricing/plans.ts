export interface PricingPlan {
  name: string;
  price: { monthly: number; yearly: number };
  blurb: string;
  cta: string;
  href: string;
  highlight: boolean;
  badge?: string;
  features: string[];
}

export const PLANS: PricingPlan[] = [
  {
    name: 'Free',
    price: { monthly: 0, yearly: 0 },
    blurb: 'For solo founders exploring their brand DNA.',
    cta: 'Get started free',
    href: '/auth/signup',
    highlight: false,
    features: [
      '1 Brand DNA',
      '30 generated assets / month',
      'Brand Guardian scoring',
      'Name generator',
      'Basic moodboard',
      'Community support',
    ],
  },
  {
    name: 'Pro',
    price: { monthly: 2999, yearly: 1999 },
    blurb: 'For freelancers and growing brands.',
    cta: 'Start Pro free',
    href: '/auth/signup?plan=pro',
    highlight: true,
    badge: 'Most popular',
    features: [
      '5 Brand DNAs',
      'Unlimited asset generation',
      'Trilingual copy (EN · UR · Roman)',
      'Logo composer + export',
      'Cultural Check + Stress Test',
      'Focus group simulation',
      'Up to 3 seats',
      'Priority support',
    ],
  },
  {
    name: 'Agency',
    price: { monthly: 7999, yearly: 4999 },
    blurb: 'For studios managing multiple clients.',
    cta: 'Start Agency free',
    href: '/auth/signup?plan=agency',
    highlight: false,
    features: [
      'Unlimited Brand DNAs',
      'Unlimited asset generation',
      'All Pro features',
      'Client review links',
      'Audit log + activity feed',
      'Unlimited seats',
      'WhatsApp approval workflow',
      'Dedicated support',
    ],
  },
];
