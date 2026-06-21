import mongoose, { Schema, Document } from "mongoose";

// Daily per-user-per-feature aggregate. Built nightly from raw AnalyticsEvent
// rows so dashboards/history don't depend on the (TTL-expiring) raw events.
export interface IAnalyticsRollup extends Document {
  userId: mongoose.Types.ObjectId;
  date: string;     // "YYYY-MM-DD" (UTC)
  feature: string;
  count: number;
}

const AnalyticsRollupSchema = new Schema<IAnalyticsRollup>({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  date: { type: String, required: true },
  feature: { type: String, required: true },
  count: { type: Number, required: true, default: 0 },
});

// One row per (user, day, feature) — used for idempotent upserts.
AnalyticsRollupSchema.index({ userId: 1, date: 1, feature: 1 }, { unique: true });
AnalyticsRollupSchema.index({ userId: 1, date: -1 });

export default mongoose.models.AnalyticsRollup ||
  mongoose.model<IAnalyticsRollup>("AnalyticsRollup", AnalyticsRollupSchema);
