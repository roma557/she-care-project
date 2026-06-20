"use client";

import { useState } from "react";
import type { AppScreen } from "@/lib/phone";
import { PLANS } from "@/lib/subscription/plans";
import { PLAN_CARD_THEME } from "@/lib/subscription/plan-card-theme";
import { getPlanHomeDashboard, type PlanHomeFeature } from "@/lib/subscription/home-dashboard";
import {
  PlanGlassActionTile,
  PlanGlassCard,
  PlanGlassDivider,
  PlanGlassFeatureRow,
  PlanGlassHeader,
  PlanGlassSectionLabel,
  PlanGlassStatRow,
} from "@/components/ui/PlanGlassCard";

interface PlanHomeDashboardProps {
  tier: "plus" | "premium";
  onNavigate: (screen: AppScreen) => void;
}

export function PlanHomeDashboard({ tier, onNavigate }: PlanHomeDashboardProps) {
  const config = getPlanHomeDashboard(tier);
  const plan = PLANS[tier];
  const theme = PLAN_CARD_THEME[tier];
  const [featuresExpanded, setFeaturesExpanded] = useState(false);

  return (
    <PlanGlassCard
      tier={tier}
      footnote={`${theme.footnote} · Quick access`}
      className="mt-3"
    >
      <PlanGlassHeader
        label={`Your plan · ${plan.name}`}
        title={config.headline}
        subtitle={config.subheadline}
      />

      <PlanGlassDivider>
        <PlanGlassStatRow stats={config.stats} />
      </PlanGlassDivider>

      <PlanGlassDivider>
        <PlanGlassSectionLabel>Quick actions</PlanGlassSectionLabel>
        <div className="mt-3 grid grid-cols-2 gap-2">
          {config.quickActions.map((item) => (
            <PlanGlassActionTile
              key={item.title}
              icon={item.icon}
              title={item.title}
              description={item.description}
              href={item.href}
              onClick={item.screen ? () => onNavigate(item.screen!) : undefined}
            />
          ))}
        </div>
      </PlanGlassDivider>

      <PlanGlassDivider className="pb-0">
        <button
          type="button"
          onClick={() => setFeaturesExpanded((v) => !v)}
          className="flex w-full items-center justify-between text-left"
        >
          <PlanGlassSectionLabel>Included features</PlanGlassSectionLabel>
          <span className="text-[0.6rem] uppercase tracking-[0.12em] text-white/50">
            {featuresExpanded ? "Hide" : "Show"}
          </span>
        </button>

        {featuresExpanded && (
          <div className="relative mt-3 -mx-6 divide-y divide-white/10 overflow-hidden rounded-none">
            {config.features.map((item) => (
              <FeatureRow key={item.title} item={item} onNavigate={onNavigate} />
            ))}
          </div>
        )}
      </PlanGlassDivider>
    </PlanGlassCard>
  );
}

function FeatureRow({
  item,
  onNavigate,
}: {
  item: PlanHomeFeature;
  onNavigate: (screen: AppScreen) => void;
}) {
  return (
    <PlanGlassFeatureRow
      icon={item.icon}
      title={item.title}
      description={item.description}
      href={item.href}
      onClick={item.screen ? () => onNavigate(item.screen!) : undefined}
    />
  );
}
