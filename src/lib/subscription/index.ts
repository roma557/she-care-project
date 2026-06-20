import { PLANS } from "@/lib/subscription/plans";
import { getMeterLimit, getTierLimits } from "@/lib/subscription/limits";
import {
  DEFAULT_SUBSCRIPTION,
  normalizeTier,
  type Subscription,
  type SubscriptionTier,
} from "@/lib/subscription/types";

export * from "@/lib/subscription/types";
export * from "@/lib/subscription/plans";
export * from "@/lib/subscription/limits";
export type { PaidTier } from "@/lib/subscription/plans";

const TIER_RANK: Record<SubscriptionTier, number> = {
  free: 0,
  starter: 1,
  plus: 2,
  premium: 3,
};

export function isSubscriptionActive(sub: Subscription): boolean {
  if (sub.tier === "free") return true;
  if (sub.status === "canceled" || sub.status === "expired") return false;
  if (!sub.expiresAt) return sub.status === "active";
  return new Date(sub.expiresAt) > new Date();
}

export function getEffectiveTier(sub: Subscription): SubscriptionTier {
  const tier = normalizeTier(sub.tier);
  if (tier === "free") return "free";
  if (sub.status === "past_due" && sub.expiresAt) {
    const graceEnd = new Date(sub.expiresAt);
    graceEnd.setDate(graceEnd.getDate() + 3);
    if (new Date() > graceEnd) return "free";
  }
  return isSubscriptionActive({ ...sub, tier }) ? tier : "free";
}

export function hasTierAccess(sub: Subscription, required: SubscriptionTier): boolean {
  const effective = getEffectiveTier(sub);
  return TIER_RANK[effective] >= TIER_RANK[normalizeTier(required)];
}

export function getPlanLabel(tier: SubscriptionTier | string): string {
  const normalized = normalizeTier(tier);
  if (normalized === "free") return "Free";
  return PLANS[normalized].name;
}

export function getAiQuestionLimit(tier: SubscriptionTier | string): number {
  return getMeterLimit(normalizeTier(tier), "ai_coach");
}

export function normalizeSubscription(sub: Subscription): Subscription {
  return {
    ...DEFAULT_SUBSCRIPTION,
    ...sub,
    tier: normalizeTier(sub.tier),
  };
}

export { getTierLimits };
