"use client";

import useSWR from "swr";

// Poll cadences — short enough to feel live, long enough to be cheap.
const LIVE = 6000; // collaborative surfaces (brands, members)
const AMBIENT = 15000; // context (workspaces, invitations)

export interface Workspace {
  orgId: string;
  name: string;
  plan: string;
  role: string;
  memberCount: number;
  isPersonal: boolean;
}

export interface Invitation {
  token: string;
  role: string;
  orgId: string;
  workspaceName: string;
  inviterName: string;
}

export interface BrandLite {
  _id: string;
  name: string;
  industry?: string;
  status?: string;
  auditScore?: number;
  updatedAt?: string;
  [k: string]: unknown;
}

export function useWorkspaces() {
  const { data, mutate, isLoading } = useSWR<{ orgs: Workspace[]; activeOrgId?: string }>(
    "/api/orgs",
    { refreshInterval: AMBIENT }
  );
  return { workspaces: data?.orgs ?? [], activeOrgId: data?.activeOrgId, mutate, isLoading };
}

export function useInvitations() {
  const { data, mutate } = useSWR<{ invitations: Invitation[] }>("/api/invitations", {
    refreshInterval: AMBIENT,
  });
  return { invitations: data?.invitations ?? [], mutate };
}

export function useBrands(fallbackData?: { brands: BrandLite[] }) {
  const { data, mutate, isLoading } = useSWR<{ brands: BrandLite[] }>("/api/brand", {
    refreshInterval: LIVE,
    fallbackData,
  });
  return { brands: data?.brands ?? [], mutate, isLoading };
}
