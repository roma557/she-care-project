import type { AuthUser } from "@/lib/auth-types";
import type { PaidTier } from "@/lib/subscription";

/** Test Google accounts — each email is locked to exactly one plan tier. */
export const TEST_ACCOUNT_PLANS: Record<string, PaidTier> = {
  "plus@test.com": "plus",
  "premium@test.com": "premium",
};

export function normalizeTestEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function getTestAccountTier(email: string): PaidTier | null {
  return TEST_ACCOUNT_PLANS[normalizeTestEmail(email)] ?? null;
}

export function isTestAccountEmail(email: string): boolean {
  return getTestAccountTier(email) !== null;
}

export function googlePhoneForEmail(email: string): string {
  return `google:${normalizeTestEmail(email)}`;
}

export function emailFromGooglePhone(phone: string): string | null {
  if (!phone.startsWith("google:")) return null;
  return phone.slice("google:".length);
}

export function getLockedTestPlanTier(user: AuthUser): PaidTier | null {
  if (user.testPlanTier) return user.testPlanTier;
  const fromPhone = emailFromGooglePhone(user.phone);
  if (fromPhone) return getTestAccountTier(fromPhone);
  if (user.email) return getTestAccountTier(user.email);
  return null;
}

export function isTestPlanLocked(user: AuthUser | null | undefined): boolean {
  if (!user) return false;
  return getLockedTestPlanTier(user) !== null;
}
