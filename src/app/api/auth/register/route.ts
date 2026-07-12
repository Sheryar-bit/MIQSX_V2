import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/mongoose";
import User from "@/models/User";
import Organization from "@/models/Organization";
import Membership from "@/models/Membership";
import { z } from "zod";
import { createAuthToken } from "@/lib/tokens";
import { sendVerificationEmail } from "@/lib/email";

// A 7-day free trial with NO CARD REQUIRED. When someone signs up from a paid
// pricing CTA (?plan=pro / ?plan=agency), we start the trial in OUR DB — Stripe
// is not touched until they later convert via Checkout.
const TRIAL_DAYS = 7;

const schema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
  plan: z.enum(["free", "pro", "agency"]).optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, password, plan: requestedPlan } = schema.parse(body);

    await connectDB();

    const existing = await User.findOne({ email });
    if (existing) {
      return NextResponse.json({ error: "Email already registered" }, { status: 409 });
    }

    const hashed = await bcrypt.hash(password, 12);
    const user = await User.create({ name, email, password: hashed });

    // Start a DB trial for paid plans; free plans get no trial. No Stripe call
    // and no card here — that only happens when they convert via Checkout.
    const isPaid = requestedPlan === "pro" || requestedPlan === "agency";
    const now = new Date();
    const trialFields = isPaid
      ? {
          plan: requestedPlan,
          subscriptionStatus: "trialing" as const,
          trialEndsAt: new Date(now.getTime() + TRIAL_DAYS * 24 * 60 * 60 * 1000),
          planActivatedAt: now,
        }
      : { plan: "free" as const, subscriptionStatus: "free" as const };

    // Every user gets a personal workspace (org of one). Solo users never see it;
    // it becomes a real team workspace if they upgrade to Agency and invite others.
    const org = await Organization.create({
      name: `${name}'s Workspace`,
      ownerId: user._id,
      ...trialFields,
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
