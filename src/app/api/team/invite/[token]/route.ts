import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongoose";
import Organization from "@/models/Organization";
import Membership from "@/models/Membership";
import TeamInvite from "@/models/TeamInvite";
import { PLANS, UserPlan } from "@/lib/plans";
import { logAudit } from "@/lib/audit-log";

// GET /api/team/invite/[token] — invite details for the accept page.
export async function GET(_req: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;

  try {
    await dbConnect();
    const invite = await TeamInvite.findOne({ token })
      .populate("invitedBy", "name")
      .populate("orgId", "name");
    if (!invite) return NextResponse.json({ error: "Invite not found" }, { status: 404 });

    const expired = invite.expiresAt.getTime() < Date.now();
    const inviter = invite.invitedBy as unknown as { name?: string } | null;
    const org = invite.orgId as unknown as { name?: string } | null;

    return NextResponse.json({
      email: invite.email,
      role: invite.role,
      status: invite.status,
      inviterName: inviter?.name ?? "A MIQSX user",
      workspaceName: org?.name ?? "a workspace",
      expiresAt: invite.expiresAt,
      valid: invite.status === "pending" && !expired && !!invite.orgId,
    });
  } catch (err) {
    console.error("[invite GET]", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// POST /api/team/invite/[token] — accept the invite (requires login).
export async function POST(_req: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "You must be logged in to accept an invite." }, { status: 401 });
  }

  const { token } = await params;

  try {
    await dbConnect();
    const invite = await TeamInvite.findOne({ token });
    if (!invite) return NextResponse.json({ error: "Invite not found" }, { status: 404 });
    if (!invite.orgId) {
      return NextResponse.json({ error: "This invite is no longer valid." }, { status: 410 });
    }
    if (invite.status !== "pending") {
      return NextResponse.json({ error: `This invite is already ${invite.status}.` }, { status: 409 });
    }
    if (invite.expiresAt.getTime() < Date.now()) {
      invite.status = "expired";
      await invite.save();
      return NextResponse.json({ error: "This invite has expired." }, { status: 410 });
    }

    // The invite is bound to a specific email — a forwarded/leaked link can't be
    // consumed by a different account.
    if (session.user.email?.toLowerCase() !== invite.email) {
      return NextResponse.json(
        { error: "This invite was sent to a different email address." },
        { status: 403 }
      );
    }

    const memberId = session.user.id;
    const org = await Organization.findById(invite.orgId);
    if (!org) return NextResponse.json({ error: "Workspace no longer exists." }, { status: 404 });

    // Already a member? Mark accepted and return.
    const existing = await Membership.findOne({ userId: memberId, orgId: org._id });
    if (existing) {
      invite.status = "accepted";
      invite.acceptedAt = new Date();
      invite.acceptedBy = memberId as unknown as typeof invite.acceptedBy;
      await invite.save();
      return NextResponse.json({ ok: true, alreadyMember: true });
    }

    // Seat re-check at accept time (viewers are free).
    const plan = PLANS[org.plan as UserPlan] ?? PLANS.free;
    if (plan.limits.teamMembers === 0) {
      return NextResponse.json({ error: "This workspace's plan no longer supports members." }, { status: 403 });
    }
    if (invite.role !== "viewer" && plan.limits.teamMembers !== -1) {
      const seatCount = await Membership.countDocuments({ orgId: org._id, role: { $ne: "viewer" } });
      if (seatCount >= plan.limits.teamMembers) {
        return NextResponse.json({ error: "This workspace is full." }, { status: 403 });
      }
    }

    await Membership.create({ userId: memberId, orgId: org._id, role: invite.role });

    invite.status = "accepted";
    invite.acceptedAt = new Date();
    invite.acceptedBy = memberId as unknown as typeof invite.acceptedBy;
    await invite.save();

    await logAudit({
      orgId: org._id.toString(),
      actorId: memberId,
      actorName: session.user.name,
      action: "member.joined",
      detail: `joined as ${invite.role}`,
    });

    return NextResponse.json({ ok: true, role: invite.role });
  } catch (err) {
    console.error("[invite POST]", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
