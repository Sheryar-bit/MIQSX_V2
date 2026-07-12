import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import type Stripe from "stripe";
import { authOptions } from "@/lib/auth";
import { requireRole } from "@/lib/org-context";
import { getStripe } from "@/lib/stripe";
import { activatePlan } from "@/lib/activate-plan";
import { UserPlan } from "@/lib/plans";

export const runtime = "nodejs";

function periodEnd(sub: Stripe.Subscription): Date | undefined {
  const end = (sub as unknown as { current_period_end?: number }).current_period_end;
  return end ? new Date(end * 1000) : undefined;
}

// POST /api/billing/confirm — called by the /billing return page after Stripe
// redirects back with ?session_id=. Activates the plan right away so the upgrade
// shows immediately, WITHOUT depending on the webhook (useful in local/demo where
// Stripe can't reach localhost).
//
// This is safe: it re-fetches the Checkout Session from Stripe (not trusting the
// client), verifies it belongs to the caller's workspace and was actually paid,
// then activates via the same single mutation point the webhook uses. Idempotent —
// running it after the webhook has already fired just re-applies the same state.
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const guard = await requireRole(session, "owner");
  if (!guard.ok) return guard.response;

  const { sessionId } = (await req.json()) as { sessionId?: string };
  if (!sessionId) {
    return NextResponse.json({ error: "sessionId is required" }, { status: 400 });
  }

  try {
    const stripe = getStripe();
    const cs = await stripe.checkout.sessions.retrieve(sessionId);

    // The session must belong to THIS workspace (guards against confirming
    // someone else's session id).
    const orgId = cs.metadata?.orgId ?? cs.client_reference_id ?? undefined;
    if (!orgId || orgId !== guard.ctx.orgId) {
      return NextResponse.json({ error: "Session does not belong to this workspace" }, { status: 403 });
    }

    // And must actually be paid.
    if (cs.payment_status !== "paid" && cs.status !== "complete") {
      return NextResponse.json({ activated: false, reason: "not_paid" });
    }

    const plan = (cs.metadata?.plan as UserPlan) ?? null;
    if (!plan) return NextResponse.json({ error: "No plan on session" }, { status: 400 });

    let expiresAt: Date | undefined;
    if (cs.subscription) {
      const sub = await stripe.subscriptions.retrieve(
        typeof cs.subscription === "string" ? cs.subscription : cs.subscription.id
      );
      expiresAt = periodEnd(sub);
    }

    const result = await activatePlan(guard.ctx.orgId, plan, {
      expiresAt,
      subscriptionStatus: "active",
      trialEndsAt: null,
      stripeCustomerId: typeof cs.customer === "string" ? cs.customer : cs.customer?.id,
      stripeSubscriptionId: typeof cs.subscription === "string" ? cs.subscription : cs.subscription?.id ?? null,
    });

    return NextResponse.json({ activated: true, plan: result.plan });
  } catch (err) {
    console.error("[billing confirm]", err);
    return NextResponse.json({ error: "Could not confirm checkout" }, { status: 500 });
  }
}
