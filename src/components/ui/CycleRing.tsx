interface CycleRingProps {
  progress: number;
  size?: number;
}

const RADIUS = 30;
const CIRC = 2 * Math.PI * RADIUS;

export function CycleRing({ progress, size = 72 }: CycleRingProps) {
  const clamped = Math.min(1, Math.max(0, progress));
  const offset = CIRC * (1 - clamped);

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 72 72"
      style={{ transform: "rotate(-90deg)" }}
      aria-hidden
    >
      <circle
        cx="36"
        cy="36"
        r={RADIUS}
        fill="none"
        stroke="rgba(255,255,255,0.15)"
        strokeWidth="5"
      />
      <circle
        cx="36"
        cy="36"
        r={RADIUS}
        fill="none"
        stroke="rgba(255,255,255,0.75)"
        strokeWidth="5"
        strokeDasharray={CIRC}
        strokeDashoffset={offset}
        strokeLinecap="round"
      />
    </svg>
  );
}
