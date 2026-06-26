import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getOrgAnalytics, trackEvent } from "@/lib/analytics";
import { getOrgContext } from "@/lib/org-context";
import { PLANS, currentMonth } from "@/lib/plans";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const ctx = await getOrgContext(session);
    if (!ctx) return NextResponse.json({ error: "No workspace" }, { status: 404 });

    const org = ctx.org;
    const analytics = await getOrgAnalytics(ctx.orgId);

    // Reset usage counts if month changed
    const month = currentMonth();
    let usageCounts = org.usageCounts ?? {};
    if (org.usageMonth !== month) usageCounts = {};

    const plan = PLANS[org.plan as keyof typeof PLANS] ?? PLANS.free;

    return NextResponse.json({
      user: {
        name: session.user.name,
        email: session.user.email,
        plan: org.plan,
        planActivatedAt: org.planActivatedAt,
        planExpiresAt: org.planExpiresAt,
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
    const ctx = await getOrgContext(session);

    await trackEvent({
      userId: session.user.id,
      orgId: ctx?.orgId,
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
