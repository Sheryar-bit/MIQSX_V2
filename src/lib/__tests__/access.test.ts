import { describe, it, expect } from "vitest";
import { hasActiveAccess, effectivePlan, isTrialing, trialDaysLeft } from "@/lib/access";

const NOW = new Date("2026-07-12T00:00:00Z");
const inDays = (d: number) => new Date(NOW.getTime() + d * 24 * 60 * 60 * 1000);

describe("access — trial + subscription gating", () => {
  it("grants access during a live trial", () => {
    const org = { plan: "pro" as const, subscriptionStatus: "trialing" as const, trialEndsAt: inDays(5) };
    expect(isTrialing(org, NOW)).toBe(true);
    expect(hasActiveAccess(org, NOW)).toBe(true);
    expect(effectivePlan(org, NOW)).toBe("pro");
    expect(trialDaysLeft(org, NOW)).toBe(5);
  });

  it("revokes paid limits once the trial lapses (falls back to free)", () => {
    const org = { plan: "pro" as const, subscriptionStatus: "trialing" as const, trialEndsAt: inDays(-1) };
    expect(isTrialing(org, NOW)).toBe(false);
    expect(hasActiveAccess(org, NOW)).toBe(false);
    expect(effectivePlan(org, NOW)).toBe("free");
    expect(trialDaysLeft(org, NOW)).toBe(0);
  });

  it("keeps access + plan while the subscription is active", () => {
    const org = { plan: "agency" as const, subscriptionStatus: "active" as const, trialEndsAt: null };
    expect(hasActiveAccess(org, NOW)).toBe(true);
    expect(effectivePlan(org, NOW)).toBe("agency");
  });

  it("past_due / canceled fall back to free limits", () => {
    for (const status of ["past_due", "canceled"] as const) {
      const org = { plan: "pro" as const, subscriptionStatus: status, trialEndsAt: null };
      expect(hasActiveAccess(org, NOW)).toBe(false);
      expect(effectivePlan(org, NOW)).toBe("free");
    }
  });

  it("free plan is always free, never counts as active access", () => {
    const org = { plan: "free" as const, subscriptionStatus: "free" as const, trialEndsAt: null };
    expect(hasActiveAccess(org, NOW)).toBe(false);
    expect(effectivePlan(org, NOW)).toBe("free");
  });

  it("grandfathers legacy paid orgs with no subscriptionStatus (undefined)", () => {
    // Orgs created before the subscriptionStatus field existed must not lose access.
    const legacy = { plan: "agency" as const, subscriptionStatus: undefined, trialEndsAt: undefined };
    expect(hasActiveAccess(legacy, NOW)).toBe(true);
    expect(effectivePlan(legacy, NOW)).toBe("agency");

    // But an explicit non-active status is honored (not grandfathered).
    const canceled = { plan: "agency" as const, subscriptionStatus: "canceled" as const, trialEndsAt: null };
    expect(effectivePlan(canceled, NOW)).toBe("free");
  });
});
