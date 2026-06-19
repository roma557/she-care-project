interface ProgressBarProps {
  progress: number;
  className?: string;
}

export function ProgressBar({ progress, className = "" }: ProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, progress));

  return (
    <div className={`h-[3px] w-full rounded-sm bg-rose-pale ${className}`}>
      <div
        className="h-full rounded-sm bg-gradient-to-r from-rose-soft to-rose-deep transition-[width] duration-500 ease-out"
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
}
