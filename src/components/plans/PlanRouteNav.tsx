"use client";

import Link from "next/link";
import type { SubscriptionTier } from "@/lib/subscription/types";
import {
  ALL_PLAN_TIERS,
  getPlanPreviewInfo,
  planPreviewPath,
} from "@/lib/subscription/plan-preview";
import { PLAN_TAB_STYLES } from "@/lib/subscription/plan-colors";

const FREE_TAB_STYLES = {
  active: "bg-cream text-ink border-ink/20 shadow-sm",
  idle: "text-ink-mid hover:bg-cream/60",
};

function tabStylesForTier(tier: SubscriptionTier) {
  if (tier === "free") return FREE_TAB_STYLES;
  return PLAN_TAB_STYLES[tier];
}

interface PlanRouteNavProps {
  activeTier: SubscriptionTier;
}

export function PlanRouteNav({ activeTier }: PlanRouteNavProps) {
  return (
    <div className="dev-plan-tabs hidden md:block">
      <div className="dev-plan-tabs-bar">
        <div className="flex flex-wrap items-center gap-2">
          <span className="dev-plan-tabs-label">Plan preview</span>
          <div className="flex flex-wrap gap-1.5">
            {ALL_PLAN_TIERS.map((tier) => {
              const preview = getPlanPreviewInfo(tier);
              const isActive = activeTier === tier;
              const styles = tabStylesForTier(tier);
              return (
                <Link
                  key={tier}
                  href={planPreviewPath(tier)}
                  className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                    isActive ? styles.active : `border-transparent ${styles.idle}`
                  }`}
                  aria-current={isActive ? "page" : undefined}
                >
                  {preview.name}
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
