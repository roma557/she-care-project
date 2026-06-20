"use client";

import type { SubscriptionTier } from "@/lib/subscription/types";
import { ALL_PLAN_TIERS, getPlanPreviewInfo } from "@/lib/subscription/plan-preview";
import { getPlanLabel } from "@/lib/subscription";
import { PLAN_TAB_STYLES } from "@/lib/subscription/plan-colors";
import { useDevPlanPreview } from "@/context/DevPlanPreviewContext";
import { usePermissions } from "@/hooks/usePermissions";

const FREE_TAB_STYLES = {
  active: "bg-cream text-ink border-ink/20 shadow-sm",
  idle: "text-ink-mid hover:bg-cream/60",
};

function tabStylesForTier(tier: SubscriptionTier) {
  if (tier === "free") return FREE_TAB_STYLES;
  return PLAN_TAB_STYLES[tier];
}

export function PlanExploreBar() {
  const { setPreviewTier, isPreviewActive, routePreview } = useDevPlanPreview();
  const { tier, actualTier } = usePermissions();

  if (routePreview) return null;

  function handleSelect(target: SubscriptionTier) {
    if (target === actualTier) {
      setPreviewTier(null);
      return;
    }
    setPreviewTier(target);
  }

  function handleReset() {
    setPreviewTier(null);
  }

  return (
    <div className="mb-4 rounded-3xl border border-purple-light/60 bg-white p-4 shadow-card">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-[10px] font-medium uppercase tracking-wider text-purple-mid">
            Explore plans
          </p>
          <p className="mt-0.5 text-[10px] text-gray-500">
            Preview Starter, Plus &amp; Premium on your phone
          </p>
        </div>
        {isPreviewActive && (
          <button
            type="button"
            onClick={handleReset}
            className="shrink-0 rounded-full border border-purple-light px-2.5 py-1 text-[10px] font-medium text-purple-mid"
          >
            Reset
          </button>
        )}
      </div>

      {isPreviewActive && (
        <p className="mt-2 rounded-xl bg-purple-light/40 px-3 py-2 text-[10px] text-purple-dark">
          Previewing <span className="font-medium">{getPlanLabel(tier)}</span> — your subscription
          stays on {getPlanLabel(actualTier)}.
        </p>
      )}

      <div className="mt-3 flex flex-wrap gap-1.5">
        {ALL_PLAN_TIERS.map((planTier) => {
          const preview = getPlanPreviewInfo(planTier);
          const isActive = tier === planTier;
          const styles = tabStylesForTier(planTier);
          return (
            <button
              key={planTier}
              type="button"
              onClick={() => handleSelect(planTier)}
              className={`rounded-full border px-3 py-1.5 text-[10px] font-medium transition-colors ${
                isActive ? styles.active : `border-transparent ${styles.idle}`
              }`}
              aria-pressed={isActive}
            >
              {preview.name}
            </button>
          );
        })}
      </div>
    </div>
  );
}
