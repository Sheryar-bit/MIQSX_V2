import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongoose";
import Membership from "@/models/Membership";
import { getOrgContext, requireRole } from "@/lib/org-context";

// GET /api/team/members — list members of the active workspace.
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    await dbConnect();
    const ctx = await getOrgContext(session);
    if (!ctx) return NextResponse.json({ members: [], count: 0 });

    const memberships = await Membership.find({ orgId: ctx.orgId })
      .populate("userId", "name email image")
      .sort({ joinedAt: 1 });

    const members = memberships.map((m) => {
      const u = m.userId as unknown as { _id: string; name: string; email: string; image?: string };
      return {
        userId: u?._id?.toString(),
        name: u?.name,
        email: u?.email,
        image: u?.image,
        role: m.role,
        joinedAt: m.joinedAt,
      };
    });

    return NextResponse.json({ members, count: members.length, myRole: ctx.role });
  } catch (err) {
    console.error("[team members GET]", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// DELETE /api/team/members — remove a member (admin+). Owners can't be removed.
export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const guard = await requireRole(session, "admin");
  if (!guard.ok) return guard.response;

  try {
    const { userId } = (await req.json()) as { userId: string };
    if (!userId) return NextResponse.json({ error: "userId is required" }, { status: 400 });

    await dbConnect();
    const res = await Membership.deleteOne({
      orgId: guard.ctx.orgId,
      userId,
      role: { $ne: "owner" }, // never remove the owner
    });
    if (res.deletedCount === 0) {
      return NextResponse.json({ error: "Member not found or is the owner" }, { status: 404 });
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[team members DELETE]", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// PATCH /api/team/members — change a member's role (admin+). Can't touch the owner.
export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const guard = await requireRole(session, "admin");
  if (!guard.ok) return guard.response;

  try {
    const { userId, role } = (await req.json()) as { userId: string; role: string };
    const validRoles = ["admin", "editor", "viewer"];
    if (!userId || !validRoles.includes(role)) {
      return NextResponse.json({ error: "userId and a valid role are required" }, { status: 400 });
    }

    await dbConnect();
    const res = await Membership.updateOne(
      { orgId: guard.ctx.orgId, userId, role: { $ne: "owner" } },
      { $set: { role } }
    );
    if (res.matchedCount === 0) {
      return NextResponse.json({ error: "Member not found or is the owner" }, { status: 404 });
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[team members PATCH]", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
