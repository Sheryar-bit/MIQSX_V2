"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Check, Zap, Star, Building2 } from "lucide-react";
import { cn } from "@/lib/utils";

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

const PLAN_ICONS: Record<string, React.ReactNode> = {
  free: <Zap className="w-5 h-5" />,
  pro: <Star className="w-5 h-5" />,
  agency: <Building2 className="w-5 h-5" />,
};

export default function BillingPage() {
  const [data, setData] = useState<BillingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState("");
  const [notice, setNotice] = useState("");
  const { update } = useSession();

  function load() {
    fetch("/api/billing")
      .then((r) => r.json())
      .then((d) => (d.error ? setError(d.error) : setData(d)))
      .catch(() => setError("Failed to load billing"))
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  // Handle the return from Stripe Checkout.
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
        // Paid plans → Stripe Checkout. Plan state is set by the webhook on success.
        const res = await fetch("/api/billing/checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ plan }),
        });
        const d = await res.json();
        if (res.ok && d.url) {
          window.location.href = d.url; // redirect to Stripe
          return;
        }
        setNotice(d.error || "Could not start checkout.");
      } else {
        // Downgrade to free is handled by cancelling the subscription in the portal.
        setNotice("To move to Free, cancel your subscription from the billing portal.");
      }
    } catch {
      setNotice("Network error");
    } finally {
      setBusy("");
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent" />
      </div>
    );
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

  if (error || !data) {
    return <div className="p-8 text-center text-error">{error || "Something went wrong"}</div>;
  }

  const onPaidPlan = data.current.plan === "pro" || data.current.plan === "agency";

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-text">Billing &amp; Plans</h1>
        <p className="text-text-muted mt-1">
          You&apos;re currently on the{" "}
          <span className="text-primary-light font-medium capitalize">{data.current.plan}</span> plan.
        </p>
      </div>

      {notice && (
        <div className="rounded-xl border border-border bg-surface-2 px-4 py-3 text-sm text-text">{notice}</div>
      )}

      {onPaidPlan && (
        <button
          onClick={openPortal}
          disabled={busy === "portal"}
          className="text-sm text-primary-light hover:underline disabled:opacity-50"
        >
          {busy === "portal" ? "Opening…" : "Manage subscription, invoices & cancellation →"}
        </button>
      )}

      <div className="grid md:grid-cols-3 gap-5">
        {data.plans.map((p) => (
          <div
            key={p.id}
            className={cn(
              "rounded-2xl border bg-surface p-6 flex flex-col",
              p.isCurrent ? "border-primary shadow-glow-primary" : "border-border",
              p.id === "pro" && !p.isCurrent && "border-primary/40"
            )}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-primary-light">
                {PLAN_ICONS[p.id]}
                <span className="font-semibold text-text">{p.name}</span>
              </div>
              {p.isCurrent && (
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-primary/15 text-primary-light border border-primary/20">
                  Current
                </span>
              )}
            </div>

            <div className="mt-4">
              <span className="text-3xl font-bold text-text">
                {p.price.pkr === 0 ? "Free" : `PKR ${p.price.pkr.toLocaleString()}`}
              </span>
              {p.price.pkr > 0 && <span className="text-text-dim text-sm"> /mo · ${p.price.usd}</span>}
            </div>

            <ul className="mt-5 space-y-2 flex-1">
              {p.features.map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm text-text-muted">
                  <Check className="w-4 h-4 text-success mt-0.5 flex-shrink-0" />
                  {f}
                </li>
              ))}
            </ul>

            <button
              disabled={p.isCurrent || busy === p.id}
              onClick={() => choosePlan(p.id)}
              className={cn(
                "mt-6 h-10 rounded-xl text-sm font-medium transition-colors",
                p.isCurrent
                  ? "bg-surface-2 text-text-dim cursor-default"
                  : "bg-primary text-white hover:bg-primary-hover"
              )}
            >
              {p.isCurrent ? "Current plan" : busy === p.id ? "…" : `Switch to ${p.name}`}
            </button>
          </div>
        ))}
      </div>

      <p className="text-xs text-text-dim text-center">
        Payments are not yet live. Plan switching is disabled until checkout is integrated.
      </p>
    </div>
  );
}
