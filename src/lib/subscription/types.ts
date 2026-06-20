export type SubscriptionTier = "free" | "starter" | "plus" | "premium";

/** @deprecated Legacy tier IDs — mapped on read */
export type LegacySubscriptionTier = "rozana" | "sampoorna" | "sakhi";

export type BillingInterval = "month" | "year";

export type SubscriptionStatus = "active" | "past_due" | "canceled" | "expired";

export type BillingProvider = "stripe" | "razorpay" | "demo";

export interface Subscription {
  tier: SubscriptionTier;
  expiresAt: string | null;
  startedAt: string | null;
  status?: SubscriptionStatus;
  billingInterval?: BillingInterval | null;
  provider?: BillingProvider | null;
  cancelAtPeriodEnd?: boolean;
}

export const DEFAULT_SUBSCRIPTION: Subscription = {
  tier: "free",
  expiresAt: null,
  startedAt: null,
  status: "active",
  billingInterval: null,
  provider: null,
  cancelAtPeriodEnd: false,
};

export interface PlanInfo {
  id: Exclude<SubscriptionTier, "free">;
  name: string;
  tagline: string;
  monthlyPrice: number;
  annualPrice: number;
  color: string;
  features: string[];
  limits: string[];
}

export const LEGACY_TIER_MAP: Record<LegacySubscriptionTier, SubscriptionTier> = {
  rozana: "starter",
  sampoorna: "plus",
  sakhi: "premium",
};

export function normalizeTier(tier: string): SubscriptionTier {
  if (tier === "free" || tier === "starter" || tier === "plus" || tier === "premium") {
    return tier;
  }
  if (tier in LEGACY_TIER_MAP) {
    return LEGACY_TIER_MAP[tier as LegacySubscriptionTier];
  }
  return "free";
}
