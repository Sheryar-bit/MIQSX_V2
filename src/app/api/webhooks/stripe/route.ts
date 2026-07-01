import { NextRequest, NextResponse } from "next/server";
import type Stripe from "stripe";
import { getStripe, priceIdToPlan } from "@/lib/stripe";
import { activatePlan } from "@/lib/activate-plan";
import dbConnect from "@/lib/mongoose";
import Organization from "@/models/Organization";
import { UserPlan } from "@/lib/plans";

export const runtime = "nodejs";

function periodEnd(sub: Stripe.Subscription): Date | undefined {
  const end = (sub as unknown as { current_period_end?: number }).current_period_end;
  return end ? new Date(end * 1000) : undefined;
}

async function resolveOrgId(
  metaOrgId: string | undefined,
  customerId: string | undefined
): Promise<string | null> {
  if (metaOrgId) return metaOrgId;
  if (customerId) {
    await dbConnect();
    const org = await Organization.findOne({ stripeCustomerId: customerId }).select("_id");
    if (org) return org._id.toString();
  }
  return null;
}

// POST /api/webhooks/stripe — Stripe calls this. Plan state changes ONLY here.
export async function POST(req: NextRequest) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) {
    console.error("[stripe webhook] STRIPE_WEBHOOK_SECRET not set");
    return NextResponse.json({ error: "Webhook not configured" }, { status: 500 });
  }

  const sig = req.headers.get("stripe-signature");
  if (!sig) return NextResponse.json({ error: "Missing signature" }, { status: 400 });

  const rawBody = await req.text();

  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(rawBody, sig, secret);
  } catch (err) {
    console.error("[stripe webhook] signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const s = event.data.object as Stripe.Checkout.Session;
        const orgId = await resolveOrgId(
          s.metadata?.orgId,
          typeof s.customer === "string" ? s.customer : s.customer?.id
        );
        const plan = (s.metadata?.plan as UserPlan) ?? null;
        if (!orgId || !plan) break;

        // Pull the subscription to get the real period end.
        let expiresAt: Date | undefined;
        if (s.subscription) {
          const sub = await getStripe().subscriptions.retrieve(
            typeof s.subscription === "string" ? s.subscription : s.subscription.id
          );
          expiresAt = periodEnd(sub);
        }

        await activatePlan(orgId, plan, {
          expiresAt,
          stripeCustomerId: typeof s.customer === "string" ? s.customer : s.customer?.id,
          stripeSubscriptionId: typeof s.subscription === "string" ? s.subscription : s.subscription?.id ?? null,
        });
        break;
      }

      case "customer.subscription.updated": {
        const sub = event.data.object as Stripe.Subscription;
        const priceId = sub.items.data[0]?.price?.id;
        const plan = (sub.metadata?.plan as UserPlan) ?? priceIdToPlan(priceId);
        const orgId = await resolveOrgId(
          sub.metadata?.orgId,
          typeof sub.customer === "string" ? sub.customer : sub.customer?.id
        );
        if (!orgId || !plan) break;

        // Active/trialing → keep the plan; anything else (past_due, unpaid,
        // canceled) → drop to free.
        if (sub.status === "active" || sub.status === "trialing") {
          await activatePlan(orgId, plan, {
            expiresAt: periodEnd(sub),
            stripeSubscriptionId: sub.id,
          });
        } else {
          await activatePlan(orgId, "free", { stripeSubscriptionId: null });
        }
        break;
      }

      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        const orgId = await resolveOrgId(
          sub.metadata?.orgId,
          typeof sub.customer === "string" ? sub.customer : sub.customer?.id
        );
        if (orgId) await activatePlan(orgId, "free", { stripeSubscriptionId: null });
        break;
      }

      default:
        // Ignore other events.
        break;
    }
  } catch (err) {
    console.error(`[stripe webhook] handler error for ${event.type}:`, err);
    return NextResponse.json({ error: "Handler error" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
