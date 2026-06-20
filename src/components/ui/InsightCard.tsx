import { AppIcon, IconName } from "@/components/ui/icons";
import type { CycleCardVariant } from "@/lib/subscription/plan-card-theme";
import { PLAN_CARD_THEME } from "@/lib/subscription/plan-card-theme";

interface InsightCardProps {
  icon: IconName;
  title: string;
  value: string;
  unit?: string;
  onClick?: () => void;
  variant?: CycleCardVariant;
}

export function InsightCard({ icon, title, value, unit, onClick, variant = "default" }: InsightCardProps) {
  const Tag = onClick ? "button" : "div";
  const isTier = variant === "plus" || variant === "premium";
  const theme = isTier ? PLAN_CARD_THEME[variant] : null;

  return (
    <Tag
      type={onClick ? "button" : undefined}
      onClick={onClick}
      className={`w-[140px] shrink-0 rounded-card p-4 text-left transition-transform active:scale-[0.98] ${
        isTier
          ? `${theme!.insightCard} shadow-[0_4px_16px_rgba(42,26,31,0.06)]`
          : "border border-ink/[0.05] bg-surface shadow-card"
      }`}
    >
      <AppIcon
        name={icon}
        className={`h-5 w-5 ${isTier ? theme!.insightIcon : "text-rose-deep"}`}
      />
      <p
        className={`mt-2 text-[0.65rem] font-medium uppercase tracking-wider ${
          isTier ? theme!.sectionLabel : "text-ink-faint"
        }`}
      >
        {title}
      </p>
      <p className="mt-1 font-serif text-2xl text-ink">
        {value}
        {unit && (
          <span className="ml-0.5 font-sans text-xs font-light text-ink-mid">{unit}</span>
        )}
      </p>
    </Tag>
  );
}
