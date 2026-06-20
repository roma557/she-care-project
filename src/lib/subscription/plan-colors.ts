import type { PaidTier } from "@/lib/subscription/plans";

/** Background class for plan detail panels and plan cards. */
export const PLAN_PANEL_BG: Record<PaidTier, string> = {
  starter: "bg-plan-starter-light",
  plus: "bg-plan-plus-light",
  premium: "bg-plan-premium-light",
};

/** Tab pill styles for /starter, /plus, /premium routes and dev preview. */
export const PLAN_TAB_STYLES: Record<PaidTier, { active: string; idle: string }> = {
  starter: {
    active: "bg-plan-starter-light text-plan-starter-deep border-plan-starter-mid/30 shadow-sm",
    idle: "text-plan-starter-deep/70 hover:bg-plan-starter-light/50",
  },
  plus: {
    active: "bg-plan-plus-light text-plan-plus-deep border-plan-plus-mid/30 shadow-sm",
    idle: "text-plan-plus-mid hover:bg-plan-plus-light/50",
  },
  premium: {
    active: "bg-plan-premium-light text-plan-premium-deep border-plan-premium-mid/40 shadow-sm",
    idle: "text-plan-premium-deep/70 hover:bg-plan-premium-light/50",
  },
};

/** Accent text for plan headings inside detail panels. */
export const PLAN_HEADING_TEXT: Record<PaidTier, string> = {
  starter: "text-plan-starter-deep",
  plus: "text-plan-plus-deep",
  premium: "text-plan-premium-deep",
};

/** Accent for section labels and checkmarks in plan panels. */
export const PLAN_ACCENT_TEXT: Record<PaidTier, string> = {
  starter: "text-plan-starter-mid",
  plus: "text-plan-plus-mid",
  premium: "text-plan-premium-mid",
};

/** CTA button styles for plan checkout cards. */
export const PLAN_CTA_BUTTON: Record<PaidTier, string> = {
  starter: "bg-plan-starter-deep hover:bg-plan-starter-mid",
  plus: "bg-plan-plus-deep hover:bg-plan-plus-mid",
  premium: "bg-plan-premium-deep hover:bg-plan-premium-mid",
};
