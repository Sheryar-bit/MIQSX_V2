import type { UserPlan, SubscriptionStatus } from "../models/Organization";

// Paid-feature access, derived from the workspace's billing lifecycle.
//
// The 7-day trial lives in our DB (no card), so access during the trial is
// granted purely from `subscriptionStatus === 'trialing'` + a future
// `trialEndsAt`. Once the user converts, the Stripe webhook flips them to
// 'active'. This module is the single place that answers "does this workspace
// currently get paid features?" — gate paid features through it.

/** Minimal billing shape — works with a full Mongoose doc or a `.lean()` object. */
export interface BillingSubject {
  plan: UserPlan;
  subscriptionStatus?: SubscriptionStatus | null;
  trialEndsAt?: Date | string | null;
}

/** True while a trial is still running (status trialing AND end date in the future). */
export function isTrialing(subject: BillingSubject, now: Date = new Date()): boolean {
  if (subject.subscriptionStatus !== "trialing") return false;
  if (!subject.trialEndsAt) return false;
  return new Date(subject.trialEndsAt).getTime() > now.getTime();
}

/**
 * True if the workspace currently gets paid features:
 *   - a paid subscription is active, OR
 *   - a DB trial is still running.
 * Everything else (free, expired trial, canceled, past_due) is false.
 */
export function hasActiveAccess(subject: BillingSubject, now: Date = new Date()): boolean {
  if (subject.subscriptionStatus === "active") return true;
  if (isTrialing(subject, now)) return true;
  // Backward-compat: workspaces that predate the subscriptionStatus field carry a
  // paid plan with no status set. Treat those as active so we never strip access
  // from an existing paying workspace. (canceled / past_due / free are explicit
  // and fall through to false.)
  if (subject.plan !== "free" && subject.subscriptionStatus == null) return true;
  return false;
}

/**
 * The plan whose LIMITS should apply right now. A paid `plan` only counts while
 * the subscription is active or the trial is live — a lapsed trial (or a
 * canceled/past_due sub) falls back to 'free' so limits tighten automatically
 * without a separate downgrade job.
 */
export function effectivePlan(subject: BillingSubject, now: Date = new Date()): UserPlan {
  if (subject.plan === "free") return "free";
  return hasActiveAccess(subject, now) ? subject.plan : "free";
}

/** Whole days remaining in the trial (0 if not trialing or already expired). */
export function trialDaysLeft(subject: BillingSubject, now: Date = new Date()): number {
  if (subject.subscriptionStatus !== "trialing" || !subject.trialEndsAt) return 0;
  const ms = new Date(subject.trialEndsAt).getTime() - now.getTime();
  return ms <= 0 ? 0 : Math.ceil(ms / (24 * 60 * 60 * 1000));
}
