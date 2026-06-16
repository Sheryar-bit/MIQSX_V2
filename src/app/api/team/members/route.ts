import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongoose";
import User, { ITeamMember } from "@/models/User";

// GET /api/team/members — list all team members on your workspace
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await dbConnect();

    const user = await User.findById(session.user.id).populate(
      "teamMembers.userId",
      "name email image plan"
    );

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const members = (user.teamMembers ?? []).map((m: ITeamMember) => {
      const member = m.userId as unknown as { _id: string; name: string; email: string; image?: string; plan: string };
      return {
        userId: member._id?.toString(),
        name: member.name,
        email: member.email,
        image: member.image,
        role: m.role,
        joinedAt: m.joinedAt,
      };
    });

    return NextResponse.json({
      members,
      count: members.length,
    });
  } catch (err) {
    console.error("[team members GET]", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// DELETE /api/team/members — remove a member
export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { userId } = await req.json() as { userId: string };

    if (!userId) {
      return NextResponse.json({ error: "userId is required" }, { status: 400 });
    }

    await dbConnect();

    await User.updateOne(
      { _id: session.user.id },
      { $pull: { teamMembers: { userId } } }
    );

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[team members DELETE]", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// PATCH /api/team/members — update a member's role
export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { userId, role } = await req.json() as { userId: string; role: string };

    const validRoles = ["admin", "editor", "viewer"];
    if (!userId || !validRoles.includes(role)) {
      return NextResponse.json({ error: "userId and valid role are required" }, { status: 400 });
    }

    await dbConnect();

    await User.updateOne(
      { _id: session.user.id, "teamMembers.userId": userId },
      { $set: { "teamMembers.$.role": role } }
    );

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[team members PATCH]", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
