"use client";

interface TagProps {
  label: string;
  selected?: boolean;
  variant?: "rose" | "dark";
  onToggle?: () => void;
}

export function Tag({ label, selected = false, variant = "dark", onToggle }: TagProps) {
  const base =
    "rounded-full border-[1.5px] px-4 py-[9px] font-sans text-[0.73rem] font-normal transition-all duration-[180ms] active:scale-[0.97]";

  const stateClass =
    variant === "rose"
      ? selected
        ? "border-rose-deep bg-rose-deep text-white"
        : "border-ink/10 bg-transparent text-ink-mid"
      : selected
        ? "border-ink bg-ink text-bg"
        : "border-ink/10 bg-transparent text-ink-mid";

  return (
    <button type="button" onClick={onToggle} className={`${base} ${stateClass}`}>
      {label}
    </button>
  );
}
