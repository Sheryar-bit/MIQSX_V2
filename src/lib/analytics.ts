import mongoose from "mongoose";
import dbConnect from "./mongoose";
import AnalyticsEvent from "../models/Analytics";
import Organization from "../models/Organization";
import { currentMonth } from "./plans";

export interface TrackOptions {
  userId: string;
  orgId?: string;
  brandId?: string;
  event: string;       // dot-notation e.g. "logo.generated"
  feature: string;     // short key e.g. "logo"
  step: number;
  metadata?: Record<string, unknown>;
}

// Feature → step mapping (mirrors your feature spec)
export const FEATURE_STEP: Record<string, number> = {
  onboarding: 1,
  audit: 1,
  names: 1,
  moodboard: 1,
  logo: 2,
  taglines: 2,
  captions: 2,
  imagery: 2,
  festive: 2,
  export: 2,
  guardian: 3,
  "focus-group": 3,
  "stress-test": 3,
  cultural: 3,
  review: 4,
  brief: 4,
  analytics: 5,
  billing: 5,
  team: 5,
  profile: 5,
};

/**
 * Track a usage event and increment the user's monthly counter.
 * Fire-and-forget — never throws to the caller.
 */
export async function trackEvent(opts: TrackOptions): Promise<void> {
  try {
    await dbConnect();

    const step = opts.step ?? FEATURE_STEP[opts.feature] ?? 0;

    // Insert analytics event
    await AnalyticsEvent.create({
      userId: new mongoose.Types.ObjectId(opts.userId),
      orgId: opts.orgId ? new mongoose.Types.ObjectId(opts.orgId) : undefined,
      brandId: opts.brandId ? new mongoose.Types.ObjectId(opts.brandId) : undefined,
      event: opts.event,
      feature: opts.feature,
      step,
      metadata: opts.metadata,
    });

    // Increment the monthly usage counter on the ORGANIZATION (quota is per-workspace).
    if (opts.orgId) {
      const month = currentMonth();
      await Organization.updateOne(
        { _id: new mongoose.Types.ObjectId(opts.orgId) },
        [
          {
            $set: {
              // Reset counts if month changed
              usageCounts: {
                $cond: {
                  if: { $eq: ["$usageMonth", month] },
                  then: "$usageCounts",
                  else: {},
                },
              },
              usageMonth: month,
            },
          },
          {
            $set: {
              [`usageCounts.${opts.feature}`]: {
                $add: [
                  { $ifNull: [`$usageCounts.${opts.feature}`, 0] },
                  1,
                ],
              },
            },
          },
        ]
      );
    }
  } catch (err) {
    // Silent — never break the caller
    console.error("[analytics] trackEvent failed:", err);
  }
}

/**
 * Get aggregated analytics for an organization (workspace).
 */
export async function getOrgAnalytics(orgId: string) {
  await dbConnect();

  const oid = new mongoose.Types.ObjectId(orgId);
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const [totalByFeature, last7Days, last30Days, dailyActivity] = await Promise.all([
    // Total usage per feature (all time)
    AnalyticsEvent.aggregate([
      { $match: { orgId: oid } },
      { $group: { _id: "$feature", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]),

    // Events in last 7 days
    AnalyticsEvent.countDocuments({ orgId: oid, createdAt: { $gte: sevenDaysAgo } }),

    // Events in last 30 days
    AnalyticsEvent.countDocuments({ orgId: oid, createdAt: { $gte: thirtyDaysAgo } }),

    // Daily activity (last 30 days) for sparkline
    AnalyticsEvent.aggregate([
      { $match: { orgId: oid, createdAt: { $gte: thirtyDaysAgo } } },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]),
  ]);

  return {
    totalByFeature,
    last7Days,
    last30Days,
    dailyActivity,
  };
}
