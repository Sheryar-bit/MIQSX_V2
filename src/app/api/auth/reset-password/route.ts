import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { connectDB } from "@/lib/mongoose";
import User from "@/models/User";
import { consumeAuthToken } from "@/lib/tokens";

export const runtime = "nodejs";

const schema = z.object({
  token: z.string().min(1),
  password: z.string().min(8),
});

// POST /api/auth/reset-password  { token, password }
export async function POST(req: NextRequest) {
  try {
    const { token, password } = schema.parse(await req.json());

    const email = await consumeAuthToken(token, "reset-password");
    if (!email) {
      return NextResponse.json({ error: "This reset link is invalid or expired." }, { status: 400 });
    }

    await connectDB();
    const hashed = await bcrypt.hash(password, 12);
    const res = await User.updateOne({ email }, { $set: { password: hashed } });
    if (res.matchedCount === 0) {
      return NextResponse.json({ error: "Account no longer exists." }, { status: 404 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.errors[0].message }, { status: 400 });
    }
    console.error("[reset-password]", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
