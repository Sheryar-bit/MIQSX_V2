import { describe, it, expect } from "vitest";
import { roleAtLeast, ROLE_RANK } from "@/lib/roles";

// These encode the multi-tenant permission matrix the route guards rely on.
// If someone reorders the hierarchy, these break before a privilege bug ships.
describe("role hierarchy", () => {
  it("ranks owner > admin > editor > viewer", () => {
    expect(ROLE_RANK.owner).toBeGreaterThan(ROLE_RANK.admin);
    expect(ROLE_RANK.admin).toBeGreaterThan(ROLE_RANK.editor);
    expect(ROLE_RANK.editor).toBeGreaterThan(ROLE_RANK.viewer);
  });

  it("viewers cannot perform editor actions (generate/edit)", () => {
    expect(roleAtLeast("viewer", "editor")).toBe(false);
    expect(roleAtLeast("viewer", "admin")).toBe(false);
    expect(roleAtLeast("viewer", "owner")).toBe(false);
    expect(roleAtLeast("viewer", "viewer")).toBe(true);
  });

  it("editors can edit but not manage members or bill", () => {
    expect(roleAtLeast("editor", "editor")).toBe(true);
    expect(roleAtLeast("editor", "admin")).toBe(false);
    expect(roleAtLeast("editor", "owner")).toBe(false);
  });

  it("admins manage members but are not owners", () => {
    expect(roleAtLeast("admin", "admin")).toBe(true);
    expect(roleAtLeast("admin", "editor")).toBe(true);
    expect(roleAtLeast("admin", "owner")).toBe(false);
  });

  it("owners can do everything", () => {
    for (const min of ["viewer", "editor", "admin", "owner"] as const) {
      expect(roleAtLeast("owner", min)).toBe(true);
    }
  });
});
