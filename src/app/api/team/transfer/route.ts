import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import mongoose from "mongoose";
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

    // All-or-nothing: promote target → owner, demote current owner → admin, and
    // repoint org.ownerId in a single transaction so we can never end up with
    // two owners or none. Falls back to sequential writes if transactions aren't
    // supported by the deployment (e.g. a standalone mongod in local dev).
    const currentOwnerId = session.user.id;
    const dbSession = await mongoose.startSession();
    try {
      await dbSession.withTransaction(async () => {
        await Membership.updateOne({ orgId, userId }, { $set: { role: "owner" } }, { session: dbSession });
        await Membership.updateOne({ orgId, userId: currentOwnerId }, { $set: { role: "admin" } }, { session: dbSession });
        await Organization.updateOne({ _id: orgId }, { $set: { ownerId: userId } }, { session: dbSession });
      });
    } catch (txErr) {
      const code = (txErr as { code?: number }).code;
      // 20 = "Transaction numbers are only allowed on a replica set" (standalone mongod).
      if (code === 20 || code === 40415) {
        await Membership.updateOne({ orgId, userId }, { $set: { role: "owner" } });
        await Membership.updateOne({ orgId, userId: currentOwnerId }, { $set: { role: "admin" } });
        await Organization.updateOne({ _id: orgId }, { $set: { ownerId: userId } });
      } else {
        throw txErr;
      }
    } finally {
      await dbSession.endSession();
    }

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
