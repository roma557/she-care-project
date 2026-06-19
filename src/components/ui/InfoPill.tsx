import { ReactNode } from "react";

interface InfoPillProps {
  icon?: ReactNode;
  children: ReactNode;
}

export function InfoPill({ icon, children }: InfoPillProps) {
  return (
    <div className="flex items-start gap-2.5 rounded-[14px] bg-rose-pale px-4 py-[13px]">
      {icon && <span className="mt-0.5 shrink-0 text-sm text-rose-deep">{icon}</span>}
      <p className="text-[0.7rem] font-light leading-relaxed text-ink-mid">{children}</p>
    </div>
  );
}
