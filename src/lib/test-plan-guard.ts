import type { AuthUser } from "@/lib/auth-types";
import type { PaidTier } from "@/lib/subscription";
import { getLockedTestPlanTier } from "@/lib/test-accounts";

export function assertTestPlanAllowed(user: AuthUser, tier: PaidTier): string | null {
  const locked = getLockedTestPlanTier(user);
  if (!locked) return null;
  if (tier !== locked) {
    const label = locked.charAt(0).toUpperCase() + locked.slice(1);
    return `This test account is locked to the ${label} plan only`;
  }
  return null;
}
