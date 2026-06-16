import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongoose";
import User from "@/models/User";
import Brand from "@/models/Brand";

// GET /api/brand/public/[slug] — public profile (no auth required)
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    await dbConnect();

    const user = await User.findOne({
      profileSlug: slug,
      profilePublic: true,
    });

    if (!user) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    // Return only active, public-safe brands
    const brands = await Brand.find({
      userId: user._id,
      status: "active",
    }).select("name industry description dna.colors dna.typography dna.voice createdAt");

    return NextResponse.json({
      profile: {
        name: user.name,
        slug: user.profileSlug,
        bio: user.profileBio,
        image: user.image,
        plan: user.plan,
      },
      brands,
    });
  } catch (err) {
    console.error("[public profile GET]", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// PATCH /api/brand/public/[slug] — update own public profile (auth required)
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { slug: slugParam } = await params;
    await dbConnect();

    const user = await User.findById(session.user.id);
    if (!user || user.profileSlug !== slugParam) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json() as {
      profilePublic?: boolean;
      profileBio?: string;
      profileSlug?: string;
    };

    const updates: Partial<typeof body> = {};

    if (typeof body.profilePublic === "boolean") {
      updates.profilePublic = body.profilePublic;
    }

    if (typeof body.profileBio === "string") {
      updates.profileBio = body.profileBio.slice(0, 300);
    }

    if (typeof body.profileSlug === "string") {
      const slug = body.profileSlug
        .toLowerCase()
        .replace(/[^a-z0-9-]/g, "-")
        .replace(/--+/g, "-")
        .replace(/^-|-$/g, "");

      if (slug.length < 3) {
        return NextResponse.json({ error: "Slug must be at least 3 characters" }, { status: 400 });
      }

      const taken = await User.findOne({ profileSlug: slug, _id: { $ne: user._id } });
      if (taken) {
        return NextResponse.json({ error: "This profile URL is already taken" }, { status: 409 });
      }

      updates.profileSlug = slug;
    }

    await User.findByIdAndUpdate(session.user.id, updates);

    return NextResponse.json({ ok: true, ...updates });
  } catch (err) {
    console.error("[public profile PATCH]", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
