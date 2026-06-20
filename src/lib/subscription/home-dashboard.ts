import type { IconName } from "@/components/ui/icons";
import type { AppScreen } from "@/lib/phone";
import type { PaidTier } from "@/lib/subscription/plans";
import { PLANS } from "@/lib/subscription/plans";
import { getTierLimits } from "@/lib/subscription/limits";

export interface PlanHomeFeature {
  icon: IconName;
  title: string;
  description: string;
  screen?: AppScreen;
  href?: string;
}

export interface PlanHomeStat {
  label: string;
  value: string;
}

export interface PlanHomeDashboardConfig {
  headline: string;
  subheadline: string;
  limitsLabel: string;
  stats: PlanHomeStat[];
  quickActions: PlanHomeFeature[];
  features: PlanHomeFeature[];
}

function formatLimitValue(value: number | null): string {
  if (value === null || value === Infinity) return "Unlimited";
  return String(value);
}

function buildStats(tier: PaidTier): PlanHomeStat[] {
  const limits = getTierLimits(tier);

  let reportsValue: string;
  if (limits.reports === "none") reportsValue = "None";
  else if (limits.reports === "monthly") reportsValue = "Monthly";
  else if (limits.reports === "weekly_monthly") reportsValue = "Weekly+";
  else reportsValue = "Unlimited";

  return [
    { label: "AI Coach", value: formatLimitValue(limits.aiCoachMessages) },
    { label: "Insights", value: formatLimitValue(limits.aiInsights) },
    { label: "Reports", value: reportsValue },
  ];
}

function buildLimitsLabel(tier: PaidTier): string {
  const limits = getTierLimits(tier);
  const parts: string[] = [
    `${formatLimitValue(limits.aiCoachMessages)} AI messages`,
    `${formatLimitValue(limits.aiInsights)} insights`,
  ];

  if (limits.reports === "none") parts.push("No reports");
  else if (limits.reports === "monthly") parts.push("Monthly reports");
  else if (limits.reports === "weekly_monthly") parts.push("Weekly + monthly reports");
  else parts.push("Unlimited reports");

  if (limits.wearableDevices > 0) {
    parts.push(
      limits.wearableDevices === Infinity
        ? "Unlimited wearables"
        : `${limits.wearableDevices} wearable`,
    );
  }

  return parts.join(" · ");
}

const PLUS_QUICK_ACTIONS: PlanHomeFeature[] = [
  {
    icon: "calendar",
    title: "Fertility window",
    description: "Ovulation & fertile days",
    screen: "cycle",
  },
  {
    icon: "chart",
    title: "Weekly reports",
    description: "Track trends over time",
    screen: "reports",
  },
];

const PLUS_FEATURES: PlanHomeFeature[] = [
  {
    icon: "calendar",
    title: "Fertility window & ovulation",
    description: "Predict fertile days and ovulation from your cycle data",
    screen: "cycle",
  },
  {
    icon: "chart",
    title: "Weekly + monthly reports",
    description: "Deeper wellness summaries with weekly and monthly views",
    screen: "reports",
  },
  {
    icon: "refresh",
    title: "Cycle trends & PMS detection",
    description: "Spot irregular patterns and early PMS signals",
    screen: "cycle",
  },
  {
    icon: "sparkle",
    title: "Symptom & mood patterns",
    description: "AI correlates how you feel across your cycle phases",
    screen: "insights",
  },
  {
    icon: "clipboard",
    title: "Basic PCOS monitoring",
    description: "Cycle irregularity alerts and symptom tracking",
    screen: "pcos-dashboard",
  },
];

const PREMIUM_QUICK_ACTIONS: PlanHomeFeature[] = [
  {
    icon: "leaf",
    title: "Wearables",
    description: "Sync sleep & steps",
    screen: "wearables",
  },
  {
    icon: "star",
    title: "PCOS Analytics",
    description: "Advanced hormonal dashboard",
    screen: "pcos-dashboard",
  },
  {
    icon: "heart",
    title: "Pregnancy mode",
    description: "Trimester tracking",
    screen: "pregnancy",
  },
  {
    icon: "clipboard",
    title: "Care plan",
    description: "Personalized wellness",
    screen: "careplan",
  },
];

const PREMIUM_FEATURES: PlanHomeFeature[] = [
  ...PLUS_FEATURES,
  {
    icon: "leaf",
    title: "Wearable sync",
    description: "Connect unlimited devices for sleep, steps, and recovery insights",
    screen: "wearables",
  },
  {
    icon: "star",
    title: "PCOS Analytics Dashboard",
    description: "Advanced hormonal health analytics beyond basic monitoring",
    screen: "pcos-dashboard",
  },
  {
    icon: "heart",
    title: "Pregnancy mode",
    description: "Trimester-by-trimester guidance and symptom tracking",
    screen: "pregnancy",
  },
  {
    icon: "user",
    title: "Partner access",
    description: "Share cycle insights with your partner securely",
    screen: "partner",
  },
  {
    icon: "clipboard",
    title: "Personalized care plan",
    description: "Nutrition, supplements, and lifestyle tailored to you",
    screen: "careplan",
  },
  {
    icon: "chart",
    title: "PDF & doctor report export",
    description: "Clinical summaries ready for your healthcare provider",
    screen: "reports",
  },
  {
    icon: "shield",
    title: "Priority support",
    description: "Direct access to our wellness support team",
    href: "mailto:support@herwellness.app?subject=Premium%20Support",
  },
];

const DASHBOARD_CONFIG: Record<
  "plus" | "premium",
  Omit<PlanHomeDashboardConfig, "limitsLabel" | "stats">
> = {
  plus: {
    headline: "Plus plan active",
    subheadline: PLANS.plus.tagline,
    quickActions: PLUS_QUICK_ACTIONS,
    features: PLUS_FEATURES,
  },
  premium: {
    headline: "Premium wellness hub",
    subheadline: PLANS.premium.tagline,
    quickActions: PREMIUM_QUICK_ACTIONS,
    features: PREMIUM_FEATURES,
  },
};

export function getPlanHomeDashboard(tier: "plus" | "premium"): PlanHomeDashboardConfig {
  const base = DASHBOARD_CONFIG[tier];
  return {
    ...base,
    limitsLabel: buildLimitsLabel(tier),
    stats: buildStats(tier),
  };
}
