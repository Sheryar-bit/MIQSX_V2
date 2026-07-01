import dbConnect from "./mongoose";
import Organization from "../models/Organization";
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

  const org = await Organization.findByIdAndUpdate(orgId, set, { new: true });
  if (!org) throw new Error(`activatePlan: org ${orgId} not found`);

  return { plan: org.plan, activatedAt: org.planActivatedAt!, expiresAt: org.planExpiresAt ?? null };
}
