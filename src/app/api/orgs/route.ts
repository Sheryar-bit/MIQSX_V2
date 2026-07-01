import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongoose";
import Membership from "@/models/Membership";

// GET /api/orgs — the workspaces the current user belongs to (for the switcher).
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    await dbConnect();
    const memberships = await Membership.find({ userId: session.user.id })
      .populate("orgId", "name plan")
      .sort({ joinedAt: 1 });

    const orgs = memberships
      .filter((m) => m.orgId)
      .map((m) => {
        const o = m.orgId as unknown as { _id: string; name: string; plan: string };
        return { orgId: o._id.toString(), name: o.name, plan: o.plan, role: m.role };
      });

    return NextResponse.json({ orgs, activeOrgId: session.user.activeOrgId ?? orgs[0]?.orgId });
  } catch (err) {
    console.error("[orgs GET]", err);
    return NextResponse.json({ orgs: [] });
  }
}
