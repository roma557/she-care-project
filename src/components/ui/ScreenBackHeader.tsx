interface ScreenBackHeaderProps {
  title: string;
  subtitle?: string;
  onBack: () => void;
}

export function ScreenBackHeader({ title, subtitle, onBack }: ScreenBackHeaderProps) {
  return (
    <div className="mb-5 flex items-start gap-3">
      <button
        type="button"
        onClick={onBack}
        className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white shadow-card"
        aria-label="Go back"
      >
        <svg className="h-4 w-4 text-purple-dark" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      <div>
        <h1 className="font-serif text-xl font-semibold text-purple-dark">{title}</h1>
        {subtitle && <p className="mt-0.5 text-xs text-gray-500">{subtitle}</p>}
      </div>
    </div>
  );
}
