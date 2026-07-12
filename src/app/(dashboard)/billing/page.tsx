"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

interface PlanCard {
  id: "free" | "pro" | "agency";
  name: string;
  price: { pkr: number; usd: number };
  features: string[];
  isCurrent: boolean;
}

interface BillingData {
  current: { plan: string; activatedAt?: string; expiresAt?: string };
  plans: PlanCard[];
}

interface UsageItem {
  label: string;
  usedKey: string;
  limitKey: string;
  color: string;
}

const USAGE_ROWS: UsageItem[] = [
  { label: "Assets generated", usedKey: "logo",    limitKey: "logoGenerations",    color: "var(--terra)" },
  { label: "Brand audits",     usedKey: "audit",   limitKey: "auditRuns",           color: "var(--leaf)" },
  { label: "Guardian checks",  usedKey: "guardian",limitKey: "guardianRuns",        color: "var(--olive)" },
];

const PLAN_STYLE: Record<string, {
  border: string; check: string; featured: boolean;
  btnBg: string; btnFg: string; btnBorder: string;
}> = {
  free:   { border: "1px solid var(--line)",  check: "var(--leaf)", featured: false, btnBg: "var(--surf2)",  btnFg: "var(--muted)", btnBorder: "1px solid var(--line)" },
  pro:    { border: "2px solid var(--sig)",   check: "var(--sig)",  featured: true,  btnBg: "var(--sig)",    btnFg: "var(--onSig)", btnBorder: "none" },
  agency: { border: "1px solid var(--line)",  check: "var(--terra)",featured: false, btnBg: "transparent",  btnFg: "var(--ink)",   btnBorder: "1px solid var(--ink)" },
};

export default function BillingPage() {
  const [data, setData] = useState<BillingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState("");
  const [notice, setNotice] = useState("");
  const [cycle, setCycle] = useState<"monthly" | "yearly">("monthly");
  const [usageThis, setUsageThis] = useState<Record<string, number> | null>(null);
  const [planLimits, setPlanLimits] = useState<Record<string, number> | null>(null);
  const { update } = useSession();

  function load() {
    fetch("/api/billing")
      .then((r) => r.json())
      .then((d) => (d.error ? setError(d.error) : setData(d)))
      .catch(() => setError("Failed to load billing"))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
    // fetch usage data for the meter bars
    fetch("/api/analytics")
      .then((r) => r.json())
      .then((d) => {
        if (!d.error) {
          setUsageThis(d.usageThisMonth ?? {});
          setPlanLimits(d.plan?.limits ?? {});
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    if (p.get("upgraded")) {
      setNotice("🎉 Upgrade complete! Your new plan is active.");
      update?.();
      load();
    } else if (p.get("cancelled")) {
      setNotice("Checkout cancelled — no changes made.");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function choosePlan(plan: string) {
    setBusy(plan);
    setNotice("");
    try {
      if (plan === "pro" || plan === "agency") {
        const res = await fetch("/api/billing/checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ plan }),
        });
        const d = await res.json();
        if (res.ok && d.url) { window.location.href = d.url; return; }
        setNotice(d.error || "Could not start checkout.");
      } else {
        setNotice("To move to Free, cancel your subscription from the billing portal.");
      }
    } catch {
      setNotice("Network error");
    } finally {
      setBusy("");
    }
  }

  async function openPortal() {
    setBusy("portal");
    try {
      const res = await fetch("/api/billing/portal", { method: "POST" });
      const d = await res.json();
      if (res.ok && d.url) window.location.href = d.url;
      else setNotice(d.error || "Could not open billing portal.");
    } catch {
      setNotice("Network error");
    } finally {
      setBusy("");
    }
  }

  const onPaidPlan = data?.current.plan === "pro" || data?.current.plan === "agency";
  const currentPlan = data?.plans.find((p) => p.isCurrent);

  const displayPrice = (pkr: number) => {
    if (pkr === 0) return "Rs 0";
    const p = cycle === "yearly" ? Math.round(pkr * 0.8) : pkr;
    return "Rs " + p.toLocaleString();
  };

  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 260 }}>
        <div style={{ width: 40, height: 40, borderRadius: "50%", border: "3px solid var(--line)", borderTop: "3px solid var(--sig)", animation: "ds-spin 1s linear infinite" }} />
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

  return (
    <div style={{ padding: "clamp(24px, 3.5vw, 44px) clamp(20px, 4vw, 52px) 90px" }}>
      <div style={{ maxWidth: 1040, margin: "0 auto" }}>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 20, flexWrap: "wrap", marginBottom: 28 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <span style={{ width: 46, height: 46, borderRadius: 13, background: "color-mix(in oklab, var(--sig) 14%, transparent)", color: "var(--sig)", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.7" viewBox="0 0 24 24"><rect x="2" y="5" width="20" height="14" rx="2.5"/><path d="M2 10h20"/></svg>
            </span>
            <div>
              <h1 style={{ fontFamily: "'General Sans'", fontWeight: 600, fontSize: "clamp(26px, 3vw, 36px)", lineHeight: 1.05, letterSpacing: "-0.03em", margin: 0 }}>
                Plans &amp; <span style={{ fontFamily: "'Instrument Serif', serif", fontStyle: "italic", fontWeight: 400, color: "var(--sig)" }}>Billing</span>
              </h1>
              <p style={{ fontFamily: "'Newsreader', serif", fontSize: 16, color: "var(--muted)", margin: "5px 0 0" }}>
                Manage your subscription, usage, and invoices.
              </p>
            </div>
          </div>
        </div>

        {/* Notice banner */}
        {notice && (
          <div style={{ borderRadius: 14, border: "1px solid var(--line)", background: "var(--surf2)", padding: "12px 16px", fontFamily: "'General Sans'", fontSize: 14, color: "var(--ink)", marginBottom: 20 }}>
            {notice}
          </div>
        )}

        {/* Top 2-col: current plan + usage */}
        <div className="bl-top" style={{ display: "grid", gridTemplateColumns: "1fr 1.3fr", gap: 16, marginBottom: 26 }}>

          {/* Current plan card */}
          <div className="bl-card" style={{ border: "1px solid var(--line)", background: "var(--sig)", color: "var(--onSig)", borderRadius: 18, padding: 22, position: "relative", overflow: "hidden" }}>
            <svg width="130" height="130" viewBox="0 0 40 40" fill="rgba(255,255,255,0.07)" style={{ position: "absolute", bottom: -34, right: -30, animation: "ds-spin 26s linear infinite" }} aria-hidden="true"><path d="M20 0c3 13 7 17 20 20-13 3-17 7-20 20-3-13-7-17-20-20C13 17 17 13 20 0Z"/></svg>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10.5, letterSpacing: ".14em", textTransform: "uppercase" as const, opacity: 0.8, marginBottom: 12 }}>Current plan</div>
            <div style={{ fontFamily: "'General Sans'", fontWeight: 700, fontSize: 30, letterSpacing: "-0.02em" }}>
              {currentPlan?.name ?? data.current.plan}
            </div>
            <div style={{ fontFamily: "'Newsreader', serif", fontStyle: "italic", fontSize: 15, opacity: 0.85, margin: "6px 0 18px" }}>
              {currentPlan && currentPlan.price.pkr > 0
                ? `Rs ${currentPlan.price.pkr.toLocaleString()} / month`
                : "Rs 0 / month · renews never"}
            </div>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, opacity: 0.8 }}>
              {data.current.activatedAt
                ? `Active since: ${new Date(data.current.activatedAt).toLocaleDateString()}`
                : "Next invoice: —"}
            </div>
            {onPaidPlan && (
              <button
                onClick={openPortal}
                disabled={busy === "portal"}
                style={{ marginTop: 16, display: "inline-flex", alignItems: "center", gap: 7, padding: "8px 14px", borderRadius: 999, border: "1px solid rgba(255,255,255,.35)", background: "rgba(255,255,255,.15)", color: "var(--onSig)", fontFamily: "'General Sans'", fontWeight: 600, fontSize: 13, cursor: "pointer", opacity: busy === "portal" ? 0.5 : 1 }}
              >
                {busy === "portal" ? "Opening…" : "Manage subscription →"}
              </button>
            )}
          </div>

          {/* Usage meters */}
          <div className="bl-card" style={{ border: "1px solid var(--line)", background: "var(--surface)", borderRadius: 18, padding: 22 }}>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10.5, letterSpacing: ".14em", textTransform: "uppercase" as const, color: "var(--muted)", marginBottom: 16 }}>This month&apos;s usage</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 15 }}>
              {USAGE_ROWS.map((row) => {
                const used = usageThis?.[row.usedKey] ?? 0;
                const cap = planLimits?.[row.limitKey] ?? 0;
                const unlimited = cap === -1;
                const pct = unlimited ? 8 : cap === 0 ? 100 : Math.min(100, (used / cap) * 100);
                return (
                  <div key={row.usedKey}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 7 }}>
                      <span style={{ fontFamily: "'General Sans'", fontSize: 14, fontWeight: 600 }}>{row.label}</span>
                      <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: "var(--muted)" }}>
                        {usageThis === null ? "—" : `${used} / ${unlimited ? "∞" : cap}`}
                      </span>
                    </div>
                    <div style={{ height: 8, borderRadius: 999, background: "var(--surf2)", overflow: "hidden" }}>
                      <div style={{ width: `${Math.max(pct, 2)}%`, height: "100%", background: row.color, borderRadius: 999, transition: "width .8s cubic-bezier(.3,.7,.3,1)" }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Monthly / Yearly toggle */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14, flexWrap: "wrap", gap: 12 }}>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, letterSpacing: ".16em", textTransform: "uppercase" as const, color: "var(--muted)" }}>Choose a plan</div>
          <div style={{ display: "inline-flex", padding: 4, borderRadius: 999, background: "var(--surf2)", border: "1px solid var(--line)" }}>
            <button className={`bl-toggle${cycle === "monthly" ? " sel" : ""}`} onClick={() => setCycle("monthly")}>Monthly</button>
            <button className={`bl-toggle${cycle === "yearly" ? " sel" : ""}`} onClick={() => setCycle("yearly")}>
              Yearly <span style={{ color: "var(--terra)" }}>–20%</span>
            </button>
          </div>
        </div>

        {/* Plan cards */}
        <div className="bl-plans" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
          {data.plans.map((p, idx) => {
            const s = PLAN_STYLE[p.id] ?? PLAN_STYLE.free;
            return (
              <div
                key={p.id}
                className="bl-plan bl-card"
                style={{ border: s.border, background: "var(--surface)", color: "var(--ink)", borderRadius: 18, padding: 24, position: "relative", animationDelay: `${idx * 0.06}s` }}
              >
                {s.featured && (
                  <span style={{ position: "absolute", top: 16, right: 16, fontFamily: "'JetBrains Mono', monospace", fontSize: 9, letterSpacing: ".1em", textTransform: "uppercase" as const, background: "var(--terra)", color: "#fff", padding: "4px 9px", borderRadius: 999 }}>Popular</span>
                )}
                <div style={{ fontFamily: "'General Sans'", fontWeight: 700, fontSize: 19 }}>{p.name}</div>
                <div style={{ display: "flex", alignItems: "baseline", gap: 4, margin: "12px 0 4px" }}>
                  <span style={{ fontFamily: "'General Sans'", fontWeight: 700, fontSize: 34, letterSpacing: "-0.02em" }}>{displayPrice(p.price.pkr)}</span>
                  <span style={{ fontSize: 13, color: "var(--muted)" }}>{cycle === "yearly" ? "/mo · yearly" : "/month"}</span>
                </div>
                {p.price.usd > 0 && (
                  <div style={{ fontFamily: "'Newsreader', serif", fontStyle: "italic", fontSize: 14, color: "var(--muted)", marginBottom: 18 }}>${p.price.usd} USD</div>
                )}
                <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 22 }}>
                  {p.features.map((f) => (
                    <div key={f} style={{ display: "flex", gap: 9, alignItems: "flex-start", fontSize: 13.5 }}>
                      <span style={{ color: s.check, flexShrink: 0 }}>✓</span>
                      {f}
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => !p.isCurrent && choosePlan(p.id)}
                  disabled={p.isCurrent || busy === p.id}
                  style={{ width: "100%", padding: "12px", borderRadius: 11, border: s.btnBorder, background: p.isCurrent ? "var(--surf2)" : s.btnBg, color: p.isCurrent ? "var(--muted)" : s.btnFg, fontFamily: "'General Sans'", fontWeight: 600, fontSize: 14, cursor: p.isCurrent || busy === p.id ? "default" : "pointer", opacity: busy === p.id ? 0.5 : 1 }}
                >
                  {p.isCurrent ? "Current plan" : busy === p.id ? "…" : `Switch to ${p.name}`}
                </button>
              </div>
            );
          })}
        </div>

        {/* Invoice / portal section */}
        <div className="bl-card" style={{ border: "1px solid var(--line)", background: "var(--surface)", borderRadius: 18, padding: "clamp(18px, 2.5vw, 24px)", marginTop: 26 }}>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10.5, letterSpacing: ".14em", textTransform: "uppercase" as const, color: "var(--muted)", marginBottom: 16 }}>Invoice history</div>
          {onPaidPlan ? (
            <div>
              <p style={{ fontFamily: "'Newsreader', serif", fontSize: 14, color: "var(--muted)", marginBottom: 14 }}>
                View and download all invoices from the Stripe billing portal.
              </p>
              <button
                onClick={openPortal}
                disabled={busy === "portal"}
                style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "10px 18px", borderRadius: 11, border: "1px solid var(--line)", background: "var(--surf2)", color: "var(--ink)", fontFamily: "'General Sans'", fontWeight: 600, fontSize: 14, cursor: "pointer", opacity: busy === "portal" ? 0.5 : 1 }}
              >
                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M6 2h9l5 5v15H6zM15 2v5h5"/></svg>
                {busy === "portal" ? "Opening…" : "View invoices & manage subscription"}
              </button>
            </div>
          ) : (
            <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "13px 0", borderTop: "1px solid var(--line)" }}>
              <span style={{ width: 34, height: 34, borderRadius: 9, background: "var(--surf2)", color: "var(--muted)", display: "inline-flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M6 2h9l5 5v15H6zM15 2v5h5"/></svg>
              </span>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: "'General Sans'", fontSize: 14, fontWeight: 600, color: "var(--ink)" }}>No invoices yet</div>
                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "var(--muted)" }}>You&apos;re on the Free plan</div>
              </div>
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, letterSpacing: ".06em", color: "var(--leaf)", background: "color-mix(in oklab, var(--leaf) 13%, transparent)", padding: "4px 9px", borderRadius: 999 }}>Free</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
