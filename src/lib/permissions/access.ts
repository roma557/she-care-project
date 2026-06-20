import type { SubscriptionTier } from "@/lib/subscription";
import { getEffectiveTier } from "@/lib/subscription";
import { findUserByIdAsync, hydrateUserSubscription } from "@/lib/db";
import type { Feature } from "@/lib/permissions/features";
import { tierMeetsFeature } from "@/lib/permissions/features";

export async function resolveEffectiveTier(userId: string): Promise<SubscriptionTier> {
  const user = await findUserByIdAsync(userId);
  if (!user) return "free";
  const hydrated = await hydrateUserSubscription(user);
  return getEffectiveTier(hydrated.subscription);
}

export async function canAccess(userId: string, feature: Feature): Promise<boolean> {
  const tier = await resolveEffectiveTier(userId);
  return tierMeetsFeature(tier, feature);
}

export async function assertAccess(userId: string, feature: Feature): Promise<SubscriptionTier> {
  const tier = await resolveEffectiveTier(userId);
  if (!tierMeetsFeature(tier, feature)) {
    const { featureMinTier } = await import("@/lib/permissions/features");
    const err = new Error("upgrade_required");
    (err as Error & { requiredTier: SubscriptionTier }).requiredTier = featureMinTier(feature);
    throw err;
  }
  return tier;
}
