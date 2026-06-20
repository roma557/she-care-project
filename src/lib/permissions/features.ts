export type Feature =
  | "ai_coach"
  | "ai_insights"
  | "monthly_report"
  | "weekly_report"
  | "fertility_basic"
  | "fertility_window"
  | "ovulation_prediction"
  | "cycle_trends"
  | "symptom_patterns"
  | "mood_correlation"
  | "pms_detection"
  | "pcos_basic"
  | "pcos_dashboard"
  | "pregnancy_mode"
  | "wearable_sync"
  | "partner_access"
  | "pdf_export"
  | "doctor_report"
  | "personalized_plans"
  | "priority_support"
  | "early_access";

import type { SubscriptionTier } from "@/lib/subscription";

export const FEATURE_MIN_TIER: Record<Feature, SubscriptionTier> = {
  ai_coach: "free",
  ai_insights: "starter",
  monthly_report: "starter",
  weekly_report: "plus",
  fertility_basic: "starter",
  fertility_window: "plus",
  ovulation_prediction: "plus",
  cycle_trends: "plus",
  symptom_patterns: "plus",
  mood_correlation: "plus",
  pms_detection: "plus",
  pcos_basic: "plus",
  pcos_dashboard: "premium",
  pregnancy_mode: "premium",
  wearable_sync: "premium",
  partner_access: "premium",
  pdf_export: "premium",
  doctor_report: "premium",
  personalized_plans: "premium",
  priority_support: "premium",
  early_access: "premium",
};

const TIER_RANK: Record<SubscriptionTier, number> = {
  free: 0,
  starter: 1,
  plus: 2,
  premium: 3,
};

export function featureMinTier(feature: Feature): SubscriptionTier {
  return FEATURE_MIN_TIER[feature];
}

export function tierMeetsFeature(tier: SubscriptionTier, feature: Feature): boolean {
  return TIER_RANK[tier] >= TIER_RANK[FEATURE_MIN_TIER[feature]];
}

export function requiredTierLabel(feature: Feature): string {
  const tier = FEATURE_MIN_TIER[feature];
  if (tier === "free") return "Free";
  if (tier === "starter") return "Starter";
  if (tier === "plus") return "Plus";
  return "Premium";
}
