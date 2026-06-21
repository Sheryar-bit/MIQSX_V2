import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import dbConnect from "@/lib/mongoose";
import AnalyticsEvent from "@/models/Analytics";
import AnalyticsRollup from "@/models/AnalyticsRollup";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// GET /api/cron/rollup — nightly aggregation of raw events into daily rollups.
// Secured by CRON_SECRET (Vercel Cron sends it as a Bearer token automatically).
export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const auth = req.headers.get("authorization");
    if (auth !== `Bearer ${secret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  try {
    await dbConnect();

    // Recompute the last 2 days (covers late-arriving events / missed runs).
    const since = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000);

    const grouped = await AnalyticsEvent.aggregate([
      { $match: { createdAt: { $gte: since } } },
      {
        $group: {
          _id: {
            userId: "$userId",
            feature: "$feature",
            date: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          },
          count: { $sum: 1 },
        },
      },
    ]);

    if (grouped.length === 0) {
      return NextResponse.json({ ok: true, rolledUp: 0 });
    }

    // Idempotent: $set the recomputed count for each (user, day, feature).
    const ops = grouped.map((g) => ({
      updateOne: {
        filter: {
          userId: new mongoose.Types.ObjectId(g._id.userId),
          date: g._id.date,
          feature: g._id.feature,
        },
        update: { $set: { count: g.count } },
        upsert: true,
      },
    }));

    await AnalyticsRollup.bulkWrite(ops, { ordered: false });

    return NextResponse.json({ ok: true, rolledUp: ops.length });
  } catch (err) {
    console.error("[cron rollup]", err);
    return NextResponse.json({ error: "Rollup failed" }, { status: 500 });
  }
}
