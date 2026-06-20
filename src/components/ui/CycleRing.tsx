interface CycleRingProps {
  progress: number;
  size?: number;
  thin?: boolean;
}

const RADIUS = 30;
const CIRC = 2 * Math.PI * RADIUS;

export function CycleRing({ progress, size = 72, thin = false }: CycleRingProps) {
  const clamped = Math.min(1, Math.max(0, progress));
  const offset = CIRC * (1 - clamped);
  const strokeWidth = thin ? 3 : 5;

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
        strokeWidth={strokeWidth}
      />
      <circle
        cx="36"
        cy="36"
        r={RADIUS}
        fill="none"
        stroke="rgba(255,255,255,0.85)"
        strokeWidth={strokeWidth}
        strokeDasharray={CIRC}
        strokeDashoffset={offset}
        strokeLinecap="round"
      />
    </svg>
  );
}
