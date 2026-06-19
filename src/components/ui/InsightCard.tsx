interface InsightCardProps {
  icon: string;
  title: string;
  value: string;
  unit?: string;
}

export function InsightCard({ icon, title, value, unit }: InsightCardProps) {
  return (
    <div className="w-[140px] shrink-0 rounded-card border border-ink/[0.05] bg-surface p-4 shadow-card">
      <span className="text-xl">{icon}</span>
      <p className="mt-2 text-[0.65rem] font-medium uppercase tracking-wider text-ink-faint">
        {title}
      </p>
      <p className="mt-1 font-serif text-2xl text-ink">
        {value}
        {unit && (
          <span className="ml-0.5 font-sans text-xs font-light text-ink-mid">{unit}</span>
        )}
      </p>
    </div>
  );
}
