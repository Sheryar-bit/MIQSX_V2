import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/mongoose";
import Brand from "@/models/Brand";
import { getOrgContext, requireRole } from "@/lib/org-context";
import { z } from "zod";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    await connectDB();
    const ctx = await getOrgContext(session);
    if (!ctx) return NextResponse.json({ brands: [] });

    // Scope to the workspace; include the user's own un-migrated brands as a fallback.
    const brands = await Brand.find({
      $or: [{ orgId: ctx.orgId }, { userId: session.user.id, orgId: { $exists: false } }],
    })
      .sort({ updatedAt: -1 })
      .lean();
    return NextResponse.json({ brands });
  } catch {
    return NextResponse.json({ brands: [] });
  }
}

const createSchema = z.object({
  name: z.string().min(1),
  industry: z.string().optional(),
  description: z.string().optional(),
});

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const guard = await requireRole(session, "editor");
  if (!guard.ok) return guard.response;

  try {
    const body = await req.json();
    const { name, industry, description } = createSchema.parse(body);

    await connectDB();
    const brand = await Brand.create({
      userId: session.user.id,
      orgId: guard.ctx.orgId,
      name,
      industry,
      description,
      status: "drafting",
      chatHistory: [],
      onboardingStep: 0,
      onboardingComplete: false,
    });

    return NextResponse.json({ brand }, { status: 201 });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.errors[0].message }, { status: 400 });
    }
    const msg = err instanceof Error ? err.message : "Internal server error";
    const isMongoMissing = msg.includes("MONGODB_URI");
    return NextResponse.json(
      { error: isMongoMissing ? "MongoDB not connected — add MONGODB_URI to .env.local to save brands" : msg },
      { status: isMongoMissing ? 503 : 500 }
    );
  }
}
