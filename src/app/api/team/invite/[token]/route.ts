import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongoose";
import User, { ITeamMember } from "@/models/User";
import TeamInvite from "@/models/TeamInvite";
import { PLANS, UserPlan } from "@/lib/plans";

// GET /api/team/invite/[token] — fetch invite details for the accept page.
export async function GET(_req: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;

  try {
    await dbConnect();

    const invite = await TeamInvite.findOne({ token }).populate("invitedBy", "name");
    if (!invite) {
      return NextResponse.json({ error: "Invite not found" }, { status: 404 });
    }

    const expired = invite.expiresAt.getTime() < Date.now();
    const inviter = invite.invitedBy as unknown as { name?: string } | null;

    return NextResponse.json({
      email: invite.email,
      role: invite.role,
      status: invite.status,
      inviterName: inviter?.name ?? "A MIQSX user",
      expiresAt: invite.expiresAt,
      valid: invite.status === "pending" && !expired,
    });
  } catch (err) {
    console.error("[invite GET]", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// POST /api/team/invite/[token] — accept the invite (requires being logged in).
export async function POST(_req: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "You must be logged in to accept an invite." }, { status: 401 });
  }

  const { token } = await params;

  try {
    await dbConnect();

    const invite = await TeamInvite.findOne({ token });
    if (!invite) {
      return NextResponse.json({ error: "Invite not found" }, { status: 404 });
    }

    if (invite.status !== "pending") {
      return NextResponse.json({ error: `This invite is already ${invite.status}.` }, { status: 409 });
    }

    if (invite.expiresAt.getTime() < Date.now()) {
      invite.status = "expired";
      await invite.save();
      return NextResponse.json({ error: "This invite has expired." }, { status: 410 });
    }

    const memberId = session.user.id;

    // Can't accept your own invite.
    if (invite.invitedBy.toString() === memberId) {
      return NextResponse.json({ error: "You can't accept your own invite." }, { status: 400 });
    }

    const owner = await User.findById(invite.invitedBy);
    if (!owner) {
      return NextResponse.json({ error: "Workspace owner no longer exists." }, { status: 404 });
    }

    // Already a member?
    const alreadyMember = (owner.teamMembers ?? []).some(
      (m: ITeamMember) => m.userId.toString() === memberId
    );
    if (alreadyMember) {
      invite.status = "accepted";
      invite.acceptedAt = new Date();
      invite.acceptedBy = owner._id;
      await invite.save();
      return NextResponse.json({ ok: true, alreadyMember: true });
    }

    // Re-check the owner's seat limit at accept time (it may have filled up).
    const plan = PLANS[owner.plan as UserPlan] ?? PLANS.free;
    const seatLimit = plan.limits.teamMembers;
    if (seatLimit === 0) {
      return NextResponse.json(
        { error: "The workspace owner's plan no longer supports team members." },
        { status: 403 }
      );
    }
    if (seatLimit !== -1 && (owner.teamMembers?.length ?? 0) >= seatLimit) {
      return NextResponse.json(
        { error: "This workspace is full. Ask the owner to upgrade or remove a member." },
        { status: 403 }
      );
    }

    // Add the member (guarded against a race that would duplicate the entry).
    await User.updateOne(
      { _id: owner._id, "teamMembers.userId": { $ne: memberId } },
      {
        $push: {
          teamMembers: { userId: memberId, role: invite.role, joinedAt: new Date() },
        },
      }
    );

    invite.status = "accepted";
    invite.acceptedAt = new Date();
    invite.acceptedBy = memberId as unknown as typeof invite.acceptedBy;
    await invite.save();

    return NextResponse.json({ ok: true, role: invite.role });
  } catch (err) {
    console.error("[invite POST]", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
