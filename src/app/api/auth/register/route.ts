import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/mongoose";
import User from "@/models/User";
import Organization from "@/models/Organization";
import Membership from "@/models/Membership";
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

    // Every user gets a personal workspace (org of one). Solo users never see it;
    // it becomes a real team workspace if they upgrade to Agency and invite others.
    const org = await Organization.create({
      name: `${name}'s Workspace`,
      ownerId: user._id,
      plan: "free",
    });
    await Membership.create({ userId: user._id, orgId: org._id, role: "owner" });

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
