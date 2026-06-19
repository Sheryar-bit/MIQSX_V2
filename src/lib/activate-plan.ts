import dbConnect from "./mongoose";
import User from "../models/User";
import { UserPlan } from "./plans";

export interface ActivatePlanResult {
  plan: UserPlan;
  activatedAt: Date;
  expiresAt: Date;
}

/**
 * The single source of truth for changing a user's plan.
 *
 * This is server-only and must be the ONLY place plan state is mutated.
 * In Phase 2 the payment-gateway webhook (Stripe / JazzCash / Easypaisa) calls
 * this after verifying a successful payment — the client never sets the plan.
 *
 * @param userId  the user to upgrade/downgrade
 * @param plan    target plan
 * @param months  billing-cycle length (default 1 month)
 */
export async function activatePlan(
  userId: string,
  plan: UserPlan,
  months = 1
): Promise<ActivatePlanResult> {
  await dbConnect();

  const now = new Date();
  const expiresAt = new Date(now);
  expiresAt.setMonth(expiresAt.getMonth() + months);

  const user = await User.findByIdAndUpdate(
    userId,
    { plan, planActivatedAt: now, planExpiresAt: expiresAt },
    { new: true }
  );

  if (!user) throw new Error(`activatePlan: user ${userId} not found`);

  return { plan: user.plan, activatedAt: user.planActivatedAt!, expiresAt: user.planExpiresAt! };
}
