import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/mongoose";
import Brand from "@/models/Brand";
import { getOrgContext, requireRole } from "@/lib/org-context";

// Match a brand within the caller's workspace; include their own un-migrated
// brands (orgId not yet set) as a transition fallback.
function scope(id: string, orgId: string, userId: string) {
  return { _id: id, $or: [{ orgId }, { userId, orgId: { $exists: false } }] };
}

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  await connectDB();
  const ctx = await getOrgContext(session);
  if (!ctx) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const brand = await Brand.findOne(scope(id, ctx.orgId, session.user.id)).lean();
  if (!brand) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ brand });
}

// Fields a member is allowed to update. Anything else (userId, orgId, _id,
// timestamps) is dropped to prevent mass-assignment / ownership reassignment.
const UPDATABLE_FIELDS = [
  "name",
  "industry",
  "description",
  "website",
  "status",
  "dna",
  "chatHistory",
  "onboardingStep",
  "onboardingComplete",
  "generatedNames",
  "moodboardAssets",
  "auditScore",
  "auditViolations",
  "auditLastRun",
] as const;

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Editors and above can modify brands; viewers cannot.
  const guard = await requireRole(session, "editor");
  if (!guard.ok) return guard.response;

  const { id } = await params;
  const body = (await req.json()) as Record<string, unknown>;

  const update: Record<string, unknown> = {};
  for (const key of UPDATABLE_FIELDS) {
    if (key in body) update[key] = body[key];
  }
  if (Object.keys(update).length === 0) {
    return NextResponse.json({ error: "No updatable fields provided" }, { status: 400 });
  }

  await connectDB();
  const brand = await Brand.findOneAndUpdate(
    scope(id, guard.ctx.orgId, session.user.id),
    { $set: update },
    { new: true }
  ).lean();

  if (!brand) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ brand });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Only admins+ can delete a brand.
  const guard = await requireRole(session, "admin");
  if (!guard.ok) return guard.response;

  const { id } = await params;
  await connectDB();
  const res = await Brand.deleteOne(scope(id, guard.ctx.orgId, session.user.id));
  if (res.deletedCount === 0) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ success: true });
}
