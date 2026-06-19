import { ReactNode } from "react";
import { BackButton } from "@/components/ui/BackButton";

interface ScreenBackHeaderProps {
  title: string;
  subtitle?: string;
  onBack: () => void;
}

export function ScreenBackHeader({ title, subtitle, onBack }: ScreenBackHeaderProps) {
  return (
    <div className="mb-5 flex items-start gap-3">
      <BackButton onClick={onBack} />
      <div>
        <h1 className="font-serif text-xl italic text-ink">{title}</h1>
        {subtitle && <p className="mt-0.5 text-xs font-light text-ink-mid">{subtitle}</p>}
      </div>
    </div>
  );
}
