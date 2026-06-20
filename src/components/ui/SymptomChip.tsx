import type { CycleCardVariant } from "@/lib/subscription/plan-card-theme";
import { PLAN_CARD_THEME } from "@/lib/subscription/plan-card-theme";

interface SymptomChipProps {
  label: string;
  icon?: string;
  active?: boolean;
  onToggle?: () => void;
  variant?: CycleCardVariant;
}

export function SymptomChip({
  label,
  icon,
  active = false,
  onToggle,
  variant = "default",
}: SymptomChipProps) {
  const isTier = variant === "plus" || variant === "premium";
  const theme = isTier ? PLAN_CARD_THEME[variant] : null;

  return (
    <button
      type="button"
      onClick={onToggle}
      className={`flex items-center gap-[7px] rounded-full border-[1.5px] px-3.5 py-[9px] text-[0.72rem] transition-all duration-150 active:scale-[0.97] ${
        active
          ? isTier
            ? theme!.chipActive
            : "border-rose-soft bg-rose-pale text-rose-deep"
          : "border-ink/[0.08] bg-surface text-ink-mid"
      }`}
    >
      {icon && <span>{icon}</span>}
      {label}
    </button>
  );
}
