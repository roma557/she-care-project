"use client";

import { ReactNode } from "react";
import { AppIcon, IconName } from "@/components/ui/icons";
import type { PlanCardTier } from "@/lib/subscription/plan-card-theme";
import {
  PLAN_CARD_BODY,
  PLAN_CARD_DIVIDER,
  PLAN_CARD_FOOTNOTE,
  PLAN_CARD_GLASS_STRIP,
  PLAN_CARD_GLASS_TILE,
  PLAN_CARD_LABEL,
  PLAN_CARD_ORB_BOTTOM,
  PLAN_CARD_ORB_TOP,
  PLAN_CARD_STAT_LABEL,
  PLAN_CARD_STAT_VALUE,
  PLAN_CARD_TITLE,
  planCardShellClasses,
} from "@/lib/subscription/plan-card-theme";

interface PlanGlassCardProps {
  tier: PlanCardTier;
  footnote?: string;
  children: ReactNode;
  className?: string;
}

export function PlanGlassCard({ tier, footnote, children, className = "" }: PlanGlassCardProps) {
  return (
    <div>
      <div className={`${planCardShellClasses(tier)} p-[22px_24px_20px] ${className}`}>
        <div className={PLAN_CARD_ORB_TOP} aria-hidden />
        <div className={PLAN_CARD_ORB_BOTTOM} aria-hidden />
        <div className="relative">{children}</div>
      </div>
      {footnote && <p className={PLAN_CARD_FOOTNOTE}>{footnote}</p>}
    </div>
  );
}

export function PlanGlassHeader({
  label,
  title,
  subtitle,
}: {
  label: string;
  title: string;
  subtitle?: string;
}) {
  return (
    <div>
      <p className={PLAN_CARD_LABEL}>{label}</p>
      <h2 className={`mt-1 ${PLAN_CARD_TITLE}`}>{title}</h2>
      {subtitle && <p className={`mt-1 ${PLAN_CARD_BODY}`}>{subtitle}</p>}
    </div>
  );
}

export function PlanGlassDivider({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`relative mt-5 ${PLAN_CARD_DIVIDER} pt-4 ${className}`}>{children}</div>
  );
}

export function PlanGlassStatRow({ stats }: { stats: { label: string; value: string }[] }) {
  return (
    <div className={`grid gap-2 ${stats.length === 3 ? "grid-cols-3" : "grid-cols-2"}`}>
      {stats.map((stat) => (
        <div key={stat.label} className="text-center">
          <p className={PLAN_CARD_STAT_LABEL}>{stat.label}</p>
          <p className={PLAN_CARD_STAT_VALUE}>{stat.value}</p>
        </div>
      ))}
    </div>
  );
}

export function PlanGlassSectionLabel({ children }: { children: ReactNode }) {
  return (
    <p className="text-[0.6rem] font-medium uppercase tracking-[0.15em] text-white/65">{children}</p>
  );
}

interface PlanGlassActionTileProps {
  icon: IconName;
  title: string;
  description: string;
  onClick?: () => void;
  href?: string;
}

export function PlanGlassActionTile({ icon, title, description, onClick, href }: PlanGlassActionTileProps) {
  const content = (
    <>
      <AppIcon name={icon} className="h-5 w-5 text-white/85" />
      <p className="mt-2 text-xs font-medium text-white">{title}</p>
      <p className="mt-0.5 text-[10px] leading-snug text-white/70">{description}</p>
    </>
  );

  if (href) {
    return (
      <a href={href} className={`block ${PLAN_CARD_GLASS_TILE}`}>
        {content}
      </a>
    );
  }

  return (
    <button type="button" onClick={onClick} className={PLAN_CARD_GLASS_TILE}>
      {content}
    </button>
  );
}

interface PlanGlassFeatureRowProps {
  icon: IconName;
  title: string;
  description: string;
  onClick?: () => void;
  href?: string;
}

export function PlanGlassFeatureRow({ icon, title, description, onClick, href }: PlanGlassFeatureRowProps) {
  const inner = (
    <>
      <AppIcon name={icon} className="h-4 w-4 shrink-0 text-white/80" />
      <span className="min-w-0 flex-1">
        <span className="block text-xs text-white/90">{title}</span>
        <span className="block text-[10px] text-white/60">{description}</span>
      </span>
      <span className="shrink-0 text-[0.65rem] text-white/50">→</span>
    </>
  );

  const className = `-mx-6 flex w-[calc(100%+3rem)] items-center gap-3 px-6 py-3 text-left ${PLAN_CARD_GLASS_STRIP}`;

  if (href) {
    return (
      <a href={href} className={className}>
        {inner}
      </a>
    );
  }

  return (
    <button type="button" onClick={onClick} className={className}>
      {inner}
    </button>
  );
}
