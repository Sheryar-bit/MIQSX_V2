import Stripe from "stripe";
import type { UserPlan } from "./plans";

let _stripe: Stripe | null = null;

/** Lazily construct the Stripe client so a missing key doesn't break builds. */
export function getStripe(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY is not set");
  if (!_stripe) _stripe = new Stripe(key);
  return _stripe;
}

/** Paid plan → Stripe Price ID (set in .env from the Stripe dashboard). */
export function planToPriceId(plan: Exclude<UserPlan, "free">): string | undefined {
  return plan === "pro" ? process.env.STRIPE_PRICE_PRO : process.env.STRIPE_PRICE_AGENCY;
}

/** Reverse: a Stripe Price ID → our plan key. */
export function priceIdToPlan(priceId: string | undefined): UserPlan | null {
  if (!priceId) return null;
  if (priceId === process.env.STRIPE_PRICE_PRO) return "pro";
  if (priceId === process.env.STRIPE_PRICE_AGENCY) return "agency";
  return null;
}
