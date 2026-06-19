import { ReactNode } from "react";

interface SectionLabelProps {
  children: ReactNode;
  className?: string;
}

export function SectionLabel({ children, className = "" }: SectionLabelProps) {
  return (
    <p
      className={`px-0 pb-2.5 pt-5 font-sans text-[0.6rem] font-medium uppercase tracking-[0.2em] text-ink-faint ${className}`}
    >
      {children}
    </p>
  );
}
