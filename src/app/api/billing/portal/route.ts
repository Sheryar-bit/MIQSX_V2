import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongoose";
import User from "@/models/User";
import { getStripe } from "@/lib/stripe";

export const runtime = "nodejs";

// POST /api/billing/portal — open the Stripe customer portal (cancel, invoices,
// update card, proration). Requires an existing Stripe customer.
export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await dbConnect();
    const user = await User.findById(session.user.id);
    if (!user?.stripeCustomerId) {
      return NextResponse.json(
        { error: "No billing account yet — subscribe to a paid plan first." },
        { status: 400 }
      );
    }

    const appUrl = process.env.APP_URL ?? process.env.NEXTAUTH_URL ?? "http://localhost:3000";

    const portal = await getStripe().billingPortal.sessions.create({
      customer: user.stripeCustomerId,
      return_url: `${appUrl}/billing`,
    });

    return NextResponse.json({ url: portal.url });
  } catch (err) {
    console.error("[billing portal]", err);
    return NextResponse.json({ error: "Could not open billing portal." }, { status: 500 });
  }
}
