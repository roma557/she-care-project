"use client";

import { useDevPlanPreview } from "@/context/DevPlanPreviewContext";
import { usePermissions } from "@/hooks/usePermissions";
import type { Feature } from "@/lib/permissions/features";
import { requiredTierLabel } from "@/lib/permissions/features";
import type { ReactNode } from "react";
import { AppIcon } from "@/components/ui/icons";

/**
 * usePremiumStatus — single-source hook for premium feature gating.
 *
 * Returns:
 *  - `isPremium`: true if tier is "premium" (real subscription OR route preview)
 *  - `isFullAccess`: true if ALL features are unlocked (premium tier)
 *  - `isPreview`: true if access comes from /premium route preview
 *  - `can(feature)`: delegates to usePermissions().can()
 *  - feature convenience booleans: isAIEnabled, hasAdvancedAnalytics, unlimitedAccess
 */
export function usePremiumStatus() {
  const { tier, can, remaining, loading } = usePermissions();
  const { isPreviewActive, routePreview } = useDevPlanPreview();

  const isPremium = tier === "premium";
  const isFullAccess = isPremium;

  return {
    /** Current effective tier (real or preview) */
    tier,
    /** True if the user has premium-level access */
    isPremium,
    /** True if all features are unlocked */
    isFullAccess,
    /** True when access is via /premium route preview, not a real subscription */
    isPreview: routePreview && isPreviewActive,
    /** True while billing status is loading */
    loading,
    /** Check any specific feature */
    can,
    /** Remaining usage for metered features */
    remaining,

    /* ─── Convenience feature flags ─── */
    isAIEnabled: can("ai_coach"),
    hasAIInsights: can("ai_insights"),
    hasAdvancedAnalytics: can("pcos_dashboard"),
    hasFertilityWindow: can("fertility_window"),
    hasPregnancyMode: can("pregnancy_mode"),
    hasWearableSync: can("wearable_sync"),
    hasPartnerAccess: can("partner_access"),
    hasPdfExport: can("pdf_export"),
    hasDoctorReport: can("doctor_report"),
    hasPersonalizedPlans: can("personalized_plans"),
    hasPrioritySupport: can("priority_support"),
    unlimitedAccess: isPremium,
  };
}

/**
 * <PremiumGuard> — Conditional rendering wrapper.
 *
 * If the user has access to the required feature, renders children.
 * Otherwise, renders a polished upgrade banner (or a custom fallback).
 *
 * @example
 * <PremiumGuard feature="pcos_dashboard">
 *   <PCOSDashboardWidget />
 * </PremiumGuard>
 *
 * @example with custom fallback
 * <PremiumGuard feature="ai_insights" fallback={<CustomPaywall />}>
 *   <AIInsightsPanel />
 * </PremiumGuard>
 */
export function PremiumGuard({
  feature,
  children,
  fallback,
  onUpgrade,
}: {
  feature: Feature;
  children: ReactNode;
  fallback?: ReactNode;
  onUpgrade?: () => void;
}) {
  const { can, loading } = usePremiumStatus();

  if (loading) {
    return (
      <div className="animate-pulse rounded-2xl bg-surface-1 border border-divider p-6 h-24" />
    );
  }

  if (can(feature)) {
    return <>{children}</>;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  return <UpgradeBanner feature={feature} onUpgrade={onUpgrade} />;
}

/**
 * Default paywall banner shown when a feature is locked.
 * Styled to match the premium dark mode design system.
 */
function UpgradeBanner({
  feature,
  onUpgrade,
}: {
  feature: Feature;
  onUpgrade?: () => void;
}) {
  const requiredPlan = requiredTierLabel(feature);

  return (
    <div className="rounded-2xl bg-surface-1 border border-divider p-5 shadow-card">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-surface-2 border border-divider">
          <AppIcon name="lock" className="h-5 w-5 text-content-tertiary" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-content-primary">
            {requiredPlan} feature
          </p>
          <p className="mt-0.5 text-[10px] text-content-secondary leading-relaxed">
            This feature requires the {requiredPlan} plan. Upgrade to unlock
            the full experience.
          </p>
        </div>
      </div>
      {onUpgrade && (
        <button
          type="button"
          onClick={onUpgrade}
          className="mt-4 w-full rounded-full bg-brand hover:bg-brand-hover py-2.5 text-xs font-medium text-white transition-colors"
        >
          Upgrade to {requiredPlan}
        </button>
      )}
    </div>
  );
}
