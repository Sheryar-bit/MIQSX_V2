import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongoose";
import User from "@/models/User";
import { getStripe, planToPriceId } from "@/lib/stripe";
import { UserPlan } from "@/lib/plans";

export const runtime = "nodejs";

// POST /api/billing/checkout — start a Stripe Checkout session for a paid plan.
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { plan } = (await req.json()) as { plan: UserPlan };

    if (plan !== "pro" && plan !== "agency") {
      return NextResponse.json({ error: "Only pro and agency are purchasable." }, { status: 400 });
    }

    const priceId = planToPriceId(plan);
    if (!priceId) {
      return NextResponse.json(
        { error: `No Stripe price configured for the ${plan} plan. Set STRIPE_PRICE_${plan.toUpperCase()}.` },
        { status: 500 }
      );
    }

    await dbConnect();
    const user = await User.findById(session.user.id);
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const stripe = getStripe();

    // Reuse or create the Stripe customer for this user.
    let customerId = user.stripeCustomerId;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.name,
        metadata: { userId: user._id.toString() },
      });
      customerId = customer.id;
      user.stripeCustomerId = customerId;
      await user.save();
    }

    const appUrl = process.env.APP_URL ?? process.env.NEXTAUTH_URL ?? "http://localhost:3000";

    const checkout = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer: customerId,
      line_items: [{ price: priceId, quantity: 1 }],
      // Metadata on BOTH the session and the subscription so the webhook can
      // resolve the user on every lifecycle event.
      metadata: { userId: user._id.toString(), plan },
      subscription_data: { metadata: { userId: user._id.toString(), plan } },
      success_url: `${appUrl}/billing?upgraded=1`,
      cancel_url: `${appUrl}/billing?cancelled=1`,
      allow_promotion_codes: true,
    });

    return NextResponse.json({ url: checkout.url });
  } catch (err) {
    console.error("[checkout]", err);
    return NextResponse.json({ error: "Could not start checkout." }, { status: 500 });
  }
}
