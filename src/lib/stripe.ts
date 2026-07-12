import Stripe from "stripe";
import type { UserPlan, BillingInterval } from "./plans";
import { getPriceId, planFromPriceId } from "./plans";

let _stripe: Stripe | null = null;

/** Lazily construct the Stripe client so a missing key doesn't break builds. */
export function getStripe(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY is not set");
  if (!_stripe) _stripe = new Stripe(key);
  return _stripe;
}

/** Paid plan (+ interval) → Stripe Price ID. Defaults to the monthly price. */
export function planToPriceId(
  plan: Exclude<UserPlan, "free">,
  interval: BillingInterval = "monthly"
): string | undefined {
  try {
    return getPriceId(plan, interval);
  } catch {
    return undefined;
  }
}

/** Reverse: a Stripe Price ID → our plan key (any interval). */
export function priceIdToPlan(priceId: string | undefined): UserPlan | null {
  return planFromPriceId(priceId)?.plan ?? null;
}
