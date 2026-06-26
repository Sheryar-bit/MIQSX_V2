import { DefaultSession } from "next-auth";
import type { UserPlan } from "@/lib/plans";

declare module "next-auth" {
  interface Session {
    user: DefaultSession["user"] & { id?: string; plan?: UserPlan; activeOrgId?: string };
  }
  interface User {
    plan?: UserPlan;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    plan?: UserPlan;
    activeOrgId?: string;
  }
}
