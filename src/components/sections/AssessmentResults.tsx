import { AppShell } from "@/components/layout/AppShell";
import { ScreenBackHeader } from "@/components/ui/ScreenBackHeader";
import { AssessmentResult } from "@/lib/assessment";

interface AssessmentResultsProps {
  result: AssessmentResult;
  onBack: () => void;
  onRetake: () => void;
}

export function AssessmentResults({ result, onBack, onRetake }: AssessmentResultsProps) {
  return (
    <AppShell hasNav={false} className="bg-gradient-to-b from-purple-light/30 to-cream">
      <ScreenBackHeader title="Your Results" subtitle="Personalised health profile" onBack={onBack} />

      <div className={`mb-4 rounded-2xl p-4 ${result.severityColor}`}>
        <p className="text-[10px] font-medium uppercase tracking-wider opacity-70">Symptom severity</p>
        <p className="mt-1 font-serif text-2xl">{result.severityLabel}</p>
        <p className="mt-1 text-xs opacity-80">Score: {result.score} / 12</p>
      </div>

      {result.showDoctorAlert && (
        <div className="mb-4 rounded-2xl border border-pink-mid/30 bg-pink-light p-4">
          <p className="text-sm font-medium text-pink-dark">We recommend seeing a gynecologist</p>
          <p className="mt-1 text-xs text-gray-600">
            Irregular cycles combined with significant symptoms warrant professional evaluation.
          </p>
        </div>
      )}

      {result.isIrregular && !result.showDoctorAlert && (
        <div className="mb-4 rounded-xl bg-amber-light/60 px-3 py-2 text-[10px] text-amber-mid">
          Your cycle appears irregular — tracking daily and sharing with your doctor is recommended.
        </div>
      )}

      <div className="mb-4 rounded-2xl bg-white p-4 shadow-card">
        <p className="text-[10px] font-medium uppercase tracking-wider text-pink-mid">Your goal plan</p>
        <p className="mt-2 text-xs leading-relaxed text-gray-700">{result.goalAdvice}</p>
      </div>

      <div className="mb-4 rounded-2xl bg-white p-4 shadow-card">
        <p className="mb-3 text-sm font-medium text-purple-dark">Top tips for you</p>
        <ul className="space-y-2">
          {result.topTips.map((tip) => (
            <li key={tip} className="flex items-start gap-2 text-xs text-gray-700">
              <span className="text-teal-mid">✓</span>
              {tip}
            </li>
          ))}
        </ul>
      </div>

      <p className="mb-4 rounded-xl bg-amber-light/60 px-3 py-2 text-[9px] leading-relaxed text-amber-mid">
        This assessment supplements — not replaces — professional medical advice. Always consult a gynecologist.
      </p>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={onRetake}
          className="flex-1 rounded-full border border-pink-light py-2.5 text-xs font-medium text-pink-mid"
        >
          Retake
        </button>
        <button
          type="button"
          onClick={onBack}
          className="flex-1 rounded-full bg-pink-mid py-2.5 text-xs font-medium text-white"
        >
          Done
        </button>
      </div>
    </AppShell>
  );
}
