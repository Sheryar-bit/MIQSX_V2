import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongoose";
import TeamInvite from "@/models/TeamInvite";

// GET /api/invitations — pending invites addressed to the logged-in user's email.
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ invitations: [] });

  try {
    await dbConnect();
    const invites = await TeamInvite.find({
      email: session.user.email.toLowerCase(),
      status: "pending",
      expiresAt: { $gt: new Date() },
      orgId: { $exists: true },
    })
      .populate("orgId", "name")
      .populate("invitedBy", "name")
      .sort({ createdAt: -1 });

    const invitations = invites.map((i) => {
      const org = i.orgId as unknown as { _id: string; name?: string } | null;
      const inviter = i.invitedBy as unknown as { name?: string } | null;
      return {
        token: i.token,
        role: i.role,
        orgId: org?._id?.toString(),
        workspaceName: org?.name ?? "a workspace",
        inviterName: inviter?.name ?? "Someone",
      };
    });

    return NextResponse.json({ invitations });
  } catch (err) {
    console.error("[invitations GET]", err);
    return NextResponse.json({ invitations: [] });
  }
}

// DELETE /api/invitations  { token } — decline an invite addressed to you.
export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { token } = (await req.json()) as { token: string };
    if (!token) return NextResponse.json({ error: "token required" }, { status: 400 });

    await dbConnect();
    const res = await TeamInvite.updateOne(
      { token, email: session.user.email.toLowerCase(), status: "pending" },
      { $set: { status: "cancelled" } }
    );
    if (res.matchedCount === 0) return NextResponse.json({ error: "Invite not found" }, { status: 404 });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[invitations DELETE]", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
