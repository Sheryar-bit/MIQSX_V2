export type UserPlan = "free" | "pro" | "agency";

export interface PlanDefinition {
  id: UserPlan;
  name: string;
  price: {
    pkr: number;
    usd: number;
  };
  limits: {
    brands: number;           // max saved brands (-1 = unlimited)
    logoGenerations: number;  // per month
    captionGenerations: number;
    taglineGenerations: number;
    imageryGenerations: number;
    festiveGenerations: number;
    auditRuns: number;
    guardianRuns: number;
    focusGroupRuns: number;
    stressTestRuns: number;
    culturalChecks: number;
    teamMembers: number;      // max team members (0 = solo only)
    reviewItems: number;      // max open review items
    publicProfiles: number;   // max public brand profiles
  };
  features: string[];
}

export const PLANS: Record<UserPlan, PlanDefinition> = {
  free: {
    id: "free",
    name: "Free",
    price: { pkr: 0, usd: 0 },
    limits: {
      brands: 2,
      logoGenerations: 5,
      captionGenerations: 10,
      taglineGenerations: 10,
      imageryGenerations: 3,
      festiveGenerations: 3,
      auditRuns: 3,
      guardianRuns: 5,
      focusGroupRuns: 2,
      stressTestRuns: 3,
      culturalChecks: 3,
      teamMembers: 0,
      reviewItems: 5,
      publicProfiles: 0,
    },
    features: [
      "2 saved brands",
      "AI Onboarding & Brand DNA",
      "Logo generator (5/month)",
      "Trilingual captions (10/month)",
      "Brand Guardian (5/month)",
      "Brief Parser",
    ],
  },

  pro: {
    id: "pro",
    name: "Pro",
    price: { pkr: 2999, usd: 11 },
    limits: {
      brands: 10,
      logoGenerations: 50,
      captionGenerations: 100,
      taglineGenerations: 100,
      imageryGenerations: 30,
      festiveGenerations: 30,
      auditRuns: 30,
      guardianRuns: 50,
      focusGroupRuns: 20,
      stressTestRuns: 30,
      culturalChecks: 30,
      teamMembers: 0,
      reviewItems: 50,
      publicProfiles: 3,
    },
    features: [
      "10 saved brands",
      "All Free features",
      "Higher monthly limits",
      "Post Imagery (30/month)",
      "AI Focus Group (20/month)",
      "Cultural Check (30/month)",
      "Festive Variants",
      "Social Media Kit Export",
      "3 public brand profiles",
      "WhatsApp client approval links",
    ],
  },

  agency: {
    id: "agency",
    name: "Agency",
    price: { pkr: 7999, usd: 29 },
    limits: {
      brands: -1,
      logoGenerations: -1,
      captionGenerations: -1,
      taglineGenerations: -1,
      imageryGenerations: 100,
      festiveGenerations: 100,
      auditRuns: -1,
      guardianRuns: -1,
      focusGroupRuns: -1,
      stressTestRuns: -1,
      culturalChecks: -1,
      teamMembers: 10,
      reviewItems: -1,
      publicProfiles: -1,
    },
    features: [
      "Unlimited brands",
      "All Pro features — unlimited",
      "Up to 10 team members",
      "Role-based access (Admin/Editor/Viewer)",
      "Review Board with team comments",
      "Unlimited public brand profiles",
      "Priority Groq rate limit pool",
    ],
  },
};

// Feature key → plan limit key mapping
export const FEATURE_LIMIT_MAP: Record<string, keyof PlanDefinition["limits"]> = {
  logo: "logoGenerations",
  captions: "captionGenerations",
  taglines: "taglineGenerations",
  imagery: "imageryGenerations",
  festive: "festiveGenerations",
  audit: "auditRuns",
  guardian: "guardianRuns",
  "focus-group": "focusGroupRuns",
  "stress-test": "stressTestRuns",
  cultural: "culturalChecks",
};

/**
 * Returns true if the user is within their plan's limit for a given feature.
 * Pass usageCounts[feature] and the user's plan.
 */
export function isWithinLimit(
  plan: UserPlan,
  feature: keyof typeof FEATURE_LIMIT_MAP,
  currentCount: number
): boolean {
  const limitKey = FEATURE_LIMIT_MAP[feature];
  if (!limitKey) return true; // unknown feature — allow
  const limit = PLANS[plan].limits[limitKey] as number;
  if (limit === -1) return true; // unlimited
  return currentCount < limit;
}

/**
 * Returns remaining uses for a feature. Returns Infinity for unlimited plans.
 */
export function remainingUses(
  plan: UserPlan,
  feature: keyof typeof FEATURE_LIMIT_MAP,
  currentCount: number
): number {
  const limitKey = FEATURE_LIMIT_MAP[feature];
  if (!limitKey) return Infinity;
  const limit = PLANS[plan].limits[limitKey] as number;
  if (limit === -1) return Infinity;
  return Math.max(0, limit - currentCount);
}

/** Returns current month string e.g. "2026-06" */
export function currentMonth(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}
