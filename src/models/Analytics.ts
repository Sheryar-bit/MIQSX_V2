import mongoose, { Schema, Document } from "mongoose";

export interface IAnalyticsEvent extends Document {
  userId: mongoose.Types.ObjectId;
  orgId?: mongoose.Types.ObjectId;
  brandId?: mongoose.Types.ObjectId;
  event: string;          // e.g. "logo.generated", "caption.generated", "guardian.run"
  feature: string;        // e.g. "logo", "captions", "guardian"
  step: number;           // 1-5
  metadata?: Record<string, unknown>;
  createdAt: Date;
}

const AnalyticsEventSchema = new Schema<IAnalyticsEvent>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    orgId: { type: Schema.Types.ObjectId, ref: "Organization", index: true },
    brandId: { type: Schema.Types.ObjectId, ref: "Brand", index: true },
    event: { type: String, required: true },
    feature: { type: String, required: true },
    step: { type: Number, required: true, min: 1, max: 5 },
    metadata: { type: Schema.Types.Mixed },
  },
  { timestamps: true }
);

// Index for dashboard queries
AnalyticsEventSchema.index({ userId: 1, createdAt: -1 });
AnalyticsEventSchema.index({ userId: 1, feature: 1 });

// TTL — raw events auto-expire after 90 days. Long-term aggregates live in the
// AnalyticsRollup collection (built nightly), so history isn't lost.
AnalyticsEventSchema.index({ createdAt: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 90 });

export default mongoose.models.AnalyticsEvent ||
  mongoose.model<IAnalyticsEvent>("AnalyticsEvent", AnalyticsEventSchema);
