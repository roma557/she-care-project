"use client";

import { useCallback, useEffect, useState } from "react";
import type { PaidTier, SubscriptionTier } from "@/lib/subscription";
import { getTierLimits } from "@/lib/subscription";
import type { Feature } from "@/lib/permissions/features";
import { FEATURE_MIN_TIER } from "@/lib/permissions/features";
import type { UsageStatus } from "@/lib/permissions/usage";
import type { TierLimits, UsageMeter } from "@/lib/subscription/limits";
import { APP_REFRESH_EVENT } from "@/lib/sync-pull";
import { useDevPlanPreview } from "@/context/DevPlanPreviewContext";
import { useAuth } from "@/context/AuthContext";

interface BillingStatus {
  tier: SubscriptionTier;
  authenticated: boolean;
  demoMode?: boolean;
  usage: {
    ai_coach?: UsageStatus;
    ai_insights?: UsageStatus;
    reports_generated?: UsageStatus;
  };
  limits: TierLimits;
  subscription?: {
    expiresAt: string | null;
    billingInterval?: string | null;
  };
}

const TIER_RANK: Record<SubscriptionTier, number> = {
  free: 0,
  starter: 1,
  plus: 2,
  premium: 3,
};

function buildPreviewUsage(limits: TierLimits): BillingStatus["usage"] {
  const meter = (name: UsageMeter, value: number): UsageStatus => {
    const unlimited = value === Infinity;
    return {
      meter: name,
      used: 0,
      limit: unlimited ? 0 : value,
      remaining: unlimited ? Infinity : value,
      unlimited,
    };
  };

  return {
    ai_coach: meter("ai_coach", limits.aiCoachMessages),
    ai_insights: meter("ai_insights", limits.aiInsights),
    reports_generated: meter(
      "reports_generated",
      limits.reports === "none"
        ? 0
        : limits.reports === "unlimited"
          ? Infinity
          : limits.reports === "weekly_monthly"
            ? 5
            : 1,
    ),
  };
}

export function usePermissions() {
  const { user } = useAuth();
  const { previewTier, isPreviewActive } = useDevPlanPreview();
  const [status, setStatus] = useState<BillingStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const lockedTier = user?.testPlanTier ?? null;

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/billing/status");
      const data = await res.json();
      setStatus(data);
    } catch {
      setStatus(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    const onAppRefresh = () => {
      void refresh();
    };
    window.addEventListener(APP_REFRESH_EVENT, onAppRefresh);
    return () => window.removeEventListener(APP_REFRESH_EVENT, onAppRefresh);
  }, [refresh]);

  const actualTier = status?.tier ?? "free";
  const tier: SubscriptionTier = lockedTier
    ? lockedTier
    : isPreviewActive && previewTier
      ? previewTier
      : actualTier;
  const previewLimits = !lockedTier && isPreviewActive && previewTier ? getTierLimits(previewTier) : null;

  const can = useCallback(
    (feature: Feature): boolean => {
      const required = FEATURE_MIN_TIER[feature];
      return TIER_RANK[tier] >= TIER_RANK[required];
    },
    [tier],
  );

  const remaining = useCallback(
    (meter: "ai_coach" | "ai_insights" | "reports_generated"): number | null => {
      if (isPreviewActive && previewLimits) {
        const usage = buildPreviewUsage(previewLimits)[meter];
        if (!usage || usage.unlimited) return null;
        return usage.remaining;
      }
      const u = status?.usage?.[meter];
      if (!u) return null;
      if (u.unlimited) return null;
      return u.remaining;
    },
    [status, isPreviewActive, previewLimits],
  );

  const startCheckout = useCallback(
    async (targetTier: PaidTier, interval: "month" | "year" = "month", provider?: string) => {
      const res = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tier: targetTier, interval, provider }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
        return { ok: true };
      }
      if (data.demo && data.user) {
        await refresh();
        return { ok: true, demo: true };
      }
      return { ok: false, error: data.error ?? "Checkout failed" };
    },
    [refresh],
  );

  return {
    loading,
    tier,
    actualTier,
    status: !lockedTier && isPreviewActive && previewTier && previewLimits
      ? {
          ...(status ?? {
            tier: previewTier,
            authenticated: false,
            usage: {},
            limits: previewLimits,
          }),
          tier: previewTier,
          limits: previewLimits,
          usage: buildPreviewUsage(previewLimits),
        }
      : status,
    can,
    remaining,
    refresh,
    startCheckout,
    demoMode: status?.demoMode ?? false,
    isPreviewActive: lockedTier ? false : isPreviewActive,
    lockedTier,
  };
}
