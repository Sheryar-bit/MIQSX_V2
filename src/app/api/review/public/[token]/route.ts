import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import Review from "@/models/Review";

// Public: no auth required — clients use a tokenized link
export async function GET(_req: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;

  try {
    await connectDB();
    const review = await Review.findOne({
      publicToken: token,
      tokenExpiry: { $gt: new Date() },
    })
      .select("-userId -publicToken") // don't expose internal IDs
      .lean();

    if (!review) {
      return NextResponse.json({ error: "Invalid or expired approval link" }, { status: 404 });
    }

    return NextResponse.json({ review });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const { decision, clientName, clientComment } = await req.json();

  if (!decision || !["approved", "needs_changes"].includes(decision)) {
    return NextResponse.json({ error: "decision must be 'approved' or 'needs_changes'" }, { status: 400 });
  }

  try {
    await connectDB();
    const review = await Review.findOne({
      publicToken: token,
      tokenExpiry: { $gt: new Date() },
    });

    if (!review) {
      return NextResponse.json({ error: "Invalid or expired approval link" }, { status: 404 });
    }

    review.status = decision as "approved" | "needs_changes";
    review.clientName = clientName || review.clientName;
    review.clientComment = clientComment;
    review.clientDecidedAt = new Date();

    if (clientComment) {
      review.comments.push({
        author: clientName || "Client",
        role: "Client",
        content: clientComment,
        createdAt: new Date(),
      });
    }

    await review.save();
    return NextResponse.json({ success: true, status: review.status });
  } catch {
    return NextResponse.json({ error: "Failed to record decision" }, { status: 500 });
  }
}
