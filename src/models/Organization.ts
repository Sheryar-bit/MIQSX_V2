import mongoose, { Schema, Document } from "mongoose";

export type UserPlan = "free" | "pro" | "agency";

// The tenant boundary. Every account has at least one Organization — a solo user
// is an org of one. Plan + billing live here (per-workspace), not on the user.
export interface IOrganization extends Document {
  name: string;
  ownerId: mongoose.Types.ObjectId;
  plan: UserPlan;
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
