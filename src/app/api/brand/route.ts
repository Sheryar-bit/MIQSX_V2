import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/mongoose";
import Brand from "@/models/Brand";
import { Types } from "mongoose";
import { z } from "zod";

function isValidId(id: string) {
  return Types.ObjectId.isValid(id);
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!isValidId(session.user.id)) return NextResponse.json({ brands: [] });

  try {
    await connectDB();
    const brands = await Brand.find({ userId: session.user.id }).sort({ updatedAt: -1 }).lean();
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
  if (!isValidId(session.user.id)) {
    return NextResponse.json({ error: "Connect MongoDB to create brands" }, { status: 400 });
  }

  try {
    const body = await req.json();
    const { name, industry, description } = createSchema.parse(body);

    await connectDB();
    const brand = await Brand.create({
      userId: session.user.id,
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
