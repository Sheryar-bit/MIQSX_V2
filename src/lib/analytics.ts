import mongoose from "mongoose";
import dbConnect from "./mongoose";
import AnalyticsEvent from "../models/Analytics";
import User from "../models/User";
import { currentMonth } from "./plans";

export interface TrackOptions {
  userId: string;
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
      brandId: opts.brandId ? new mongoose.Types.ObjectId(opts.brandId) : undefined,
      event: opts.event,
      feature: opts.feature,
      step,
      metadata: opts.metadata,
    });

    // Increment monthly usage counter on User
    const month = currentMonth();
    await User.updateOne(
      { _id: new mongoose.Types.ObjectId(opts.userId) },
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
  } catch (err) {
    // Silent — never break the caller
    console.error("[analytics] trackEvent failed:", err);
  }
}

/**
 * Get aggregated analytics for a user.
 */
export async function getUserAnalytics(userId: string) {
  await dbConnect();

  const uid = new mongoose.Types.ObjectId(userId);
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const [totalByFeature, last7Days, last30Days, dailyActivity] = await Promise.all([
    // Total usage per feature (all time)
    AnalyticsEvent.aggregate([
      { $match: { userId: uid } },
      { $group: { _id: "$feature", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]),

    // Events in last 7 days
    AnalyticsEvent.countDocuments({ userId: uid, createdAt: { $gte: sevenDaysAgo } }),

    // Events in last 30 days
    AnalyticsEvent.countDocuments({ userId: uid, createdAt: { $gte: thirtyDaysAgo } }),

    // Daily activity (last 30 days) for sparkline
    AnalyticsEvent.aggregate([
      { $match: { userId: uid, createdAt: { $gte: thirtyDaysAgo } } },
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
