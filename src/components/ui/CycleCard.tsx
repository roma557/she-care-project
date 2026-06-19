import { ReactNode } from "react";
import { CycleRing } from "./CycleRing";

interface CycleCardProps {
  phaseName: string;
  cycleDay: number;
  cycleLength: number;
  message?: string;
  children?: ReactNode;
}

export function CycleCard({
  phaseName,
  cycleDay,
  cycleLength,
  message,
  children,
}: CycleCardProps) {
  const progress = cycleDay / cycleLength;

  return (
    <div className="relative overflow-hidden rounded-[24px] bg-gradient-to-br from-[#D97090] via-[#C4587A] to-[#A84060] p-[22px_24px] shadow-cycle-card">
      <div
        className="pointer-events-none absolute -right-10 -top-10 h-[140px] w-[140px] rounded-full bg-white/[0.07]"
        aria-hidden
      />
      <div className="relative flex items-center justify-between gap-4">
        <div className="flex-1">
          <p className="text-[0.65rem] font-medium uppercase tracking-[0.15em] text-white/70">
            Current phase
          </p>
          <h2 className="mt-1 font-serif text-2xl italic text-white">{phaseName}</h2>
          <p className="mt-1 text-xs font-light text-white/80">
            Day {cycleDay} of {cycleLength}
          </p>
          {message && (
            <p className="mt-2 text-[0.72rem] font-light leading-relaxed text-white/75">
              {message}
            </p>
          )}
        </div>
        <div className="relative flex shrink-0 items-center justify-center">
          <CycleRing progress={progress} />
          <span className="absolute font-serif text-lg text-white">{cycleDay}</span>
        </div>
      </div>
      {children}
    </div>
  );
}
