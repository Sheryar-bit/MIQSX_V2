import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/mongoose";
import User from "@/models/User";
import { z } from "zod";
import { createAuthToken } from "@/lib/tokens";
import { sendVerificationEmail } from "@/lib/email";

const schema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, password } = schema.parse(body);

    await connectDB();

    const existing = await User.findOne({ email });
    if (existing) {
      return NextResponse.json({ error: "Email already registered" }, { status: 409 });
    }

    const hashed = await bcrypt.hash(password, 12);
    const user = await User.create({ name, email, password: hashed });

    // Send a verification email (non-blocking — registration succeeds either way).
    try {
      const token = await createAuthToken(email, "verify-email", 24 * 60 * 60 * 1000);
      await sendVerificationEmail({ to: email, name, token });
    } catch (mailErr) {
      console.error("[register] verification email failed:", mailErr);
    }

    return NextResponse.json({ id: user._id, email: user.email, name: user.name }, { status: 201 });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.errors[0].message }, { status: 400 });
    }
    console.error("[REGISTER]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
