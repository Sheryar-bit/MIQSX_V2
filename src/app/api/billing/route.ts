import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getOrgContext, requireRole } from "@/lib/org-context";
import { PLANS, UserPlan } from "@/lib/plans";
import { activatePlan } from "@/lib/activate-plan";
import { hasActiveAccess, isTrialing, trialDaysLeft } from "@/lib/access";

export const runtime = "nodejs";

// GET /api/billing — current workspace plan details
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const ctx = await getOrgContext(session);
  if (!ctx) return NextResponse.json({ error: "No workspace" }, { status: 404 });

  const org = ctx.org;
  const currentPlan = PLANS[org.plan as UserPlan] ?? PLANS.free;
  const billing = {
    plan: org.plan,
    subscriptionStatus: org.subscriptionStatus,
    trialEndsAt: org.trialEndsAt,
  };

  return NextResponse.json({
    current: {
      plan: org.plan,
      subscriptionStatus: org.subscriptionStatus,
      trialEndsAt: org.trialEndsAt ?? null,
      trialDaysLeft: trialDaysLeft(billing),
      isTrialing: isTrialing(billing),
      hasAccess: hasActiveAccess(billing),
      activatedAt: org.planActivatedAt,
      expiresAt: org.planExpiresAt,
    },
    plans: Object.values(PLANS).map((p) => ({
      id: p.id,
      name: p.name,
      price: p.price,
      limits: p.limits,
      features: p.features,
      isCurrent: p.id === org.plan,
    })),
    limits: currentPlan.limits,
    role: ctx.role,
  });
}

// POST /api/billing — DEV-ONLY plan switch (gated). Real upgrades go through
// /api/billing/checkout → Stripe webhook → activatePlan. Owner-only.
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (process.env.ALLOW_DEV_PLAN_SWITCH !== "true") {
    return NextResponse.json({ error: "Plan changes must go through checkout." }, { status: 403 });
  }

  const guard = await requireRole(session, "owner");
  if (!guard.ok) return guard.response;

  try {
    const { plan } = (await req.json()) as { plan: UserPlan };
    if (!["free", "pro", "agency"].includes(plan)) {
      return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
    }

    const result = await activatePlan(guard.ctx.orgId, plan);
    return NextResponse.json({
      ok: true,
      plan: result.plan,
      activatedAt: result.activatedAt,
      expiresAt: result.expiresAt,
      message: `Plan upgraded to ${PLANS[plan].name}`,
    });
  } catch (err) {
    console.error("[billing POST]", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
