import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { randomBytes } from "crypto";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongoose";
import User from "@/models/User";
import TeamInvite from "@/models/TeamInvite";
import { sendTeamInviteEmail } from "@/lib/email";
import { PLANS, UserPlan } from "@/lib/plans";

// POST /api/team/invite — send a team invite email
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await dbConnect();

    const inviter = await User.findById(session.user.id);
    if (!inviter) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Enforce team member limit
    const plan = PLANS[inviter.plan as UserPlan] ?? PLANS.free;
    if (plan.limits.teamMembers === 0) {
      return NextResponse.json(
        { error: "Team members are not available on your current plan. Upgrade to Agency." },
        { status: 403 }
      );
    }

    const currentMemberCount = inviter.teamMembers?.length ?? 0;
    if (
      plan.limits.teamMembers !== -1 &&
      currentMemberCount >= plan.limits.teamMembers
    ) {
      return NextResponse.json(
        {
          error: `Your plan allows up to ${plan.limits.teamMembers} team members. You've reached the limit.`,
        },
        { status: 403 }
      );
    }

    const { email, role } = await req.json() as { email: string; role?: string };

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const validRoles = ["editor", "viewer", "admin"];
    const inviteRole = validRoles.includes(role ?? "") ? role! : "editor";

    // Check for existing pending invite
    const existingInvite = await TeamInvite.findOne({
      invitedBy: session.user.id,
      email: email.toLowerCase().trim(),
      status: "pending",
    });

    if (existingInvite) {
      return NextResponse.json(
        { error: "A pending invite already exists for this email." },
        { status: 409 }
      );
    }

    const token = randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000); // 48 hours

    const invite = await TeamInvite.create({
      invitedBy: session.user.id,
      email: email.toLowerCase().trim(),
      role: inviteRole,
      token,
      status: "pending",
      expiresAt,
    });

    // Send email (non-blocking on error)
    try {
      await sendTeamInviteEmail({
        to: email,
        inviterName: inviter.name,
        role: inviteRole,
        token,
      });
    } catch (emailErr) {
      console.error("[team invite] Email send failed:", emailErr);
      // Don't fail the whole request — invite is still saved
    }

    return NextResponse.json(
      {
        ok: true,
        inviteId: invite._id.toString(),
        email: invite.email,
        role: invite.role,
        expiresAt: invite.expiresAt,
        // In dev, return the token so testers can construct the accept URL manually
        ...(process.env.NODE_ENV === "development" ? { devToken: token } : {}),
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("[team invite POST]", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// GET /api/team/invite — list pending invites sent by this user
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await dbConnect();

    const invites = await TeamInvite.find({
      invitedBy: session.user.id,
    })
      .sort({ createdAt: -1 })
      .limit(50);

    return NextResponse.json({ invites });
  } catch (err) {
    console.error("[team invite GET]", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
