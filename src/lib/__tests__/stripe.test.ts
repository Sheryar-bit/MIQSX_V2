import { describe, it, expect, beforeEach } from "vitest";
import { planToPriceId, priceIdToPlan } from "@/lib/stripe";

beforeEach(() => {
  process.env.STRIPE_PRICE_PRO = "price_pro_123";
  process.env.STRIPE_PRICE_AGENCY = "price_agency_456";
});

describe("stripe price mapping", () => {
  it("maps plan → price id", () => {
    expect(planToPriceId("pro")).toBe("price_pro_123");
    expect(planToPriceId("agency")).toBe("price_agency_456");
  });

  it("maps price id → plan", () => {
    expect(priceIdToPlan("price_pro_123")).toBe("pro");
    expect(priceIdToPlan("price_agency_456")).toBe("agency");
  });

  it("returns null for unknown / missing price ids", () => {
    expect(priceIdToPlan("price_unknown")).toBeNull();
    expect(priceIdToPlan(undefined)).toBeNull();
  });
});
