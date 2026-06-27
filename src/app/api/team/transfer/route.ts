import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongoose";
import Membership from "@/models/Membership";
import Organization from "@/models/Organization";
import { requireRole } from "@/lib/org-context";
import { logAudit } from "@/lib/audit-log";

// POST /api/team/transfer  { userId } — hand ownership to another member (owner only).
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const guard = await requireRole(session, "owner");
  if (!guard.ok) return guard.response;

  try {
    const { userId } = (await req.json()) as { userId: string };
    if (!userId) return NextResponse.json({ error: "userId is required" }, { status: 400 });
    if (userId === session.user.id) {
      return NextResponse.json({ error: "You are already the owner." }, { status: 400 });
    }

    await dbConnect();
    const orgId = guard.ctx.orgId;

    const target = await Membership.findOne({ orgId, userId });
    if (!target) return NextResponse.json({ error: "That user isn't a member." }, { status: 404 });

    // Promote target → owner, demote current owner → admin, update org.ownerId.
    await Membership.updateOne({ orgId, userId }, { $set: { role: "owner" } });
    await Membership.updateOne({ orgId, userId: session.user.id }, { $set: { role: "admin" } });
    await Organization.updateOne({ _id: orgId }, { $set: { ownerId: userId } });

    await logAudit({
      orgId,
      actorId: session.user.id,
      actorName: session.user.name,
      action: "ownership.transferred",
      detail: "transferred workspace ownership",
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[team transfer]", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
