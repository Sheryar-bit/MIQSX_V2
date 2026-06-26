import mongoose, { Schema, Document } from "mongoose";

export type Role = "owner" | "admin" | "editor" | "viewer";

// Join table: which user belongs to which organization, and with what role.
export interface IMembership extends Document {
  userId: mongoose.Types.ObjectId;
  orgId: mongoose.Types.ObjectId;
  role: Role;
  joinedAt: Date;
}

const MembershipSchema = new Schema<IMembership>({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
  orgId: { type: Schema.Types.ObjectId, ref: "Organization", required: true, index: true },
  role: { type: String, enum: ["owner", "admin", "editor", "viewer"], default: "editor" },
  joinedAt: { type: Date, default: Date.now },
});

// A user has exactly one membership per org.
MembershipSchema.index({ userId: 1, orgId: 1 }, { unique: true });

export default mongoose.models.Membership ||
  mongoose.model<IMembership>("Membership", MembershipSchema);
