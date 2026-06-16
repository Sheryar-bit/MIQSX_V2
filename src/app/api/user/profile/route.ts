import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongoose";
import User from "@/models/User";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await dbConnect();
    const user = await User.findById(session.user.id);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      name: user.name,
      email: user.email,
      plan: user.plan,
      profileSlug: user.profileSlug,
      profilePublic: user.profilePublic,
      profileBio: user.profileBio,
      image: user.image,
    });
  } catch (err) {
    console.error("[user profile GET]", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await dbConnect();

    const body = await req.json() as {
      name?: string;
      profileBio?: string;
      profileSlug?: string;
      profilePublic?: boolean;
    };

    const updates: Record<string, unknown> = {};

    if (typeof body.name === "string" && body.name.trim()) {
      updates.name = body.name.trim();
    }

    if (typeof body.profileBio === "string") {
      updates.profileBio = body.profileBio.slice(0, 300);
    }

    if (typeof body.profilePublic === "boolean") {
      updates.profilePublic = body.profilePublic;
    }

    if (typeof body.profileSlug === "string") {
      const slug = body.profileSlug
        .toLowerCase()
        .replace(/[^a-z0-9-]/g, "-")
        .replace(/--+/g, "-")
        .replace(/^-|-$/g, "");

      if (slug.length < 3) {
        return NextResponse.json(
          { error: "Profile URL must be at least 3 characters" },
          { status: 400 }
        );
      }

      const taken = await User.findOne({
        profileSlug: slug,
        _id: { $ne: session.user.id },
      });

      if (taken) {
        return NextResponse.json(
          { error: "This profile URL is already taken" },
          { status: 409 }
        );
      }

      updates.profileSlug = slug;
    }

    const user = await User.findByIdAndUpdate(session.user.id, updates, { new: true });

    return NextResponse.json({
      ok: true,
      name: user?.name,
      profileSlug: user?.profileSlug,
      profilePublic: user?.profilePublic,
      profileBio: user?.profileBio,
    });
  } catch (err) {
    console.error("[user profile PATCH]", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
