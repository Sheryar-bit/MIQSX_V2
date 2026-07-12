import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongoose";
import Membership from "@/models/Membership";
import { effectivePlan } from "@/lib/access";
import type { SubscriptionStatus, UserPlan } from "@/models/Organization";

// GET /api/orgs — the workspaces the current user belongs to, labeled
// personal vs team, with member counts + plan (for the switcher).
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    await dbConnect();
    const memberships = await Membership.find({ userId: session.user.id })
      .populate("orgId", "name plan subscriptionStatus trialEndsAt")
      .sort({ joinedAt: 1 });

    const orgs = await Promise.all(
      memberships
        .filter((m) => m.orgId)
        .map(async (m) => {
          const o = m.orgId as unknown as {
            _id: string; name: string; plan: UserPlan;
            subscriptionStatus?: SubscriptionStatus; trialEndsAt?: Date | null;
          };
          const memberCount = await Membership.countDocuments({ orgId: o._id });
          return {
            orgId: o._id.toString(),
            name: o.name,
            // Effective plan so a lapsed trial shows 'free' in the switcher/sidebar.
            plan: effectivePlan({ plan: o.plan, subscriptionStatus: o.subscriptionStatus, trialEndsAt: o.trialEndsAt }),
            role: m.role,
            memberCount,
            // Personal = a solo workspace you own; anything else is a team.
            isPersonal: m.role === "owner" && memberCount === 1,
          };
        })
    );

    return NextResponse.json({ orgs, activeOrgId: session.user.activeOrgId ?? orgs[0]?.orgId });
  } catch (err) {
    console.error("[orgs GET]", err);
    return NextResponse.json({ orgs: [] });
  }
}
