"use client";

import { useEffect, useState } from "react";

// In-app trial → paid conversion prompt. Reads the workspace billing state from
// /api/billing and, while the workspace is on a DB trial (or a payment is
// past_due), shows an "upgrade / keep my plan" banner. The banner escalates its
// styling when the trial is within ~2 days of ending or has already lapsed.
//
// "Upgrade now" POSTs to /api/billing/checkout with the trialing plan and the
// selected monthly/yearly interval, then redirects to Stripe Checkout — the
// first point at which a card is collected.

interface BillingCurrent {
  plan: "free" | "pro" | "agency";
  subscriptionStatus: "free" | "trialing" | "active" | "canceled" | "past_due";
  trialDaysLeft: number;
  isTrialing: boolean;
}

const PLAN_LABEL: Record<string, string> = { pro: "Pro", agency: "Agency" };

export function TrialBanner() {
  const [current, setCurrent] = useState<BillingCurrent | null>(null);
  const [interval, setInterval] = useState<"monthly" | "yearly">("monthly");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/billing")
      .then((r) => r.json())
      .then((d) => { if (d?.current) setCurrent(d.current); })
      .catch(() => {});
  }, []);

  if (!current) return null;

  const isTrial = current.subscriptionStatus === "trialing";
  const isPastDue = current.subscriptionStatus === "past_due";
  if (!isTrial && !isPastDue) return null;

  const plan = current.plan === "pro" || current.plan === "agency" ? current.plan : "pro";
  const planLabel = PLAN_LABEL[plan] ?? "Pro";
  const expired = isTrial && current.trialDaysLeft <= 0;
  const ending = isTrial && current.trialDaysLeft > 0 && current.trialDaysLeft <= 2;
  const urgent = expired || ending || isPastDue;

  async function upgrade() {
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan, interval }),
      });
      const d = await res.json();
      if (res.ok && d.url) { window.location.href = d.url; return; }
      setError(d.error || "Could not start checkout.");
    } catch {
      setError("Network error");
    } finally {
      setBusy(false);
    }
  }

  const message = isPastDue
    ? `Your ${planLabel} payment didn't go through. Update your card to keep your plan.`
    : expired
    ? `Your ${planLabel} trial has ended. Add a card to keep your ${planLabel} features.`
    : `${current.trialDaysLeft} day${current.trialDaysLeft === 1 ? "" : "s"} left in your ${planLabel} trial.`;

  const accent = urgent ? "var(--terra)" : "var(--sig)";

  return (
    <div
      className="ds-in"
      style={{
        display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, flexWrap: "wrap",
        borderRadius: 16, marginBottom: 24, padding: "14px 18px",
        border: `1px solid color-mix(in oklab, ${accent} 40%, var(--line))`,
        background: `color-mix(in oklab, ${accent} 9%, var(--surface))`,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 11, minWidth: 0 }}>
        <span style={{ width: 34, height: 34, borderRadius: 10, background: `color-mix(in oklab, ${accent} 16%, transparent)`, color: accent, display: "inline-flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.9" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 3" /></svg>
        </span>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontFamily: "'General Sans'", fontWeight: 600, fontSize: 14.5, color: "var(--ink)" }}>{message}</div>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "var(--muted)", marginTop: 2 }}>
            {error || "No card was needed to start — you're only charged when you upgrade."}
          </div>
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
        <div style={{ display: "inline-flex", padding: 3, borderRadius: 999, background: "var(--surf2)", border: "1px solid var(--line)" }}>
          {(["monthly", "yearly"] as const).map((iv) => (
            <button
              key={iv}
              onClick={() => setInterval(iv)}
              style={{
                border: "none", cursor: "pointer", borderRadius: 999, padding: "5px 12px",
                fontFamily: "'General Sans'", fontWeight: 600, fontSize: 12, textTransform: "capitalize",
                background: interval === iv ? "var(--surface)" : "transparent",
                color: interval === iv ? "var(--ink)" : "var(--muted)",
              }}
            >
              {iv}
            </button>
          ))}
        </div>
        <button
          onClick={upgrade}
          disabled={busy}
          style={{
            border: "none", borderRadius: 11, padding: "10px 18px", whiteSpace: "nowrap",
            background: accent, color: "#fff", fontFamily: "'General Sans'", fontWeight: 600, fontSize: 14,
            cursor: busy ? "default" : "pointer", opacity: busy ? 0.6 : 1,
          }}
        >
          {busy ? "Starting…" : isPastDue ? "Update card" : `Upgrade ${planLabel}`}
        </button>
      </div>
    </div>
  );
}
