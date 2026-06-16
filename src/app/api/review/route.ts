import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/mongoose";
import Review from "@/models/Review";
import { randomBytes } from "crypto";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = (session.user as { id?: string }).id;

  try {
    await connectDB();
    const reviews = await Review.find({ userId }).sort({ updatedAt: -1 }).lean();
    return NextResponse.json({ reviews });
  } catch {
    return NextResponse.json({ reviews: [] });
  }
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = (session.user as { id?: string }).id;
  const body = await req.json();
  const { title, description, assetType, assetContent } = body;

  if (!title || !assetContent) {
    return NextResponse.json({ error: "title and assetContent required" }, { status: 400 });
  }

  try {
    await connectDB();
    const review = await Review.create({
      userId,
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
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  const action = searchParams.get("action");

  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  try {
    await connectDB();

    if (action === "generate-token") {
      const token = randomBytes(32).toString("hex");
      const tokenExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
      const review = await Review.findByIdAndUpdate(
        id,
        { publicToken: token, tokenExpiry, status: "in_review" },
        { new: true }
      );
      if (!review) return NextResponse.json({ error: "Not found" }, { status: 404 });
      return NextResponse.json({ token, review });
    }

    const body = await req.json();
    const review = await Review.findByIdAndUpdate(id, body, { new: true });
    if (!review) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ review });
  } catch {
    return NextResponse.json({ error: "Failed to update" }, { status: 500 });
  }
}
