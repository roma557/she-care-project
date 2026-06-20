"use client";

import type { PaidTier } from "@/lib/subscription/plans";
import { PLANS } from "@/lib/subscription/plans";

interface UpgradePromptProps {
  feature: string;
  requiredTier: PaidTier;
  onUpgrade?: (tier: PaidTier) => void;
  compact?: boolean;
}

export function UpgradePrompt({ feature, requiredTier, onUpgrade, compact }: UpgradePromptProps) {
  const plan = PLANS[requiredTier];

  return (
    <div
      className={`rounded-card border border-rose-pale bg-rose-pale/40 ${compact ? "p-3" : "p-4"}`}
    >
      <p className="text-[0.65rem] font-medium uppercase tracking-wider text-rose-deep">
        {plan.name} feature
      </p>
      <p className={`mt-1 text-ink-mid ${compact ? "text-[0.7rem]" : "text-xs"}`}>
        {feature} requires {plan.name} (₹{plan.monthlyPrice}/mo).
      </p>
      <button
        type="button"
        onClick={() => onUpgrade?.(requiredTier)}
        className="mt-3 w-full rounded-full bg-rose-deep py-2 text-[0.7rem] font-medium text-white"
      >
        Upgrade to {plan.name}
      </button>
    </div>
  );
}
