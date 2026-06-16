import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getUserAnalytics } from "@/lib/analytics";
import dbConnect from "@/lib/mongoose";
import User from "@/models/User";
import { PLANS, currentMonth } from "@/lib/plans";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await dbConnect();

    const [user, analytics] = await Promise.all([
      User.findById(session.user.id),
      getUserAnalytics(session.user.id),
    ]);

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Reset usage counts if month changed
    const month = currentMonth();
    let usageCounts = user.usageCounts ?? {};
    if (user.usageMonth !== month) {
      usageCounts = {};
    }

    const plan = PLANS[user.plan as keyof typeof PLANS] ?? PLANS.free;

    return NextResponse.json({
      user: {
        name: user.name,
        email: user.email,
        plan: user.plan,
        planActivatedAt: user.planActivatedAt,
        planExpiresAt: user.planExpiresAt,
      },
      plan: {
        id: plan.id,
        name: plan.name,
        price: plan.price,
        limits: plan.limits,
        features: plan.features,
      },
      usageThisMonth: usageCounts,
      analytics: {
        totalByFeature: analytics.totalByFeature,
        last7Days: analytics.last7Days,
        last30Days: analytics.last30Days,
        dailyActivity: analytics.dailyActivity,
      },
    });
  } catch (err) {
    console.error("[analytics GET]", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// POST /api/analytics — track an event (called from client or other API routes)
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { trackEvent } = await import("@/lib/analytics");

    await trackEvent({
      userId: session.user.id,
      brandId: body.brandId,
      event: body.event,
      feature: body.feature,
      step: body.step ?? 1,
      metadata: body.metadata,
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[analytics POST]", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
