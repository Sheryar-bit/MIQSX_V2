import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongoose";
import Membership from "@/models/Membership";
import { getOrgContext } from "@/lib/org-context";
import { logAudit } from "@/lib/audit-log";

// POST /api/team/leave — leave the active workspace (non-owners only).
export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const ctx = await getOrgContext(session);
  if (!ctx) return NextResponse.json({ error: "No workspace" }, { status: 403 });

  if (ctx.role === "owner") {
    return NextResponse.json(
      { error: "Owners can't leave — transfer ownership or delete the workspace first." },
      { status: 400 }
    );
  }

  try {
    await dbConnect();
    await Membership.deleteOne({ orgId: ctx.orgId, userId: session.user.id });
    await logAudit({
      orgId: ctx.orgId,
      actorId: session.user.id,
      actorName: session.user.name,
      action: "member.left",
      detail: "left the workspace",
    });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[team leave]", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
