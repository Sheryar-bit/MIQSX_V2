import { describe, it, expect } from "vitest";
import { isWithinLimit, remainingUses, PLANS } from "@/lib/plans";

describe("plan limits", () => {
  it("allows usage below the free logo limit (5)", () => {
    expect(isWithinLimit("free", "logo", 4)).toBe(true);
  });

  it("blocks usage at the free logo limit", () => {
    expect(isWithinLimit("free", "logo", 5)).toBe(false);
    expect(isWithinLimit("free", "logo", 6)).toBe(false);
  });

  it("treats agency unlimited (-1) as always allowed", () => {
    expect(PLANS.agency.limits.logoGenerations).toBe(-1);
    expect(isWithinLimit("agency", "logo", 9999)).toBe(true);
  });

  it("computes remaining uses correctly", () => {
    expect(remainingUses("free", "logo", 2)).toBe(3);
    expect(remainingUses("free", "logo", 5)).toBe(0);
    expect(remainingUses("free", "logo", 99)).toBe(0);
    expect(remainingUses("agency", "logo", 99)).toBe(Infinity);
  });

  it("allows unknown features (no mapping)", () => {
    expect(isWithinLimit("free", "nonexistent", 1000)).toBe(true);
  });

  it("gates festive (FLUX) generations per plan", () => {
    expect(isWithinLimit("free", "festive", 2)).toBe(true);
    expect(isWithinLimit("free", "festive", 3)).toBe(false);
    expect(PLANS.pro.limits.festiveGenerations).toBe(30);
    expect(PLANS.agency.limits.festiveGenerations).toBe(100);
    expect(isWithinLimit("agency", "festive", 50)).toBe(true);
  });
});
