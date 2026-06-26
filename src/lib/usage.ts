import { NextResponse } from "next/server";
import dbConnect from "./mongoose";
import Organization from "../models/Organization";
import {
  PLANS,
  UserPlan,
  FEATURE_LIMIT_MAP,
  isWithinLimit,
  currentMonth,
} from "./plans";

export interface UsageStatus {
  allowed: boolean;
  plan: UserPlan;
  used: number;
  limit: number; // -1 = unlimited
  feature: string;
}

/**
 * Read an organization's current monthly usage for a feature, accounting for the
 * month-reset (counts only apply if usageMonth matches the current month).
 */
export async function checkUsage(orgId: string, feature: string): Promise<UsageStatus> {
  await dbConnect();
  const org = await Organization.findById(orgId).select("plan usageMonth usageCounts");
  const plan = (org?.plan as UserPlan) ?? "free";

  const month = currentMonth();
  const counts: Record<string, number> =
    org && org.usageMonth === month ? (org.usageCounts ?? {}) : {};
  const used = counts[feature] ?? 0;

  const limitKey = FEATURE_LIMIT_MAP[feature];
  const limit = limitKey ? (PLANS[plan].limits[limitKey] as number) : -1;
  const allowed = isWithinLimit(plan, feature as keyof typeof FEATURE_LIMIT_MAP, used);

  return { allowed, plan, used, limit, feature };
}

/**
 * Enforce a plan limit before an expensive operation.
 * Returns a ready-to-send 429 NextResponse if over the limit, or null if allowed.
 *
 * Usage in a route:
 *   const limited = await enforceLimit(ctx.orgId, "logo");
 *   if (limited) return limited;
 */
export async function enforceLimit(
  orgId: string,
  feature: string
): Promise<NextResponse | null> {
  const status = await checkUsage(orgId, feature);
  if (status.allowed) return null;

  return NextResponse.json(
    {
      error: `You've reached your monthly ${feature} limit (${status.limit}) on the ${status.plan} plan. Upgrade for more.`,
      code: "LIMIT_REACHED",
      feature: status.feature,
      used: status.used,
      limit: status.limit,
      plan: status.plan,
    },
    { status: 429 }
  );
}
