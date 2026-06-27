import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongoose";
import AuditLog from "@/models/AuditLog";
import { requireRole } from "@/lib/org-context";

// GET /api/team/activity — recent workspace activity (admin+).
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const guard = await requireRole(session, "admin");
  if (!guard.ok) return guard.response;

  try {
    await dbConnect();
    const logs = await AuditLog.find({ orgId: guard.ctx.orgId })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();
    const activity = logs.map((l) => ({
      actorName: l.actorName,
      action: l.action,
      detail: l.detail,
      createdAt: l.createdAt,
    }));
    return NextResponse.json({ activity });
  } catch (err) {
    console.error("[team activity]", err);
    return NextResponse.json({ activity: [] });
  }
}
