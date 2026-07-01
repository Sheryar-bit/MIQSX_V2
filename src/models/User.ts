import mongoose, { Schema, Document } from "mongoose";

export type UserPlan = "free" | "pro" | "agency";
export type TeamRole = "owner" | "admin" | "editor" | "viewer";

export interface ITeamMember {
  userId: mongoose.Types.ObjectId;
  role: TeamRole;
  joinedAt: Date;
}

export interface IUser extends Document {
  name: string;
  email: string;
  password?: string;
  plan: UserPlan;
  planActivatedAt?: Date;
  planExpiresAt?: Date;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  emailVerified?: Date;
  image?: string;

  // Team (owner perspective — members on this account)
  teamMembers: ITeamMember[];

  // Public brand profile
  profileSlug?: string;       // e.g. "acme-studio" → /brand/acme-studio
  profilePublic: boolean;
  profileBio?: string;

  // Usage counters (reset monthly)
  usageMonth: string;         // "2026-06" — reset when month changes
  usageCounts: Record<string, number>; // { logo: 3, captions: 12, ... }

  createdAt: Date;
  updatedAt: Date;
}

const TeamMemberSchema = new Schema<ITeamMember>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    role: { type: String, enum: ["owner", "admin", "editor", "viewer"], default: "editor" },
    joinedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, select: false },
    plan: { type: String, enum: ["free", "pro", "agency"], default: "free" },
    planActivatedAt: { type: Date },
    planExpiresAt: { type: Date },
    stripeCustomerId: { type: String, index: true, sparse: true },
    stripeSubscriptionId: { type: String, index: true, sparse: true },
    emailVerified: { type: Date },
    image: { type: String },

    teamMembers: { type: [TeamMemberSchema], default: [] },

    profileSlug: { type: String, unique: true, sparse: true, lowercase: true, trim: true },
    profilePublic: { type: Boolean, default: false },
    profileBio: { type: String, maxlength: 300 },

    usageMonth: { type: String, default: "" },
    usageCounts: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

// Note: `email` and `profileSlug` already get indexes via `unique: true` on the
// field — don't re-declare them here (Mongoose warns about duplicate indexes).

export default mongoose.models.User || mongoose.model<IUser>("User", UserSchema);
