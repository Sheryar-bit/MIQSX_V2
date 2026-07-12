import { describe, it, expect } from "vitest";
import { planToPriceId, priceIdToPlan } from "@/lib/stripe";
import { getPriceId, planFromPriceId, PRICE_IDS } from "@/lib/plans";

describe("stripe price mapping (plan × interval)", () => {
  it("resolves plan + interval → price id", () => {
    expect(getPriceId("pro", "monthly")).toBe(PRICE_IDS.pro.monthly);
    expect(getPriceId("pro", "yearly")).toBe(PRICE_IDS.pro.yearly);
    expect(getPriceId("agency", "monthly")).toBe(PRICE_IDS.agency.monthly);
    expect(getPriceId("agency", "yearly")).toBe(PRICE_IDS.agency.yearly);
  });

  it("throws on unknown plan or interval", () => {
    expect(() => getPriceId("free", "monthly")).toThrow();
    expect(() => getPriceId("pro", "weekly")).toThrow();
  });

  it("planToPriceId defaults to the monthly price", () => {
    expect(planToPriceId("pro")).toBe(PRICE_IDS.pro.monthly);
    expect(planToPriceId("agency", "yearly")).toBe(PRICE_IDS.agency.yearly);
  });

  it("maps any known price id → plan (any interval)", () => {
    expect(priceIdToPlan(PRICE_IDS.pro.monthly)).toBe("pro");
    expect(priceIdToPlan(PRICE_IDS.pro.yearly)).toBe("pro");
    expect(priceIdToPlan(PRICE_IDS.agency.monthly)).toBe("agency");
    expect(priceIdToPlan(PRICE_IDS.agency.yearly)).toBe("agency");
  });

  it("planFromPriceId returns both plan and interval", () => {
    expect(planFromPriceId(PRICE_IDS.pro.yearly)).toEqual({ plan: "pro", interval: "yearly" });
    expect(planFromPriceId(PRICE_IDS.agency.monthly)).toEqual({ plan: "agency", interval: "monthly" });
  });

  it("returns null for unknown / missing price ids", () => {
    expect(priceIdToPlan("price_unknown")).toBeNull();
    expect(priceIdToPlan(undefined)).toBeNull();
    expect(planFromPriceId(undefined)).toBeNull();
  });
});
