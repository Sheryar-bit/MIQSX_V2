import { NextResponse } from "next/server";
import type { Session } from "next-auth";
import dbConnect from "./mongoose";
import Membership, { Role } from "../models/Membership";
import Organization, { IOrganization } from "../models/Organization";
import Brand from "../models/Brand";
import { enforceLimit } from "./usage";
import { ROLE_RANK, roleAtLeast } from "./roles";

export { ROLE_RANK, roleAtLeast };

export interface OrgContext {
  org: IOrganization;
  orgId: string;
  role: Role;
}

/**
 * Resolve the caller's active organization + role. Uses session.user.activeOrgId
 * if the user is a member of it, otherwise falls back to their oldest membership
 * (their personal workspace). Returns null if the user has no workspace.
 */
export async function getOrgContext(session: Session | null): Promise<OrgContext | null> {
  const userId = session?.user?.id;
  if (!userId) return null;

  await dbConnect();

  const activeOrgId = session.user.activeOrgId;
  let membership = activeOrgId
    ? await Membership.findOne({ userId, orgId: activeOrgId })
    : null;
  if (!membership) {
    membership = await Membership.findOne({ userId }).sort({ joinedAt: 1 });
  }
  if (!membership) return null;

  const org = await Organization.findById(membership.orgId);
  if (!org) return null;

  return { org, orgId: org._id.toString(), role: membership.role };
}

export type RequireRoleResult =
  | { ok: true; ctx: OrgContext }
  | { ok: false; response: NextResponse };

/**
 * Guard for API routes. Resolves org context and enforces a minimum role.
 * Role is always read fresh from the DB (never trusted from the JWT) so that
 * removing/demoting a member takes effect immediately.
 *
 *   const r = await requireRole(session, "editor");
 *   if (!r.ok) return r.response;
 *   const brands = await Brand.find({ orgId: r.ctx.orgId });
 */
export async function requireRole(session: Session | null, min: Role): Promise<RequireRoleResult> {
  const ctx = await getOrgContext(session);
  if (!ctx) {
    return { ok: false, response: NextResponse.json({ error: "No workspace access" }, { status: 403 }) };
  }
  if (!roleAtLeast(ctx.role, min)) {
    return { ok: false, response: NextResponse.json({ error: "Insufficient permissions" }, { status: 403 }) };
  }
  return { ok: true, ctx };
}

export type OrgLimitResult =
  | { ok: true; orgId: string; role: Role }
  | { ok: false; response: NextResponse };

/**
 * Combined guard for AI routes: resolve the active org AND enforce its monthly
 * quota for `feature` in one call. Editors+ may generate; viewers cannot.
 *
 *   const gate = await enforceOrgLimit(session, "logo");
 *   if (!gate.ok) return gate.response;
 *   ... use gate.orgId for trackEvent ...
 */
export type BrandAccessResult =
  | { ok: true; ctx: OrgContext }
  | { ok: false; response: NextResponse };

/**
 * Guard for any route that operates on a specific brand by id. Verifies:
 *  1. the caller has a workspace + the minimum role, AND
 *  2. the brand actually belongs to that workspace.
 * This is the single chokepoint that prevents cross-tenant brand reads/writes.
 *
 *   const access = await requireBrandAccess(session, brandId, "editor");
 *   if (!access.ok) return access.response;
 *   await Brand.findOneAndUpdate({ _id: brandId, orgId: access.ctx.orgId }, ...)
 */
export async function requireBrandAccess(
  session: Session | null,
  brandId: string | null | undefined,
  min: Role = "viewer"
): Promise<BrandAccessResult> {
  const ctx = await getOrgContext(session);
  if (!ctx) {
    return { ok: false, response: NextResponse.json({ error: "No workspace access" }, { status: 403 }) };
  }
  if (!roleAtLeast(ctx.role, min)) {
    return { ok: false, response: NextResponse.json({ error: "Insufficient permissions" }, { status: 403 }) };
  }
  if (!brandId) {
    return { ok: false, response: NextResponse.json({ error: "brandId is required" }, { status: 400 }) };
  }
  const exists = await Brand.exists({ _id: brandId, orgId: ctx.orgId });
  if (!exists) {
    return { ok: false, response: NextResponse.json({ error: "Brand not found in this workspace" }, { status: 404 }) };
  }
  return { ok: true, ctx };
}

export async function enforceOrgLimit(session: Session | null, feature: string): Promise<OrgLimitResult> {
  const ctx = await getOrgContext(session);
  if (!ctx) {
    return { ok: false, response: NextResponse.json({ error: "No workspace access" }, { status: 403 }) };
  }
  if (!roleAtLeast(ctx.role, "editor")) {
    return {
      ok: false,
      response: NextResponse.json({ error: "Viewers can't generate content." }, { status: 403 }),
    };
  }
  const limited = await enforceLimit(ctx.orgId, feature);
  if (limited) return { ok: false, response: limited };
  return { ok: true, orgId: ctx.orgId, role: ctx.role };
}
