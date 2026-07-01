import type { Role } from "../models/Membership";

// Role hierarchy — pure, dependency-free so it's unit-testable without a DB.
// owner ⊃ admin ⊃ editor ⊃ viewer.
export const ROLE_RANK: Record<Role, number> = {
  viewer: 1,
  editor: 2,
  admin: 3,
  owner: 4,
};

export function roleAtLeast(role: Role, min: Role): boolean {
  return ROLE_RANK[role] >= ROLE_RANK[min];
}
