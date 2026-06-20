import type { SubscriptionTier } from "@/lib/subscription/types";
import { PLANS } from "@/lib/subscription/plans";
import { getTierLimits } from "@/lib/subscription/limits";
import { FEATURE_MIN_TIER, type Feature } from "@/lib/permissions/features";

export interface PlanPreviewInfo {
  id: SubscriptionTier;
  name: string;
  tagline: string;
  color: string;
  priceLabel: string;
  limitsSummary: string[];
  includedFeatures: string[];
  exclusiveHighlights: string[];
}

const FEATURE_LABELS: Record<Feature, string> = {
  ai_coach: "AI Coach",
  ai_insights: "AI Insights",
  monthly_report: "Monthly Wellness Report",
  weekly_report: "Weekly Reports",
  fertility_basic: "Basic Fertility Predictions",
  fertility_window: "Fertility Window Prediction",
  ovulation_prediction: "Ovulation Prediction",
  cycle_trends: "Cycle Trend Analysis",
  symptom_patterns: "Symptom Pattern Detection",
  mood_correlation: "Mood Correlation Analysis",
  pms_detection: "Early PMS Detection",
  pcos_basic: "Basic PCOS Monitoring",
  pcos_dashboard: "PCOS Analytics Dashboard",
  pregnancy_mode: "Pregnancy Mode",
  wearable_sync: "Wearable Sync",
  partner_access: "Partner Access",
  pdf_export: "PDF Report Export",
  doctor_report: "Doctor Report Export",
  personalized_plans: "Personalized Wellness Plans",
  priority_support: "Priority Support",
  early_access: "Early Access Features",
};

const TIER_ORDER: SubscriptionTier[] = ["free", "starter", "plus", "premium"];

const TIER_RANK: Record<SubscriptionTier, number> = {
  free: 0,
  starter: 1,
  plus: 2,
  premium: 3,
};

function exclusiveFeaturesForTier(tier: SubscriptionTier): string[] {
  return (Object.entries(FEATURE_MIN_TIER) as [Feature, SubscriptionTier][])
    .filter(([, minTier]) => minTier === tier)
    .map(([feature]) => FEATURE_LABELS[feature]);
}

function formatLimitValue(value: number | null): string {
  if (value === null || value === Infinity) return "Unlimited";
  return String(value);
}

function buildLimitsSummary(tier: SubscriptionTier): string[] {
  const limits = getTierLimits(tier);
  const lines = [
    `AI Coach: ${formatLimitValue(limits.aiCoachMessages)} messages/mo`,
    `AI Insights: ${formatLimitValue(limits.aiInsights)}/mo`,
  ];

  if (limits.reports === "none") lines.push("Reports: Not included");
  else if (limits.reports === "monthly") lines.push("Reports: Monthly wellness");
  else if (limits.reports === "weekly_monthly") lines.push("Reports: Weekly + monthly");
  else lines.push("Reports: Unlimited");

  lines.push(
    limits.dataHistoryMonths === null
      ? "Data history: Unlimited"
      : `Data history: ${limits.dataHistoryMonths} months`,
  );

  if (limits.wearableDevices > 0) {
    lines.push(
      limits.wearableDevices === Infinity
        ? "Wearables: Unlimited devices"
        : `Wearables: ${limits.wearableDevices} device`,
    );
  }

  return lines;
}

const FREE_PREVIEW: PlanPreviewInfo = {
  id: "free",
  name: "Free",
  tagline: "Essential tracking — no credit card required",
  color: "bg-cream",
  priceLabel: "₹0 forever",
  limitsSummary: buildLimitsSummary("free"),
  includedFeatures: [
    "Period & cycle tracking",
    "Symptom, mood & sleep logging",
    "Water & weight tracking",
    "Basic AI Coach (5 messages/mo)",
    "Cycle phase awareness",
  ],
  exclusiveHighlights: [
    "Always free — core wellness tracking",
    "No subscription needed to start",
    "Local-first data on your device",
  ],
};

export function getPlanPreviewInfo(tier: SubscriptionTier): PlanPreviewInfo {
  if (tier === "free") return FREE_PREVIEW;

  const plan = PLANS[tier];
  const exclusive = exclusiveFeaturesForTier(tier);

  return {
    id: tier,
    name: plan.name,
    tagline: plan.tagline,
    color: plan.color,
    priceLabel: `₹${plan.monthlyPrice}/mo · ₹${plan.annualPrice}/yr`,
    limitsSummary: buildLimitsSummary(tier),
    includedFeatures: plan.features,
    exclusiveHighlights:
      exclusive.length > 0
        ? exclusive
        : [`Everything in ${TIER_ORDER[TIER_RANK[tier] - 1] === "free" ? "Free" : PLANS[TIER_ORDER[TIER_RANK[tier] - 1] as "starter" | "plus"].name}`],
  };
}

export const ALL_PLAN_TIERS: SubscriptionTier[] = TIER_ORDER;

export function planPreviewPath(tier: SubscriptionTier): string {
  return tier === "free" ? "/" : `/${tier}`;
}

export function isDevPlanTabsEnabled(): boolean {
  return (
    process.env.NODE_ENV === "development" ||
    process.env.NEXT_PUBLIC_SHOW_DEV_PLAN_TABS === "true"
  );
}
