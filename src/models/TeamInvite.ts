import mongoose, { Schema, Document } from "mongoose";

export type InviteRole = "editor" | "viewer" | "admin";
export type InviteStatus = "pending" | "accepted" | "expired" | "cancelled";

export interface ITeamInvite extends Document {
  invitedBy: mongoose.Types.ObjectId;   // User who sent the invite
  orgId?: mongoose.Types.ObjectId;       // Organization the invite grants access to
  email: string;                         // Invitee's email
  role: InviteRole;
  token: string;                         // 64-char hex, unique
  status: InviteStatus;
  expiresAt: Date;                       // 48h from creation
  acceptedAt?: Date;
  acceptedBy?: mongoose.Types.ObjectId;  // User created on accept
  createdAt: Date;
  updatedAt: Date;
}

const TeamInviteSchema = new Schema<ITeamInvite>(
  {
    invitedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    orgId: { type: Schema.Types.ObjectId, ref: "Organization", index: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    role: { type: String, enum: ["editor", "viewer", "admin"], default: "editor" },
    token: { type: String, required: true, unique: true },
    status: {
      type: String,
      enum: ["pending", "accepted", "expired", "cancelled"],
      default: "pending",
    },
    expiresAt: { type: Date, required: true },
    acceptedAt: { type: Date },
    acceptedBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

TeamInviteSchema.index({ token: 1 });
TeamInviteSchema.index({ email: 1, status: 1 });
TeamInviteSchema.index({ invitedBy: 1 });

export default mongoose.models.TeamInvite ||
  mongoose.model<ITeamInvite>("TeamInvite", TeamInviteSchema);
