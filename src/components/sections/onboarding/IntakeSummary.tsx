"use client";

import type { IntakeAnswers, IntakePlan } from "@/lib/intake";
import { AppShell } from "@/components/layout/AppShell";
import { BtnOutline, BtnRose } from "@/components/ui/Button";

interface IntakeSummaryProps {
  answers: IntakeAnswers;
  plan: IntakePlan;
  finishLabel?: string;
  onConfirm: () => void;
  onEdit: () => void;
  onBack?: () => void;
}

export function IntakeSummary({
  answers,
  plan,
  finishLabel = "Enter SheCare",
  onConfirm,
  onEdit,
  onBack,
}: IntakeSummaryProps) {
  const displayName = answers.name.trim() || "Friend";

  return (
    <AppShell hasNav={false} pullToRefresh={false} className="bg-gradient-to-b from-purple-light/30 to-cream">
      {onBack && (
        <button type="button" onClick={onBack} className="mb-3 text-xs text-gray-500">
          ← Back
        </button>
      )}
      <div className="mb-2">
        <h1 className="font-serif text-2xl text-purple-dark">Your care profile</h1>
        <p className="mt-1 text-xs text-gray-500">
          Prepared for {displayName} — compassionate guidance, not a diagnosis
        </p>
      </div>

      <div className="mb-4 space-y-2">
        {plan.summaryLines.map((line) => (
          <p key={line} className="text-xs leading-relaxed text-gray-700">
            {line}
          </p>
        ))}
      </div>

      <div className={`mb-4 rounded-2xl p-4 ${plan.severityColor}`}>
        <p className="text-[10px] font-medium uppercase tracking-wider opacity-70">Symptom burden</p>
        <p className="mt-1 font-serif text-2xl">{plan.severityLabel}</p>
        <p className="mt-1 text-xs opacity-80">
          {plan.score} symptoms noted — tracking over time helps your doctor
        </p>
      </div>

      {plan.showDoctorAlert && plan.doctorReason && (
        <div className="mb-4 rounded-2xl border border-pink-mid/30 bg-pink-light p-4">
          <p className="text-sm font-medium text-pink-dark">We recommend speaking with a gynecologist</p>
          <p className="mt-1 text-xs leading-relaxed text-gray-600">{plan.doctorReason}</p>
        </div>
      )}

      {plan.isIrregular && !plan.showDoctorAlert && (
        <div className="mb-4 rounded-xl bg-amber-light/60 px-3 py-2 text-[10px] text-amber-mid">
          Your cycle pattern may benefit from medical review — daily tracking here builds a clear history.
        </div>
      )}

      <div className="mb-4 rounded-2xl bg-white p-4 shadow-card">
        <p className="text-[10px] font-medium uppercase tracking-wider text-pink-mid">For you right now</p>
        <p className="mt-2 text-xs leading-relaxed text-gray-700">{plan.reassurance}</p>
      </div>

      <div className="mb-4 rounded-2xl bg-white p-4 shadow-card">
        <p className="text-[10px] font-medium uppercase tracking-wider text-pink-mid">Your goal plan</p>
        <p className="mt-2 text-xs leading-relaxed text-gray-700">{plan.goalAdvice}</p>
      </div>

      <div className="mb-4 rounded-2xl bg-white p-4 shadow-card">
        <p className="mb-3 text-sm font-medium text-purple-dark">Personalised tips</p>
        <ul className="space-y-2">
          {plan.topTips.map((tip) => (
            <li key={tip} className="flex items-start gap-2 text-xs text-gray-700">
              <span className="text-teal-mid">✓</span>
              {tip}
            </li>
          ))}
        </ul>
      </div>

      {plan.suggestedLearnTopics.length > 0 && (
        <div className="mb-4 rounded-2xl bg-teal-light/40 p-4">
          <p className="text-[10px] font-medium uppercase tracking-wider text-teal-dark">
            Explore in Learn
          </p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {plan.suggestedLearnTopics.map((topic) => (
              <span
                key={topic.id}
                className="rounded-full border border-teal-mid/30 bg-white px-2.5 py-1 text-[10px] text-teal-dark"
              >
                {topic.name}
              </span>
            ))}
          </div>
        </div>
      )}

      <p className="mb-4 rounded-xl bg-amber-light/60 px-3 py-2 text-[9px] leading-relaxed text-amber-mid">
        SheCare supports your journey — it does not replace a qualified doctor. Always seek professional care for urgent or worsening symptoms.
      </p>

      <div className="flex gap-2">
        <BtnOutline onClick={onEdit} className="flex-1">
          Edit answers
        </BtnOutline>
        <BtnRose onClick={onConfirm} className="flex-1">
          {finishLabel}
        </BtnRose>
      </div>
    </AppShell>
  );
}
