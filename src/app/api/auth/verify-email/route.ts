import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import User from "@/models/User";
import { consumeAuthToken } from "@/lib/tokens";

export const runtime = "nodejs";

// POST /api/auth/verify-email  { token }
export async function POST(req: NextRequest) {
  try {
    const { token } = (await req.json()) as { token?: string };
    if (!token) return NextResponse.json({ error: "Token required" }, { status: 400 });

    const email = await consumeAuthToken(token, "verify-email");
    if (!email) {
      return NextResponse.json({ error: "This verification link is invalid or expired." }, { status: 400 });
    }

    await connectDB();
    await User.updateOne({ email }, { $set: { emailVerified: new Date() } });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[verify-email]", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
