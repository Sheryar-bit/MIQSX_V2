import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongoose";
import User from "@/models/User";
import Membership from "@/models/Membership";
import TeamInvite from "@/models/TeamInvite";
import { sendTeamInviteEmail } from "@/lib/email";
import { requireRole } from "@/lib/org-context";
import { PLANS, UserPlan } from "@/lib/plans";

// POST /api/team/invite — invite someone to the active workspace (admin+).
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const guard = await requireRole(session, "admin");
  if (!guard.ok) return guard.response;

  try {
    await dbConnect();
    const org = guard.ctx.org;
    const plan = PLANS[org.plan as UserPlan] ?? PLANS.free;

    if (plan.limits.teamMembers === 0) {
      return NextResponse.json(
        { error: "Team members aren't available on your plan. Upgrade to Agency." },
        { status: 403 }
      );
    }

    const { email, role } = (await req.json()) as { email: string; role?: string };
    if (!email) return NextResponse.json({ error: "Email is required" }, { status: 400 });

    const validRoles = ["editor", "viewer", "admin"];
    const inviteRole = validRoles.includes(role ?? "") ? role! : "editor";

    // Seat check — viewers (clients) are free; everyone else counts toward seats.
    if (inviteRole !== "viewer" && plan.limits.teamMembers !== -1) {
      const seatCount = await Membership.countDocuments({ orgId: org._id, role: { $ne: "viewer" } });
      if (seatCount >= plan.limits.teamMembers) {
        return NextResponse.json(
          { error: `Your plan allows up to ${plan.limits.teamMembers} members. Upgrade or free a seat.` },
          { status: 403 }
        );
      }
    }

    const cleanEmail = email.toLowerCase().trim();

    // Already a member?
    const existingUser = await User.findOne({ email: cleanEmail }).select("_id");
    if (existingUser) {
      const alreadyMember = await Membership.findOne({ orgId: org._id, userId: existingUser._id });
      if (alreadyMember) {
        return NextResponse.json({ error: "That person is already a member of this workspace." }, { status: 409 });
      }
    }

    const existing = await TeamInvite.findOne({ orgId: org._id, email: cleanEmail, status: "pending" });
    if (existing) {
      return NextResponse.json({ error: "A pending invite already exists for this email." }, { status: 409 });
    }

    const token = randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000);

    const invite = await TeamInvite.create({
      invitedBy: session.user.id,
      orgId: org._id,
      email: cleanEmail,
      role: inviteRole,
      token,
      status: "pending",
      expiresAt,
    });

    try {
      await sendTeamInviteEmail({
        to: cleanEmail,
        inviterName: session.user.name ?? "A MIQSX user",
        role: inviteRole,
        token,
      });
    } catch (emailErr) {
      console.error("[team invite] Email send failed:", emailErr);
    }

    return NextResponse.json(
      {
        ok: true,
        inviteId: invite._id.toString(),
        email: invite.email,
        role: invite.role,
        expiresAt: invite.expiresAt,
        ...(process.env.NODE_ENV === "development" ? { devToken: token } : {}),
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("[team invite POST]", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// GET /api/team/invite — pending invites for the active workspace.
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const guard = await requireRole(session, "admin");
  if (!guard.ok) return guard.response;

  try {
    await dbConnect();
    const invites = await TeamInvite.find({ orgId: guard.ctx.orgId }).sort({ createdAt: -1 }).limit(50);
    return NextResponse.json({ invites });
  } catch (err) {
    console.error("[team invite GET]", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
