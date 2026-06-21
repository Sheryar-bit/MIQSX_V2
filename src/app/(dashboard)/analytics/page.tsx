"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { BarChart2, TrendingUp, Zap, Calendar, Star } from "lucide-react";

interface AnalyticsData {
  user: { name: string; email: string; plan: string };
  plan: {
    name: string;
    price: { pkr: number; usd: number };
    limits: Record<string, number>;
    features: string[];
  };
  usageThisMonth: Record<string, number>;
  analytics: {
    totalByFeature: { _id: string; count: number }[];
    last7Days: number;
    last30Days: number;
    dailyActivity: { _id: string; count: number }[];
  };
}

const USAGE_FEATURES: { key: string; label: string; limitKey: string }[] = [
  { key: "logo", label: "Logos", limitKey: "logoGenerations" },
  { key: "captions", label: "Captions", limitKey: "captionGenerations" },
  { key: "taglines", label: "Taglines", limitKey: "taglineGenerations" },
  { key: "imagery", label: "Post Imagery", limitKey: "imageryGenerations" },
  { key: "audit", label: "Brand Audits", limitKey: "auditRuns" },
  { key: "guardian", label: "Brand Guardian", limitKey: "guardianRuns" },
  { key: "focus-group", label: "Focus Group", limitKey: "focusGroupRuns" },
  { key: "stress-test", label: "Stress Test", limitKey: "stressTestRuns" },
  { key: "cultural", label: "Cultural Check", limitKey: "culturalChecks" },
];

const PLAN_COLORS: Record<string, string> = {
  free: "text-text-muted",
  pro: "text-primary-light",
  agency: "text-accent",
};

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/analytics")
      .then((r) => r.json())
      .then((d) => {
        if (d.error) setError(d.error);
        else setData(d);
      })
      .catch(() => setError("Failed to load analytics"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (error || !data) {
    return <div className="p-8 text-center text-error">{error || "Something went wrong"}</div>;
  }

  const { user, plan, usageThisMonth, analytics } = data;
  const maxDaily = Math.max(...analytics.dailyActivity.map((d) => d.count), 1);

  // Build a continuous 30-day grid
  const today = new Date();
  const days: { date: string; count: number }[] = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().split("T")[0];
    const found = analytics.dailyActivity.find((x) => x._id === key);
    days.push({ date: key, count: found?.count ?? 0 });
  }

  const totalAllTime = analytics.totalByFeature.reduce((s, f) => s + f.count, 0);

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-text flex items-center gap-2">
          <BarChart2 className="w-6 h-6 text-primary-light" />
          Analytics
        </h1>
        <p className="text-text-muted mt-1">Your MIQSX usage at a glance</p>
      </div>

      {/* Plan banner */}
      <div className="rounded-2xl border border-border bg-gradient-to-r from-primary/10 to-accent/10 p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p className="text-text-muted text-sm">Current Plan</p>
          <p className={`text-2xl font-bold ${PLAN_COLORS[user.plan] ?? "text-text"}`}>{plan.name}</p>
          {plan.price.pkr > 0 && (
            <p className="text-text-muted text-sm">PKR {plan.price.pkr.toLocaleString()} / month</p>
          )}
        </div>
        {user.plan !== "agency" && (
          <Link
            href="/billing"
            className="inline-flex items-center gap-2 bg-primary hover:bg-primary-hover text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-colors"
          >
            <Star className="w-4 h-4" />
            Upgrade Plan
          </Link>
        )}
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Events (7 days)", value: analytics.last7Days, icon: <TrendingUp className="w-4 h-4 text-primary-light" /> },
          { label: "Events (30 days)", value: analytics.last30Days, icon: <Calendar className="w-4 h-4 text-accent" /> },
          { label: "Features used", value: analytics.totalByFeature.length, icon: <Zap className="w-4 h-4 text-success" /> },
          { label: "Total all-time", value: totalAllTime, icon: <BarChart2 className="w-4 h-4 text-primary-light" /> },
        ].map((card) => (
          <div key={card.label} className="rounded-2xl border border-border bg-surface p-4 space-y-2">
            <div className="flex items-center gap-2 text-text-muted text-xs">
              {card.icon}
              {card.label}
            </div>
            <p className="text-3xl font-bold text-text">{card.value}</p>
          </div>
        ))}
      </div>

      {/* Usage this month vs plan limits */}
      <div className="rounded-2xl border border-border bg-surface p-5">
        <h2 className="text-text font-semibold mb-4">Usage this month</h2>
        <div className="grid sm:grid-cols-2 gap-x-8 gap-y-4">
          {USAGE_FEATURES.map((f) => {
            const used = usageThisMonth?.[f.key] ?? 0;
            const limit = plan.limits[f.limitKey] ?? 0;
            const unlimited = limit === -1;
            const pct = unlimited ? 0 : Math.min(100, limit === 0 ? 100 : (used / limit) * 100);
            const atLimit = !unlimited && limit > 0 && used >= limit;
            return (
              <div key={f.key}>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-text-muted">{f.label}</span>
                  <span className={atLimit ? "text-error font-medium" : "text-text"}>
                    {used} / {unlimited ? "∞" : limit}
                  </span>
                </div>
                <div className="h-1.5 rounded-full bg-surface-2 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${atLimit ? "bg-error" : "bg-gradient-brand"}`}
                    style={{ width: unlimited ? "8%" : `${Math.max(2, pct)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Daily activity */}
      <div className="rounded-2xl border border-border bg-surface p-5">
        <h2 className="text-text font-semibold mb-4">Daily activity (last 30 days)</h2>
        <div className="flex items-end gap-1 h-24">
          {days.map((day) => (
            <div
              key={day.date}
              className="flex-1 rounded-sm bg-primary/20 hover:bg-primary/60 transition-colors"
              style={{ height: `${Math.max(4, (day.count / maxDaily) * 96)}px` }}
              title={`${day.date}: ${day.count} events`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
