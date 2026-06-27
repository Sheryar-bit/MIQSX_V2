import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongoose";
import Membership from "@/models/Membership";
import Organization from "@/models/Organization";
import Brand from "@/models/Brand";
import Review from "@/models/Review";
import TeamInvite from "@/models/TeamInvite";
import AnalyticsEvent from "@/models/Analytics";
import { requireRole } from "@/lib/org-context";

// DELETE /api/team/workspace — permanently delete the active workspace (owner only).
// Blocked if it's the owner's only workspace, so they're never left without one.
export async function DELETE() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const guard = await requireRole(session, "owner");
  if (!guard.ok) return guard.response;

  try {
    await dbConnect();
    const orgId = guard.ctx.orgId;

    const otherWorkspaces = await Membership.countDocuments({
      userId: session.user.id,
      orgId: { $ne: orgId },
    });
    if (otherWorkspaces === 0) {
      return NextResponse.json(
        { error: "You can't delete your only workspace." },
        { status: 400 }
      );
    }

    // Cascade delete everything scoped to this workspace.
    await Promise.all([
      Brand.deleteMany({ orgId }),
      Review.deleteMany({ orgId }),
      Membership.deleteMany({ orgId }),
      TeamInvite.deleteMany({ orgId }),
      AnalyticsEvent.deleteMany({ orgId }),
      Organization.deleteOne({ _id: orgId }),
    ]);

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[team workspace DELETE]", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
