import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { requireRole } from "@/lib/org-context";
import Organization from "@/models/Organization";
import { getStripe } from "@/lib/stripe";
import { getPriceId, UserPlan, BillingInterval } from "@/lib/plans";

export const runtime = "nodejs";

// POST /api/billing/checkout — start a Stripe Checkout session for the workspace.
// Owner-only; the subscription belongs to the Organization.
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const guard = await requireRole(session, "owner");
  if (!guard.ok) return guard.response;

  try {
    const { plan, interval = "monthly" } = (await req.json()) as {
      plan: UserPlan;
      interval?: BillingInterval;
    };
    if (plan !== "pro" && plan !== "agency") {
      return NextResponse.json({ error: "Only pro and agency are purchasable." }, { status: 400 });
    }
    if (interval !== "monthly" && interval !== "yearly") {
      return NextResponse.json({ error: "interval must be 'monthly' or 'yearly'." }, { status: 400 });
    }

    let priceId: string;
    try {
      priceId = getPriceId(plan, interval);
    } catch {
      return NextResponse.json(
        { error: `No Stripe price configured for ${plan}/${interval}.` },
        { status: 500 }
      );
    }

    const org = await Organization.findById(guard.ctx.orgId);
    if (!org) return NextResponse.json({ error: "Workspace not found" }, { status: 404 });

    const stripe = getStripe();

    // Reuse or create the Stripe customer for this workspace.
    let customerId = org.stripeCustomerId;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: session.user.email ?? undefined,
        name: org.name,
        metadata: { orgId: org._id.toString() },
      });
      customerId = customer.id;
      org.stripeCustomerId = customerId;
      await org.save();
    }

    const appUrl = process.env.APP_URL ?? process.env.NEXTAUTH_URL ?? "http://localhost:3000";

    const checkout = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer: customerId,
      // NOTE: no `trial_period_days` — the 7-day trial already ran in our DB
      // (no card). Adding a Stripe trial here would double it and delay billing.
      line_items: [{ price: priceId, quantity: 1 }],
      client_reference_id: org._id.toString(),
      metadata: { orgId: org._id.toString(), plan, interval },
      subscription_data: { metadata: { orgId: org._id.toString(), plan, interval } },
      // session_id lets the return page confirm + activate immediately (a
      // webhook-independent fallback, handy for local/demo). Stripe substitutes
      // the real id into the {CHECKOUT_SESSION_ID} template.
      success_url: `${appUrl}/billing?upgraded=1&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/billing?cancelled=1`,
      allow_promotion_codes: true,
    });

    return NextResponse.json({ url: checkout.url });
  } catch (err) {
    console.error("[checkout]", err);
    return NextResponse.json({ error: "Could not start checkout." }, { status: 500 });
  }
}
