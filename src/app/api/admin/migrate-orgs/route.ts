import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongoose";
import User from "@/models/User";
import Organization from "@/models/Organization";
import Membership from "@/models/Membership";
import Brand from "@/models/Brand";
import Review from "@/models/Review";
import AnalyticsEvent from "@/models/Analytics";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// GET /api/admin/migrate-orgs — one-time, idempotent backfill that gives every
// existing user a personal Organization + owner Membership, and stamps orgId
// onto their existing brands/reviews/analytics. Safe to run multiple times.
// Protected by CRON_SECRET (send: Authorization: Bearer <CRON_SECRET>).
export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "CRON_SECRET not configured" }, { status: 500 });
  }
  if (req.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await dbConnect();

    const users = await User.find().select(
      "_id name plan planActivatedAt planExpiresAt stripeCustomerId stripeSubscriptionId"
    );

    const userToOrg = new Map<string, string>();
    let orgsCreated = 0;

    for (const u of users) {
      let org = await Organization.findOne({ ownerId: u._id });
      if (!org) {
        org = await Organization.create({
          name: `${u.name}'s Workspace`,
          ownerId: u._id,
          plan: u.plan ?? "free",
          planActivatedAt: u.planActivatedAt,
          planExpiresAt: u.planExpiresAt,
          stripeCustomerId: u.stripeCustomerId,
          stripeSubscriptionId: u.stripeSubscriptionId,
        });
        orgsCreated++;
      }
      userToOrg.set(u._id.toString(), org._id.toString());

      await Membership.updateOne(
        { userId: u._id, orgId: org._id },
        { $setOnInsert: { role: "owner", joinedAt: new Date() } },
        { upsert: true }
      );
    }

    // Backfill orgId on existing data.
    let brandsStamped = 0;
    const brands = await Brand.find({ orgId: { $exists: false } }).select("_id userId");
    for (const b of brands) {
      const orgId = userToOrg.get(b.userId?.toString());
      if (orgId) {
        await Brand.updateOne({ _id: b._id }, { $set: { orgId } });
        brandsStamped++;
      }
    }

    let reviewsStamped = 0;
    const reviews = await Review.find({ orgId: { $exists: false } }).select("_id userId");
    for (const r of reviews) {
      const orgId = userToOrg.get(String(r.userId));
      if (orgId) {
        await Review.updateOne({ _id: r._id }, { $set: { orgId } });
        reviewsStamped++;
      }
    }

    let eventsStamped = 0;
    const events = await AnalyticsEvent.find({ orgId: { $exists: false } }).select("_id userId");
    for (const e of events) {
      const orgId = userToOrg.get(e.userId?.toString());
      if (orgId) {
        await AnalyticsEvent.updateOne({ _id: e._id }, { $set: { orgId } });
        eventsStamped++;
      }
    }

    return NextResponse.json({
      ok: true,
      users: users.length,
      orgsCreated,
      brandsStamped,
      reviewsStamped,
      eventsStamped,
    });
  } catch (err) {
    console.error("[migrate-orgs]", err);
    return NextResponse.json({ error: "Migration failed" }, { status: 500 });
  }
}
