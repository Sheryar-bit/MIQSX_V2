import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/mongoose";
import Review from "@/models/Review";
import { getOrgContext, requireRole } from "@/lib/org-context";
import { randomBytes } from "crypto";

function scopeFilter(orgId: string) {
  return { orgId };
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    await connectDB();
    const ctx = await getOrgContext(session);
    if (!ctx) return NextResponse.json({ reviews: [] });
    const reviews = await Review.find(scopeFilter(ctx.orgId))
      .sort({ updatedAt: -1 })
      .lean();
    return NextResponse.json({ reviews });
  } catch {
    return NextResponse.json({ reviews: [] });
  }
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const guard = await requireRole(session, "editor");
  if (!guard.ok) return guard.response;

  const body = await req.json();
  const { title, description, assetType, assetContent } = body;

  if (!title || !assetContent) {
    return NextResponse.json({ error: "title and assetContent required" }, { status: 400 });
  }

  try {
    await connectDB();
    const review = await Review.create({
      userId: session.user.id,
      orgId: guard.ctx.orgId,
      title,
      description,
      assetType: assetType || "design",
      assetContent,
      status: "draft",
    });
    return NextResponse.json({ review });
  } catch {
    return NextResponse.json({ error: "Failed to create review item. Is MongoDB connected?" }, { status: 500 });
  }
}

// PATCH /api/review?action=generate-token&id=...
export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const guard = await requireRole(session, "editor");
  if (!guard.ok) return guard.response;

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  const action = searchParams.get("action");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  const filter = { _id: id, ...scopeFilter(guard.ctx.orgId) };

  try {
    await connectDB();

    if (action === "generate-token") {
      const token = randomBytes(32).toString("hex");
      const tokenExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
      const review = await Review.findOneAndUpdate(
        filter,
        { publicToken: token, tokenExpiry, status: "in_review" },
        { new: true }
      );
      if (!review) return NextResponse.json({ error: "Not found" }, { status: 404 });
      return NextResponse.json({ token, review });
    }

    const body = await req.json();
    const allowed = ["title", "description", "status", "assetType", "assetContent"] as const;
    const update: Record<string, unknown> = {};
    for (const key of allowed) {
      if (key in body) update[key] = body[key];
    }
    if (Object.keys(update).length === 0) {
      return NextResponse.json({ error: "No updatable fields provided" }, { status: 400 });
    }
    const review = await Review.findOneAndUpdate(filter, { $set: update }, { new: true });
    if (!review) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ review });
  } catch {
    return NextResponse.json({ error: "Failed to update" }, { status: 500 });
  }
}
