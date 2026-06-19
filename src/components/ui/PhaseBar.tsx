interface PhaseSegment {
  label: string;
  color: string;
  width: number;
}

const DEFAULT_PHASES: PhaseSegment[] = [
  { label: "Period", color: "#C4647A", width: 18 },
  { label: "Follicular", color: "#EDB8C2", width: 28 },
  { label: "Ovulation", color: "#D9899A", width: 4 },
  { label: "Luteal", color: "rgba(196,100,122,0.15)", width: 50 },
];

interface PhaseBarProps {
  phases?: PhaseSegment[];
}

export function PhaseBar({ phases = DEFAULT_PHASES }: PhaseBarProps) {
  return (
    <div>
      <div className="flex h-2 overflow-hidden rounded bg-rose-pale">
        {phases.map((p) => (
          <div
            key={p.label}
            style={{ width: `${p.width}%`, backgroundColor: p.color }}
            title={p.label}
          />
        ))}
      </div>
      <div className="mt-2.5 flex flex-wrap gap-x-4 gap-y-1">
        {phases.map((p) => (
          <span key={p.label} className="flex items-center gap-1.5 text-[0.65rem] text-ink-faint">
            <span
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: p.color }}
            />
            {p.label}
          </span>
        ))}
      </div>
    </div>
  );
}
