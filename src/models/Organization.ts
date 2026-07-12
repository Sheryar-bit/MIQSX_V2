import mongoose, { Schema, Document } from "mongoose";

export type UserPlan = "free" | "pro" | "agency";
export type SubscriptionStatus = "free" | "trialing" | "active" | "canceled" | "past_due";

// The tenant boundary. Every account has at least one Organization — a solo user
// is an org of one. Plan + billing live here (per-workspace), not on the user.
export interface IOrganization extends Document {
  name: string;
  ownerId: mongoose.Types.ObjectId;
  plan: UserPlan;
  // Billing lifecycle. The 7-day free trial lives in OUR DB (no card), so the
  // trial state is here — Stripe is only involved once the user converts to
  // paying. `trialEndsAt` is set at signup for a paid plan; `subscriptionStatus`
  // flips 'trialing' → 'active' via the Stripe webhook after checkout.
  subscriptionStatus: SubscriptionStatus;
  trialEndsAt?: Date | null;
  planActivatedAt?: Date;
  planExpiresAt?: Date;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  usageMonth: string;                   // "2026-06" — reset when month changes
  usageCounts: Record<string, number>;  // { logo: 3, captions: 12, ... }
  createdAt: Date;
  updatedAt: Date;
}

const OrganizationSchema = new Schema<IOrganization>(
  {
    name: { type: String, required: true },
    ownerId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    plan: { type: String, enum: ["free", "pro", "agency"], default: "free" },
    subscriptionStatus: {
      type: String,
      enum: ["free", "trialing", "active", "canceled", "past_due"],
      default: "free",
    },
    trialEndsAt: { type: Date, default: null },
    planActivatedAt: { type: Date },
    planExpiresAt: { type: Date },
    stripeCustomerId: { type: String, index: true, sparse: true },
    stripeSubscriptionId: { type: String, index: true, sparse: true },
    usageMonth: { type: String, default: "" },
    usageCounts: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

export default mongoose.models.Organization ||
  mongoose.model<IOrganization>("Organization", OrganizationSchema);
