"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

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
  { key: "logo",         label: "Logos",           limitKey: "logoGenerations" },
  { key: "captions",     label: "Captions",         limitKey: "captionGenerations" },
  { key: "taglines",     label: "Taglines",         limitKey: "taglineGenerations" },
  { key: "imagery",      label: "Post Imagery",     limitKey: "imageryGenerations" },
  { key: "audit",        label: "Brand Audits",     limitKey: "auditRuns" },
  { key: "guardian",     label: "Brand Guardian",   limitKey: "guardianRuns" },
  { key: "focus-group",  label: "Focus Group",      limitKey: "focusGroupRuns" },
  { key: "stress-test",  label: "Stress Test",      limitKey: "stressTestRuns" },
  { key: "cultural",     label: "Cultural Check",   limitKey: "culturalChecks" },
];

const FEAT_COLORS = ["var(--terra)", "var(--leaf)", "var(--olive)", "var(--peri)", "var(--sig)", "var(--terra)", "var(--leaf)", "var(--olive)", "var(--peri)"];

const FEAT_LABEL: Record<string, string> = {
  logo: "Logo", captions: "Captions", taglines: "Taglines", imagery: "Imagery",
  audit: "Audit", guardian: "Guardian", "focus-group": "Focus Group",
  "stress-test": "Stress Test", cultural: "Cultural",
};

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [range, setRange] = useState<"7d" | "30d">("30d");
  const lineRef = useRef<SVGPathElement>(null);

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

  // Build 30-day grid (same as original)
  const today = new Date();
  const days: { date: string; label: string; count: number }[] = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().split("T")[0];
    const found = data?.analytics.dailyActivity.find((x) => x._id === key);
    days.push({ date: key, label: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }), count: found?.count ?? 0 });
  }

  const chartDays = range === "7d" ? days.slice(-7) : days;
  const totalAllTime = data?.analytics.totalByFeature.reduce((s, f) => s + f.count, 0) ?? 0;
  const maxDaily = Math.max(...days.map((d) => d.count), 1);

  // SVG line chart path
  const n = chartDays.length;
  const maxCount = Math.max(...chartDays.map((d) => d.count), 1);
  const X = (i: number) => Math.round(i * (720 / Math.max(n - 1, 1)));
  const Y = (v: number) => Math.round(200 - (v / maxCount) * 180);
  const pts = chartDays.map((d, i) => [X(i), Y(d.count)]);
  const linePath = pts.map((p, i) => (i ? "L" : "M") + p[0] + " " + p[1]).join(" ");
  const areaPath = "M0 200 " + pts.map((p) => "L" + p[0] + " " + p[1]).join(" ") + " L720 200 Z";

  // Animate line on change
  useEffect(() => {
    const path = lineRef.current;
    if (!path) return;
    const len = Math.ceil(path.getTotalLength());
    path.style.strokeDasharray = len + "px";
    path.style.strokeDashoffset = len + "px";
    path.style.transition = "";
    const raf = requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        path.style.strokeDashoffset = "0px";
        path.style.transition = "stroke-dashoffset 1.6s cubic-bezier(.3,.7,.3,1) .3s";
      });
    });
    return () => cancelAnimationFrame(raf);
  }, [linePath]);

  // Donut segments from totalByFeature
  const topFeats = data?.analytics.totalByFeature.slice(0, 4) ?? [];
  const featTotal = topFeats.reduce((s, f) => s + f.count, 0) || 1;
  const C = 2 * Math.PI * 58;
  let acc = 0;
  const donutSegs = topFeats.map((f, i) => {
    const pct = f.count / featTotal;
    const len = C * pct;
    const offset = C - acc;
    acc += len;
    return { id: f._id, count: f.count, pct: Math.round(pct * 100), color: FEAT_COLORS[i], dash: `${len} ${C - len}`, offset };
  });

  // Bar chart from totalByFeature
  const barMax = Math.max(...(data?.analytics.totalByFeature.map((f) => f.count) ?? [1]), 1);

  // Trend detection
  const lastWeek = days.slice(-7).reduce((s, d) => s + d.count, 0);
  const prevWeek = days.slice(-14, -7).reduce((s, d) => s + d.count, 0);
  const trending = lastWeek >= prevWeek;

  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 260 }}>
        <div style={{ width: 40, height: 40, borderRadius: "50%", border: "3px solid var(--line)", borderTop: "3px solid var(--peri)", animation: "ds-spin 1s linear infinite" }} />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div style={{ padding: "60px 20px", textAlign: "center", fontFamily: "'Newsreader', serif", color: "var(--red)" }}>
        {error || "Something went wrong"}
      </div>
    );
  }

  const { plan, usageThisMonth } = data;

  const kpis = [
    { label: "Events (7 days)",  value: data.analytics.last7Days,              icon: "↗", iconBg: "color-mix(in oklab, var(--peri) 18%, transparent)", iconFg: "var(--peri)", trend: trending ? "↑ trending" : "↓ slower", trendColor: trending ? "var(--leaf)" : "var(--muted)", delay: "0s" },
    { label: "Events (30 days)", value: data.analytics.last30Days,             icon: "◈", iconBg: "color-mix(in oklab, var(--terra) 16%, transparent)", iconFg: "var(--terra)", trend: data.analytics.last30Days > 10 ? "Active" : "Low", trendColor: data.analytics.last30Days > 10 ? "var(--leaf)" : "var(--muted)", delay: ".06s" },
    { label: "Features used",    value: data.analytics.totalByFeature.length,  icon: "✦", iconBg: "color-mix(in oklab, var(--sig) 14%, transparent)",  iconFg: "var(--sig)", trend: "of 9 total", trendColor: "var(--muted)", delay: ".12s" },
    { label: "All-time total",   value: totalAllTime,                           icon: "∑", iconBg: "color-mix(in oklab, var(--olive) 18%, transparent)", iconFg: "var(--olive)", trend: "all features", trendColor: "var(--muted)", delay: ".18s" },
  ];

  const monthLabels = range === "7d"
    ? chartDays.map((d) => d.label.split(" ")[1]) // day numbers
    : ["W1", "W2", "W3", "W4", "W5", "W6", "W7"].slice(0, Math.ceil(n / 4));

  return (
    <div style={{ padding: "clamp(24px, 3.5vw, 44px) clamp(20px, 4vw, 52px) 90px" }}>
      <div style={{ maxWidth: 1080, margin: "0 auto" }}>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 20, flexWrap: "wrap", marginBottom: 28 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <span style={{ width: 46, height: 46, borderRadius: 13, background: "color-mix(in oklab, var(--peri) 18%, transparent)", color: "var(--peri)", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.7" viewBox="0 0 24 24"><path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/></svg>
            </span>
            <div>
              <h1 style={{ fontFamily: "'General Sans'", fontWeight: 600, fontSize: "clamp(26px, 3vw, 36px)", lineHeight: 1.05, letterSpacing: "-0.03em", margin: 0 }}>
                Brand <span style={{ fontFamily: "'Instrument Serif', serif", fontStyle: "italic", fontWeight: 400, color: "var(--sig)" }}>Analytics</span>
              </h1>
              <p style={{ fontFamily: "'Newsreader', serif", fontSize: 16, color: "var(--muted)", margin: "5px 0 0" }}>
                How your brand is performing — consistency, output, and reach.
              </p>
            </div>
          </div>

          {/* Range + plan upgrade */}
          <div style={{ display: "flex", alignItems: "center", gap: 11, flexWrap: "wrap" }}>
            <div style={{ display: "flex", gap: 6 }}>
              {(["7d", "30d"] as const).map((r) => (
                <button key={r} className={`an-range${range === r ? " sel" : ""}`} onClick={() => setRange(r)}>
                  {r === "7d" ? "7 days" : "30 days"}
                </button>
              ))}
            </div>
            {data.user.plan !== "agency" && (
              <Link href="/billing" style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "9px 16px", borderRadius: 999, background: "var(--sig)", color: "var(--onSig)", fontFamily: "'General Sans'", fontWeight: 600, fontSize: 13, textDecoration: "none" }}>
                ↑ Upgrade
              </Link>
            )}
          </div>
        </div>

        {/* KPI cards */}
        <div className="an-kpis" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 16 }}>
          {kpis.map((k) => (
            <div key={k.label} className="an-card" style={{ border: "1px solid var(--line)", background: "var(--surface)", borderRadius: 16, padding: 18, animationDelay: k.delay }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, letterSpacing: ".12em", textTransform: "uppercase" as const, color: "var(--muted)" }}>{k.label}</span>
                <span style={{ width: 26, height: 26, borderRadius: 8, background: k.iconBg, color: k.iconFg, display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700 }}>{k.icon}</span>
              </div>
              <div style={{ fontFamily: "'General Sans'", fontWeight: 700, fontSize: 30, letterSpacing: "-0.02em", lineHeight: 1 }}>{k.value}</div>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 5, marginTop: 9, fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: k.trendColor }}>{k.trend}</div>
            </div>
          ))}
        </div>

        {/* Line chart: daily activity */}
        <div className="an-card" style={{ border: "1px solid var(--line)", background: "var(--surface)", borderRadius: 18, padding: "clamp(18px, 2.5vw, 26px)", marginBottom: 16, position: "relative", overflow: "hidden", animationDelay: ".24s" }}>
          <svg aria-hidden="true" width="18" height="18" viewBox="0 0 40 40" fill="var(--terra)" style={{ position: "absolute", top: 18, right: 20, animation: "ds-twinkle 3.2s ease-in-out infinite" }}><path d="M20 0c3 13 7 17 20 20-13 3-17 7-20 20-3-13-7-17-20-20C13 17 17 13 20 0Z"/></svg>
          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 20 }}>
            <div>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10.5, letterSpacing: ".14em", textTransform: "uppercase" as const, color: "var(--muted)", marginBottom: 6 }}>Activity over time</div>
              <div style={{ fontFamily: "'General Sans'", fontWeight: 700, fontSize: 22 }}>
                {trending ? <>Trending up <span style={{ color: "var(--leaf)" }}>↗</span></> : <>Steady <span style={{ color: "var(--muted)" }}>→</span></>}
              </div>
            </div>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 7, fontSize: 12, color: "var(--muted)" }}>
              <span style={{ width: 10, height: 3, borderRadius: 2, background: "var(--sig)", display: "inline-block" }} />
              Daily actions
            </div>
          </div>

          <svg viewBox="0 0 720 220" preserveAspectRatio="none" style={{ width: "100%", height: 200, overflow: "visible" }}>
            <line x1="0" y1="20"  x2="720" y2="20"  stroke="var(--line)" strokeWidth="1"/>
            <line x1="0" y1="80"  x2="720" y2="80"  stroke="var(--line)" strokeWidth="1"/>
            <line x1="0" y1="140" x2="720" y2="140" stroke="var(--line)" strokeWidth="1"/>
            <line x1="0" y1="200" x2="720" y2="200" stroke="var(--line)" strokeWidth="1"/>
            <defs>
              <linearGradient id="angrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="var(--sig)"/>
                <stop offset="1" stopColor="var(--sig)" stopOpacity="0"/>
              </linearGradient>
            </defs>
            <path d={areaPath} fill="url(#angrad)" opacity="0.18"/>
            <path ref={lineRef} d={linePath} fill="none" stroke="var(--sig)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
            {pts.map((p, i) => (
              <circle key={i} cx={p[0]} cy={p[1]} r="4" fill="var(--surface)" stroke="var(--sig)" strokeWidth="2.5">
                <title>{chartDays[i]?.label}: {chartDays[i]?.count}</title>
              </circle>
            ))}
          </svg>

          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 12, fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "var(--muted)" }}>
            {(range === "7d"
              ? chartDays.map((d) => d.label.split(" ").join(" "))
              : ["W1", "", "W2", "", "W3", "", "W4", "", "W5", "", "W6"].slice(0, n % 4 === 0 ? n / 4 : 7)
            ).map((l, i) => (
              <span key={i}>{l}</span>
            ))}
          </div>
        </div>

        {/* Lower: bar chart + donut */}
        <div className="an-low" style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 16, marginBottom: 16 }}>

          {/* Bar chart: by feature */}
          <div className="an-card" style={{ border: "1px solid var(--line)", background: "var(--surface)", borderRadius: 18, padding: "clamp(18px, 2.5vw, 24px)", animationDelay: ".3s" }}>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10.5, letterSpacing: ".14em", textTransform: "uppercase" as const, color: "var(--muted)", marginBottom: 20 }}>Assets created by type</div>
            {data.analytics.totalByFeature.length === 0 ? (
              <div style={{ height: 180, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--muted)", fontFamily: "'Newsreader', serif", fontSize: 14 }}>No data yet</div>
            ) : (
              <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 8, height: 180 }}>
                {data.analytics.totalByFeature.slice(0, 9).map((f, i) => (
                  <div key={f._id} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 6, height: "100%", justifyContent: "flex-end" }}>
                    <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "var(--muted)" }}>{f.count}</span>
                    <div
                      className="an-bar"
                      style={{ width: "100%", maxWidth: 34, height: Math.max(6, Math.round((f.count / barMax) * 150)), borderRadius: "7px 7px 0 0", background: FEAT_COLORS[i % FEAT_COLORS.length] }}
                    />
                    <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: "var(--muted)", textAlign: "center" as const, letterSpacing: ".04em" }}>
                      {(FEAT_LABEL[f._id] ?? f._id).slice(0, 6)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Donut: by feature share */}
          <div className="an-card" style={{ border: "1px solid var(--line)", background: "var(--surface)", borderRadius: 18, padding: "clamp(18px, 2.5vw, 24px)", animationDelay: ".36s" }}>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10.5, letterSpacing: ".14em", textTransform: "uppercase" as const, color: "var(--muted)", marginBottom: 20 }}>By feature share</div>
            {donutSegs.length === 0 ? (
              <div style={{ height: 150, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--muted)", fontFamily: "'Newsreader', serif", fontSize: 14 }}>No data yet</div>
            ) : (
              <>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 20 }}>
                  <div style={{ position: "relative", width: 150, height: 150 }}>
                    <svg width="150" height="150" viewBox="0 0 150 150" style={{ transform: "rotate(-90deg)" }}>
                      {donutSegs.map((s) => (
                        <circle key={s.id} cx="75" cy="75" r="58" fill="none" stroke={s.color} strokeWidth="20" strokeDasharray={s.dash} strokeDashoffset={s.offset} />
                      ))}
                    </svg>
                    <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                      <span style={{ fontFamily: "'General Sans'", fontWeight: 700, fontSize: 26 }}>{totalAllTime}</span>
                      <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: "var(--muted)" }}>total</span>
                    </div>
                  </div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {donutSegs.map((s) => (
                    <div key={s.id} style={{ display: "flex", alignItems: "center", gap: 9, fontSize: 13 }}>
                      <span style={{ width: 10, height: 10, borderRadius: 3, background: s.color, flexShrink: 0 }} />
                      <span style={{ flex: 1, fontFamily: "'General Sans'" }}>{FEAT_LABEL[s.id] ?? s.id}</span>
                      <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "var(--muted)" }}>{s.pct}%</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Usage this month vs plan limits */}
        <div className="an-card" style={{ border: "1px solid var(--line)", background: "var(--surface)", borderRadius: 18, padding: "clamp(18px, 2.5vw, 24px)", animationDelay: ".42s" }}>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10.5, letterSpacing: ".14em", textTransform: "uppercase" as const, color: "var(--muted)", marginBottom: 18 }}>Usage this month</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px 40px" }}>
            {USAGE_FEATURES.map((f) => {
              const used = usageThisMonth?.[f.key] ?? 0;
              const limit = plan.limits[f.limitKey] ?? 0;
              const unlimited = limit === -1;
              const pct = unlimited ? 8 : limit === 0 ? 100 : Math.min(100, (used / limit) * 100);
              const atLimit = !unlimited && limit > 0 && used >= limit;
              return (
                <div key={f.key}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 5 }}>
                    <span style={{ fontFamily: "'General Sans'", fontSize: 13.5, color: "var(--muted)" }}>{f.label}</span>
                    <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: atLimit ? "var(--red)" : "var(--ink)", fontWeight: atLimit ? 600 : 400 }}>
                      {used} / {unlimited ? "∞" : limit}
                    </span>
                  </div>
                  <div style={{ height: 6, borderRadius: 999, background: "var(--surf2)", overflow: "hidden" }}>
                    <div
                      style={{ width: unlimited ? "8%" : `${Math.max(2, pct)}%`, height: "100%", background: atLimit ? "var(--red)" : "var(--sig)", borderRadius: 999, transition: "width .8s cubic-bezier(.3,.7,.3,1)" }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
          {data.user.plan !== "agency" && (
            <div style={{ marginTop: 18, paddingTop: 14, borderTop: "1px solid var(--line)", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
              <span style={{ fontFamily: "'Newsreader', serif", fontSize: 14, color: "var(--muted)" }}>
                On <strong style={{ color: "var(--ink)" }}>{plan.name}</strong> plan
              </span>
              <Link href="/billing" style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "8px 16px", borderRadius: 999, background: "var(--sig)", color: "var(--onSig)", fontFamily: "'General Sans'", fontWeight: 600, fontSize: 13, textDecoration: "none" }}>
                Upgrade Plan →
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
