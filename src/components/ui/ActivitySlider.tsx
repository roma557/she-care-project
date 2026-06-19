"use client";

interface ActivitySliderProps {
  value: number;
  onChange: (value: number) => void;
  labels?: [string, string, string];
}

export function ActivitySlider({
  value,
  onChange,
  labels = ["Low", "Moderate", "High"],
}: ActivitySliderProps) {
  return (
    <div>
      <input
        type="range"
        min={0}
        max={100}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="she-slider"
        style={{
          background: `linear-gradient(90deg, #C4647A ${value}%, #F9EDF0 ${value}%)`,
        }}
      />
      <div className="mt-2 flex justify-between text-[0.65rem] text-ink-faint">
        {labels.map((l) => (
          <span key={l}>{l}</span>
        ))}
      </div>
    </div>
  );
}
