import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/mongoose";
import Review from "@/models/Review";

// Fields the owner may update directly. Anything else (userId, publicToken,
// tokenExpiry, client*, comments) is managed server-side, never mass-assigned.
const UPDATABLE_REVIEW_FIELDS = ["title", "description", "status", "assetType", "assetContent"] as const;

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const userId = session.user.id;

  try {
    await connectDB();
    const review = await Review.findOne({ _id: id, userId }).lean();
    if (!review) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ review });
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const userId = session.user.id;
  const body = await req.json();

  // Adding a comment
  if (body.comment) {
    const userEmail = session.user.email || "team@miqsx.com";
    try {
      await connectDB();
      const review = await Review.findOneAndUpdate(
        { _id: id, userId },
        {
          $push: {
            comments: {
              author: session.user.name || userEmail,
              role: body.role || "Editor",
              content: body.comment,
              createdAt: new Date(),
            },
          },
        },
        { new: true }
      );
      if (!review) return NextResponse.json({ error: "Not found" }, { status: 404 });
      return NextResponse.json({ review });
    } catch {
      return NextResponse.json({ error: "Failed to add comment" }, { status: 500 });
    }
  }

  // Update status or other fields — whitelist only, scoped to the owner.
  const update: Record<string, unknown> = {};
  for (const key of UPDATABLE_REVIEW_FIELDS) {
    if (key in body) update[key] = body[key];
  }
  if (Object.keys(update).length === 0) {
    return NextResponse.json({ error: "No updatable fields provided" }, { status: 400 });
  }

  try {
    await connectDB();
    const review = await Review.findOneAndUpdate({ _id: id, userId }, { $set: update }, { new: true });
    if (!review) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ review });
  } catch {
    return NextResponse.json({ error: "Failed to update" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const userId = session.user.id;

  try {
    await connectDB();
    const res = await Review.deleteOne({ _id: id, userId });
    if (res.deletedCount === 0) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
  }
}
