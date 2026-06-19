interface BackButtonProps {
  onClick: () => void;
  className?: string;
}

export function BackButton({ onClick, className = "" }: BackButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-rose-pale text-base text-ink-mid transition-opacity active:opacity-70 ${className}`}
      aria-label="Go back"
    >
      ←
    </button>
  );
}
