export type PlanCardTier = "plus" | "premium";

export type CycleCardVariant = "default" | PlanCardTier;

export const CYCLE_CARD_GRADIENT: Record<CycleCardVariant, string> = {
  default: "from-[#D97090] via-[#C4587A] to-[#A84060]",
  plus: "from-plan-plus-mid via-plan-plus-deep to-plan-plus-deep",
  premium: "from-[#D4AF37] via-plan-premium-mid to-plan-premium-dark",
};

export const CYCLE_CARD_SHADOW: Record<CycleCardVariant, string> = {
  default: "shadow-cycle-card",
  plus: "shadow-[0_8px_32px_rgba(74,45,122,0.25)]",
  premium: "shadow-[0_8px_32px_rgba(139,105,20,0.35)]",
};

export const PLAN_CARD_THEME = {
  plus: {
    gradient: CYCLE_CARD_GRADIENT.plus,
    shadow: CYCLE_CARD_SHADOW.plus,
    accentDot: "bg-plan-plus-deep",
    icon: "text-plan-plus-mid",
    sectionLabel: "text-plan-plus-mid/80",
    link: "text-plan-plus-deep",
    chipActive: "border-plan-plus-mid/40 bg-plan-plus-light text-plan-plus-deep",
    insightCard:
      "border-plan-plus-mid/20 bg-gradient-to-br from-plan-plus-light/80 to-plan-plus-mid/10",
    insightIcon: "text-plan-plus-deep",
    footnote: "SheCare Plus",
  },
  premium: {
    gradient: CYCLE_CARD_GRADIENT.premium,
    shadow: CYCLE_CARD_SHADOW.premium,
    accentDot: "bg-plan-premium-deep",
    icon: "text-plan-premium-mid",
    sectionLabel: "text-plan-premium-mid/80",
    link: "text-plan-premium-deep",
    chipActive: "border-plan-premium-mid/40 bg-plan-premium-light text-plan-premium-deep",
    insightCard:
      "border-plan-premium-mid/20 bg-gradient-to-br from-plan-premium-light/80 to-plan-premium-mid/10",
    insightIcon: "text-plan-premium-deep",
    footnote: "SheCare Premium",
  },
} as const;

export const PLAN_CARD_SHELL = "relative overflow-hidden rounded-[28px] bg-gradient-to-br";

export const PLAN_CARD_ORB_TOP =
  "pointer-events-none absolute -right-8 -top-8 h-[120px] w-[120px] rounded-full bg-white/[0.08]";

export const PLAN_CARD_ORB_BOTTOM =
  "pointer-events-none absolute -bottom-12 -left-8 h-[100px] w-[100px] rounded-full bg-black/[0.06]";

export const PLAN_CARD_LABEL =
  "text-[0.6rem] font-medium uppercase tracking-[0.18em] text-white/65";

export const PLAN_CARD_TITLE =
  "font-serif text-[1.65rem] italic leading-tight text-white";

export const PLAN_CARD_BODY = "text-xs font-light text-white/80";

export const PLAN_CARD_DIVIDER = "border-t border-white/15";

export const PLAN_CARD_STAT_LABEL =
  "text-[0.55rem] font-medium uppercase tracking-[0.18em] text-white/60";

export const PLAN_CARD_STAT_VALUE = "mt-1 font-sans text-sm font-semibold text-white";

export const PLAN_CARD_GLASS_TILE =
  "rounded-2xl border border-white/15 bg-white/10 p-3 text-left transition-colors duration-perf hover:bg-white/15 active:opacity-90";

export const PLAN_CARD_GLASS_STRIP =
  "bg-black/20 transition-colors duration-perf hover:bg-black/25";

export const PLAN_CARD_FOOTNOTE =
  "mt-2 text-center text-[0.55rem] font-medium uppercase tracking-[0.14em] text-ink-faint/70";

export function planCardShellClasses(tier: PlanCardTier): string {
  const theme = PLAN_CARD_THEME[tier];
  return `${PLAN_CARD_SHELL} ${theme.gradient} ${theme.shadow}`;
}
