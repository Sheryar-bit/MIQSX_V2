import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/mongoose";
import Review from "@/models/Review";
import { getOrgContext, requireRole } from "@/lib/org-context";

const UPDATABLE_REVIEW_FIELDS = ["title", "description", "status", "assetType", "assetContent"] as const;

function scope(id: string, orgId: string) {
  return { _id: id, orgId };
}

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  try {
    await connectDB();
    const ctx = await getOrgContext(session);
    if (!ctx) return NextResponse.json({ error: "Not found" }, { status: 404 });
    const review = await Review.findOne(scope(id, ctx.orgId)).lean();
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
  const body = await req.json();

  // Commenting is allowed for any workspace member (incl. internal viewers/clients).
  if (body.comment) {
    const ctx = await getOrgContext(session);
    if (!ctx) return NextResponse.json({ error: "Not found" }, { status: 404 });
    const userEmail = session.user.email || "team@miqsx.com";
    try {
      await connectDB();
      const review = await Review.findOneAndUpdate(
        scope(id, ctx.orgId),
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

  // Editing fields/status requires editor+.
  const guard = await requireRole(session, "editor");
  if (!guard.ok) return guard.response;

  const update: Record<string, unknown> = {};
  for (const key of UPDATABLE_REVIEW_FIELDS) {
    if (key in body) update[key] = body[key];
  }
  if (Object.keys(update).length === 0) {
    return NextResponse.json({ error: "No updatable fields provided" }, { status: 400 });
  }

  try {
    await connectDB();
    const review = await Review.findOneAndUpdate(
      scope(id, guard.ctx.orgId),
      { $set: update },
      { new: true }
    );
    if (!review) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ review });
  } catch {
    return NextResponse.json({ error: "Failed to update" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const guard = await requireRole(session, "admin");
  if (!guard.ok) return guard.response;

  const { id } = await params;
  try {
    await connectDB();
    const res = await Review.deleteOne(scope(id, guard.ctx.orgId));
    if (res.deletedCount === 0) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
  }
}
