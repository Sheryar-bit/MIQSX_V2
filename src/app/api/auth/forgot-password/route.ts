import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import User from "@/models/User";
import { createAuthToken } from "@/lib/tokens";
import { sendPasswordResetEmail } from "@/lib/email";

export const runtime = "nodejs";

// POST /api/auth/forgot-password  { email }
// Always returns the same response to avoid leaking which emails are registered.
export async function POST(req: NextRequest) {
  try {
    const { email } = (await req.json()) as { email?: string };
    if (!email) return NextResponse.json({ error: "Email required" }, { status: 400 });

    await connectDB();
    const user = await User.findOne({ email: email.toLowerCase().trim() });

    if (user) {
      try {
        const token = await createAuthToken(user.email, "reset-password", 60 * 60 * 1000); // 1h
        await sendPasswordResetEmail({ to: user.email, name: user.name, token });
      } catch (mailErr) {
        console.error("[forgot-password] email failed:", mailErr);
      }
    }

    // Generic response regardless of whether the user exists.
    return NextResponse.json({ ok: true, message: "If that email is registered, a reset link is on its way." });
  } catch (err) {
    console.error("[forgot-password]", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
