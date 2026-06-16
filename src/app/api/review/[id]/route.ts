import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/mongoose";
import Review from "@/models/Review";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  try {
    await connectDB();
    const review = await Review.findById(id).lean();
    if (!review) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ review });
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();

  // Adding a comment
  if (body.comment) {
    const userEmail = session.user.email || "team@miqsx.com";
    try {
      await connectDB();
      const review = await Review.findByIdAndUpdate(
        id,
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
      return NextResponse.json({ review });
    } catch {
      return NextResponse.json({ error: "Failed to add comment" }, { status: 500 });
    }
  }

  // Update status or other fields
  try {
    await connectDB();
    const review = await Review.findByIdAndUpdate(id, body, { new: true });
    if (!review) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ review });
  } catch {
    return NextResponse.json({ error: "Failed to update" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  try {
    await connectDB();
    await Review.findByIdAndDelete(id);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
  }
}
