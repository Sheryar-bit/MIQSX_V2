import dbConnect from "./mongoose";
import Organization, { SubscriptionStatus } from "../models/Organization";
import { UserPlan } from "./plans";

export interface ActivatePlanResult {
  plan: UserPlan;
  activatedAt: Date;
  expiresAt: Date | null;
}

export interface ActivatePlanOptions {
  months?: number;             // billing-cycle length (ignored if expiresAt given)
  expiresAt?: Date | null;     // explicit period end (e.g. from a Stripe subscription)
  stripeCustomerId?: string;
  stripeSubscriptionId?: string | null;
  subscriptionStatus?: SubscriptionStatus;  // 'active' | 'canceled' | 'past_due' ...
  trialEndsAt?: Date | null;                // clear/set the DB trial window
}

/**
 * The single source of truth for changing an ORGANIZATION's plan.
 *
 * Server-only, and the ONLY place plan state is mutated. The Stripe webhook
 * calls this after verifying a payment; the client never sets the plan.
 */
export async function activatePlan(
  orgId: string,
  plan: UserPlan,
  opts: ActivatePlanOptions = {}
): Promise<ActivatePlanResult> {
  await dbConnect();

  const now = new Date();

  let expiresAt: Date | null;
  if (opts.expiresAt !== undefined) {
    expiresAt = opts.expiresAt;
  } else if (plan === "free") {
    expiresAt = null; // free never expires
  } else {
    expiresAt = new Date(now);
    expiresAt.setMonth(expiresAt.getMonth() + (opts.months ?? 1));
  }

  const set: Record<string, unknown> = {
    plan,
    planActivatedAt: now,
    planExpiresAt: expiresAt,
  };
  if (opts.stripeCustomerId !== undefined) set.stripeCustomerId = opts.stripeCustomerId;
  if (opts.stripeSubscriptionId !== undefined) set.stripeSubscriptionId = opts.stripeSubscriptionId;
  if (opts.subscriptionStatus !== undefined) set.subscriptionStatus = opts.subscriptionStatus;
  if (opts.trialEndsAt !== undefined) set.trialEndsAt = opts.trialEndsAt;
  // Keep subscriptionStatus coherent with the plan when the caller didn't set it:
  // free → 'free' (no live sub); paid → 'active' (e.g. the dev plan-switch path).
  // The Stripe webhook/confirm always pass an explicit status, so this only fills
  // the gap for direct activatePlan() calls.
  if (opts.subscriptionStatus === undefined) {
    set.subscriptionStatus = plan === "free" ? "free" : "active";
  }

  const org = await Organization.findByIdAndUpdate(orgId, set, { new: true });
  if (!org) throw new Error(`activatePlan: org ${orgId} not found`);

  return { plan: org.plan, activatedAt: org.planActivatedAt!, expiresAt: org.planExpiresAt ?? null };
}
