import mongoose, { Schema, Document } from "mongoose";

export type AuthTokenType = "verify-email" | "reset-password";

// Single-use tokens for email verification + password reset. Only the SHA-256
// hash is stored; the raw token lives only in the emailed link.
export interface IAuthToken extends Document {
  identifier: string;        // lowercased email
  tokenHash: string;         // sha256 hex of the raw token
  type: AuthTokenType;
  expiresAt: Date;
}

const AuthTokenSchema = new Schema<IAuthToken>(
  {
    identifier: { type: String, required: true, lowercase: true, trim: true },
    tokenHash: { type: String, required: true, index: true },
    type: { type: String, enum: ["verify-email", "reset-password"], required: true },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true }
);

// Auto-purge expired tokens.
AuthTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
AuthTokenSchema.index({ identifier: 1, type: 1 });

export default mongoose.models.AuthToken ||
  mongoose.model<IAuthToken>("AuthToken", AuthTokenSchema);
