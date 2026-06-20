import type { SubscriptionTier } from "@/lib/subscription/types";

export type UsageMeter = "ai_coach" | "ai_insights" | "reports_generated";

export type ReportAccess = "none" | "monthly" | "weekly_monthly" | "unlimited";

export interface TierLimits {
  aiCoachMessages: number;
  aiInsights: number;
  reports: ReportAccess;
  dataHistoryMonths: number | null;
  wearableDevices: number;
}

export const TIER_LIMITS: Record<SubscriptionTier, TierLimits> = {
  free: {
    aiCoachMessages: 5,
    aiInsights: 0,
    reports: "none",
    dataHistoryMonths: 3,
    wearableDevices: 0,
  },
  starter: {
    aiCoachMessages: 30,
    aiInsights: 10,
    reports: "monthly",
    dataHistoryMonths: 6,
    wearableDevices: 0,
  },
  plus: {
    aiCoachMessages: 200,
    aiInsights: 50,
    reports: "weekly_monthly",
    dataHistoryMonths: 36,
    wearableDevices: 0,
  },
  premium: {
    aiCoachMessages: Infinity,
    aiInsights: Infinity,
    reports: "unlimited",
    dataHistoryMonths: null,
    wearableDevices: Infinity,
  },
};

export function getTierLimits(tier: SubscriptionTier): TierLimits {
  return TIER_LIMITS[tier];
}

export function getMeterLimit(tier: SubscriptionTier, meter: UsageMeter): number {
  const limits = getTierLimits(tier);
  switch (meter) {
    case "ai_coach":
      return limits.aiCoachMessages;
    case "ai_insights":
      return limits.aiInsights;
    case "reports_generated":
      if (limits.reports === "none") return 0;
      if (limits.reports === "unlimited") return Infinity;
      if (limits.reports === "weekly_monthly") return 5;
      return 1;
    default:
      return 0;
  }
}

export function getDataHistoryCutoff(tier: SubscriptionTier): Date | null {
  const months = TIER_LIMITS[tier].dataHistoryMonths;
  if (months === null) return null;
  const cutoff = new Date();
  cutoff.setMonth(cutoff.getMonth() - months);
  cutoff.setHours(0, 0, 0, 0);
  return cutoff;
}
