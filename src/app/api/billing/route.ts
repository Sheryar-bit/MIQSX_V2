import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongoose";
import User from "@/models/User";
import { PLANS, UserPlan } from "@/lib/plans";

// GET /api/billing — current plan details
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await dbConnect();
    const user = await User.findById(session.user.id);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const currentPlan = PLANS[user.plan as UserPlan] ?? PLANS.free;

    return NextResponse.json({
      current: {
        plan: user.plan,
        activatedAt: user.planActivatedAt,
        expiresAt: user.planExpiresAt,
      },
      plans: Object.values(PLANS).map((p) => ({
        id: p.id,
        name: p.name,
        price: p.price,
        limits: p.limits,
        features: p.features,
        isCurrent: p.id === user.plan,
      })),
      limits: currentPlan.limits,
    });
  } catch (err) {
    console.error("[billing GET]", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// POST /api/billing — simulate plan upgrade
// In production, replace the body of this handler with your payment gateway
// callback (e.g. Stripe webhook, JazzCash/Easypaisa callback, or manual activation).
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // SECURITY: direct client-driven plan changes are a free-escalation hole.
  // Real upgrades must come from the payment gateway webhook (Phase 2).
  // This self-service path is allowed only when ALLOW_DEV_PLAN_SWITCH=true (local testing).
  if (process.env.ALLOW_DEV_PLAN_SWITCH !== "true") {
    return NextResponse.json(
      { error: "Plan changes must go through checkout." },
      { status: 403 }
    );
  }

  try {
    const { plan } = await req.json() as { plan: UserPlan };

    if (!["free", "pro", "agency"].includes(plan)) {
      return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
    }

    await dbConnect();

    const now = new Date();
    const expiresAt = new Date(now);
    expiresAt.setMonth(expiresAt.getMonth() + 1); // 30-day billing cycle

    const user = await User.findByIdAndUpdate(
      session.user.id,
      {
        plan,
        planActivatedAt: now,
        planExpiresAt: expiresAt,
      },
      { new: true }
    );

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      ok: true,
      plan: user.plan,
      activatedAt: user.planActivatedAt,
      expiresAt: user.planExpiresAt,
      message: `Plan upgraded to ${PLANS[plan].name}`,
    });
  } catch (err) {
    console.error("[billing POST]", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
