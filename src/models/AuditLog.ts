import mongoose, { Schema, Document } from "mongoose";

export type AuditAction =
  | "member.invited"
  | "member.joined"
  | "member.removed"
  | "member.role_changed"
  | "member.left"
  | "ownership.transferred"
  | "workspace.deleted";

// Immutable record of who did what in a workspace. Auto-expires after 1 year.
export interface IAuditLog extends Document {
  orgId: mongoose.Types.ObjectId;
  actorId: mongoose.Types.ObjectId;
  actorName: string;
  action: AuditAction;
  detail?: string; // human-readable, e.g. "invited teammate@x.com as editor"
  createdAt: Date;
}

const AuditLogSchema = new Schema<IAuditLog>({
  orgId: { type: Schema.Types.ObjectId, ref: "Organization", required: true, index: true },
  actorId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  actorName: { type: String, required: true },
  action: { type: String, required: true },
  detail: { type: String },
  createdAt: { type: Date, default: Date.now },
});

AuditLogSchema.index({ orgId: 1, createdAt: -1 });
AuditLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 365 });

export default mongoose.models.AuditLog ||
  mongoose.model<IAuditLog>("AuditLog", AuditLogSchema);
