import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/mongoose";
import Brand from "@/models/Brand";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  await connectDB();
  const brand = await Brand.findOne({ _id: id, userId: session.user.id }).lean();
  if (!brand) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json({ brand });
}

// Fields a client is allowed to update. Anything else (userId, _id, timestamps)
// is dropped to prevent mass-assignment / ownership reassignment.
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

  const { id } = await params;
  const body = (await req.json()) as Record<string, unknown>;

  // Whitelist only — never trust the raw body.
  const update: Record<string, unknown> = {};
  for (const key of UPDATABLE_FIELDS) {
    if (key in body) update[key] = body[key];
  }

  if (Object.keys(update).length === 0) {
    return NextResponse.json({ error: "No updatable fields provided" }, { status: 400 });
  }

  await connectDB();
  const brand = await Brand.findOneAndUpdate(
    { _id: id, userId: session.user.id },
    { $set: update },
    { new: true }
  ).lean();

  if (!brand) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ brand });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  await connectDB();
  await Brand.deleteOne({ _id: id, userId: session.user.id });
  return NextResponse.json({ success: true });
}
