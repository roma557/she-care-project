export type SubscriptionTier = "free" | "rozana" | "sampoorna" | "sakhi";

export interface Subscription {
  tier: SubscriptionTier;
  expiresAt: string | null;
  startedAt: string | null;
}

export const DEFAULT_SUBSCRIPTION: Subscription = {
  tier: "free",
  expiresAt: null,
  startedAt: null,
};

export interface PlanInfo {
  id: SubscriptionTier;
  name: string;
  tagline: string;
  monthlyPrice: number;
  annualPrice: number;
  color: string;
  features: string[];
}

export const PLANS: Record<Exclude<SubscriptionTier, "free">, PlanInfo> = {
  rozana: {
    id: "rozana",
    name: "Rozana Care",
    tagline: "Roz ₹1 — apni health ka khayal",
    monthlyPrice: 29,
    annualPrice: 249,
    color: "bg-teal-light",
    features: [
      "15 AI questions/month",
      "Diet + Exercise + Sleep plans",
      "Unlimited assessment retakes",
      "Period reminders",
      "Hindi & Hinglish support",
    ],
  },
  sampoorna: {
    id: "sampoorna",
    name: "Sampoorna Care",
    tagline: "Poora plan — diet se doctor tak",
    monthlyPrice: 79,
    annualPrice: 699,
    color: "bg-purple-light",
    features: [
      "Unlimited AI questions",
      "All 6 care plan tabs",
      "Detailed assessment insights",
      "Cycle trends & phase insights",
      "PDF export for doctor visits",
      "Offline saved content",
    ],
  },
  sakhi: {
    id: "sakhi",
    name: "Sakhi Plus",
    tagline: "Doctor ke saath, community ke saath",
    monthlyPrice: 149,
    annualPrice: 1299,
    color: "bg-pink-light",
    features: [
      "Everything in Sampoorna",
      "1 tele-consult/month",
      "Private Sakhi community",
      "Family sharing (1 person)",
      "Weekly Indian meal plans",
      "Lab report guide",
    ],
  },
};

const TIER_RANK: Record<SubscriptionTier, number> = {
  free: 0,
  rozana: 1,
  sampoorna: 2,
  sakhi: 3,
};

export function isSubscriptionActive(sub: Subscription): boolean {
  if (sub.tier === "free") return true;
  if (!sub.expiresAt) return false;
  return new Date(sub.expiresAt) > new Date();
}

export function getEffectiveTier(sub: Subscription): SubscriptionTier {
  if (sub.tier === "free") return "free";
  return isSubscriptionActive(sub) ? sub.tier : "free";
}

export function hasTierAccess(sub: Subscription, required: SubscriptionTier): boolean {
  const effective = getEffectiveTier(sub);
  return TIER_RANK[effective] >= TIER_RANK[required];
}

export function getPlanLabel(tier: SubscriptionTier): string {
  if (tier === "free") return "Free";
  return PLANS[tier].name;
}

export function getAiQuestionLimit(tier: SubscriptionTier): number {
  switch (tier) {
    case "free":
      return 3;
    case "rozana":
      return 15;
    default:
      return Infinity;
  }
}
