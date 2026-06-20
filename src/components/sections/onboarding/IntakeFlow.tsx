"use client";

import { useState } from "react";
import type { IntakeAnswers, IntakePlan, IntakeStep } from "@/lib/intake";
import {
  BLEEDING_PATTERN_OPTIONS,
  buildIntakePlan,
  CYCLE_REGULARITY_OPTIONS,
  DIETARY_INTAKE_OPTIONS,
  EMOTIONAL_STATE_OPTIONS,
  EMPTY_INTAKE_ANSWERS,
  INTAKE_AGE_OPTIONS,
  PERIOD_PAIN_OPTIONS,
  PRIMARY_GOAL_OPTIONS,
  SLEEP_QUALITY_OPTIONS,
} from "@/lib/intake";
import { AppShell } from "@/components/layout/AppShell";
import { BackButton } from "@/components/ui/BackButton";
import { BtnRose } from "@/components/ui/Button";
import { DrumPicker } from "@/components/ui/DrumPicker";
import { InfoPill } from "@/components/ui/InfoPill";
import { AppIcon } from "@/components/ui/icons";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { Tag } from "@/components/ui/Tag";
import { ActivitySlider } from "@/components/ui/ActivitySlider";
import { IntakeSummary } from "@/components/sections/onboarding/IntakeSummary";

interface IntakeFlowProps {
  steps: IntakeStep[];
  initialAnswers?: Partial<IntakeAnswers>;
  onComplete: (answers: IntakeAnswers, plan: IntakePlan) => void;
  onBackFromFirst?: () => void;
  showSummaryOnComplete?: boolean;
  finishLabel?: string;
}

function toggleList(list: string[], item: string): string[] {
  return list.includes(item) ? list.filter((x) => x !== item) : [...list, item];
}

function OptionButton({
  label,
  selected,
  onClick,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full rounded-2xl px-4 py-3 text-left text-xs transition-colors ${
        selected
          ? "bg-rose-deep text-white shadow-card"
          : "border border-rose-pale bg-surface text-ink-mid"
      }`}
    >
      {label}
    </button>
  );
}

export function IntakeFlow({
  steps,
  initialAnswers,
  onComplete,
  onBackFromFirst,
  showSummaryOnComplete = true,
  finishLabel = "Enter SheCare",
}: IntakeFlowProps) {
  const [stepIndex, setStepIndex] = useState(0);
  const [answers, setAnswers] = useState<IntakeAnswers>({
    ...EMPTY_INTAKE_ANSWERS,
    ...initialAnswers,
  });
  const [plan, setPlan] = useState<IntakePlan | null>(null);

  const step = steps[stepIndex];
  const progress = ((stepIndex + 1) / steps.length) * 100;

  function patch(partial: Partial<IntakeAnswers>) {
    setAnswers((prev) => ({ ...prev, ...partial }));
  }

  function canProceed(): boolean {
    if (!step) return false;
    switch (step.kind) {
      case "about-you":
        return !!answers.age;
      case "multi":
        if (step.field === "diagnoses") return answers.diagnoses.length > 0;
        return (answers[step.field!] as string[]).length > 0;
      case "cycle-length":
        return answers.cycleLength >= 15;
      case "cycle-health":
        return !!(answers.cycleRegularity && answers.bleedingPattern && answers.periodPain);
      case "symptoms":
        return true;
      case "lifestyle":
        return !!answers.sleepQuality;
      case "goals":
        return !!(answers.primaryGoal && answers.emotionalState);
      default:
        return true;
    }
  }

  function handleNext() {
    if (stepIndex < steps.length - 1) {
      setStepIndex((i) => i + 1);
      return;
    }
    const built = buildIntakePlan(answers);
    if (showSummaryOnComplete) {
      setPlan(built);
    } else {
      onComplete(answers, built);
    }
  }

  function handleBack() {
    if (stepIndex === 0) onBackFromFirst?.();
    else setStepIndex((i) => i - 1);
  }

  if (plan) {
    return (
      <IntakeSummary
        answers={answers}
        plan={plan}
        finishLabel={finishLabel}
        onConfirm={() => onComplete(answers, plan)}
        onEdit={() => setPlan(null)}
      />
    );
  }

  if (!step) return null;

  return (
    <AppShell hasNav={false} pullToRefresh={false} className="bg-bg">
      <div className="mb-6 flex items-center gap-3">
        {(stepIndex > 0 || onBackFromFirst) && <BackButton onClick={handleBack} />}
        <ProgressBar progress={progress} className="flex-1" />
      </div>

      <p className="text-[0.65rem] font-medium uppercase tracking-[0.2em] text-rose-deep">
        Step {step.stepNumber} of {step.totalSteps}
      </p>
      <h2 className="mt-3 font-serif text-[1.75rem] italic leading-tight text-ink">{step.title}</h2>
      <p className="mt-2 text-sm font-light text-ink-mid">{step.subtitle}</p>

      <div className="my-6">{renderStepBody(step, answers, patch)}</div>

      {step.infoPill && (
        <div className="mb-4">
          <InfoPill icon={<AppIcon name="info" className="h-4 w-4" />}>{step.infoPill}</InfoPill>
        </div>
      )}

      <div className="mt-auto pt-4">
        <BtnRose onClick={handleNext} disabled={!canProceed()}>
          {stepIndex < steps.length - 1 ? "Continue" : "See my care profile"}
        </BtnRose>
      </div>
    </AppShell>
  );
}

function renderStepBody(
  step: IntakeStep,
  answers: IntakeAnswers,
  patch: (p: Partial<IntakeAnswers>) => void,
) {
  switch (step.kind) {
    case "about-you":
      return (
        <div className="space-y-5">
          <div>
            <label className="text-[10px] font-medium uppercase tracking-wider text-ink-faint">
              First name (optional)
            </label>
            <input
              type="text"
              value={answers.name}
              onChange={(e) => patch({ name: e.target.value })}
              placeholder="What should we call you?"
              className="mt-2 w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-ink outline-none placeholder:text-ink-faint"
            />
          </div>
          <div>
            <label className="text-[10px] font-medium uppercase tracking-wider text-ink-faint">
              Age range
            </label>
            <div className="mt-2 space-y-2">
              {INTAKE_AGE_OPTIONS.map((opt) => (
                <OptionButton
                  key={opt.value}
                  label={opt.label}
                  selected={answers.age === opt.value}
                  onClick={() => patch({ age: opt.value })}
                />
              ))}
            </div>
          </div>
        </div>
      );

    case "multi": {
      const field = step.field!;
      const selected = answers[field] as string[];
      return (
        <div className="space-y-2">
          {step.options?.map((opt) => (
            <OptionButton
              key={opt.value}
              label={opt.label}
              selected={selected.includes(opt.value)}
              onClick={() => {
                let next = toggleList(selected, opt.value);
                if (field === "diagnoses" && opt.value === "none") {
                  next = next.includes("none") ? ["none"] : next.filter((v) => v !== "none");
                } else if (field === "diagnoses") {
                  next = next.filter((v) => v !== "none");
                }
                patch({ [field]: next });
              }}
            />
          ))}
          {field === "diagnoses" && selected.length === 0 && (
            <p className="text-[10px] text-ink-faint">Tap &quot;None yet&quot; if you&apos;re still exploring.</p>
          )}
        </div>
      );
    }

    case "cycle-length":
      return (
        <div>
          <DrumPicker
            min={15}
            max={45}
            value={answers.cycleLength}
            onChange={(v) => patch({ cycleLength: v })}
          />
          <p className="mt-2 text-center text-xs font-light text-ink-faint">days per cycle</p>
        </div>
      );

    case "cycle-health":
      return (
        <div className="space-y-5">
          <div>
            <SectionLabel>Cycle regularity</SectionLabel>
            <div className="space-y-2">
              {CYCLE_REGULARITY_OPTIONS.map((opt) => (
                <OptionButton
                  key={opt.value}
                  label={opt.label}
                  selected={answers.cycleRegularity === opt.value}
                  onClick={() => patch({ cycleRegularity: opt.value })}
                />
              ))}
            </div>
          </div>
          <div>
            <SectionLabel>Bleeding pattern</SectionLabel>
            <div className="space-y-2">
              {BLEEDING_PATTERN_OPTIONS.map((opt) => (
                <OptionButton
                  key={opt.value}
                  label={opt.label}
                  selected={answers.bleedingPattern === opt.value}
                  onClick={() => patch({ bleedingPattern: opt.value })}
                />
              ))}
            </div>
          </div>
          <div>
            <SectionLabel>Period pain</SectionLabel>
            <div className="space-y-2">
              {PERIOD_PAIN_OPTIONS.map((opt) => (
                <OptionButton
                  key={opt.value}
                  label={opt.label}
                  selected={answers.periodPain === opt.value}
                  onClick={() => patch({ periodPain: opt.value })}
                />
              ))}
            </div>
          </div>
        </div>
      );

    case "symptoms": {
      const field = step.symptomGroup === "physical" ? "physicalSymptoms" : "mentalSymptoms";
      const selected = answers[field];
      return (
        <div className="space-y-2">
          {step.options?.map((opt) => (
            <OptionButton
              key={opt.value}
              label={opt.label}
              selected={selected.includes(opt.value)}
              onClick={() => patch({ [field]: toggleList(selected, opt.value) })}
            />
          ))}
          <p className="pt-2 text-[10px] text-ink-faint">
            Skip if none apply — you can update this anytime in Profile.
          </p>
        </div>
      );
    }

    case "lifestyle":
      return (
        <div className="space-y-5">
          <div>
            <SectionLabel>Dietary preferences</SectionLabel>
            <div className="flex flex-wrap gap-2">
              {DIETARY_INTAKE_OPTIONS.map((d) => (
                <Tag
                  key={d}
                  label={d}
                  variant="dark"
                  selected={answers.dietaryTags.includes(d)}
                  onToggle={() => patch({ dietaryTags: toggleList(answers.dietaryTags, d) })}
                />
              ))}
            </div>
          </div>
          <div>
            <SectionLabel>Activity level</SectionLabel>
            <ActivitySlider
              value={answers.activityLevel}
              onChange={(v) => patch({ activityLevel: v })}
            />
          </div>
          <div>
            <SectionLabel>Sleep quality</SectionLabel>
            <div className="space-y-2">
              {SLEEP_QUALITY_OPTIONS.map((opt) => (
                <OptionButton
                  key={opt.value}
                  label={opt.label}
                  selected={answers.sleepQuality === opt.value}
                  onClick={() => patch({ sleepQuality: opt.value })}
                />
              ))}
            </div>
          </div>
        </div>
      );

    case "goals":
      return (
        <div className="space-y-5">
          <div>
            <SectionLabel>Primary health goal</SectionLabel>
            <div className="space-y-2">
              {PRIMARY_GOAL_OPTIONS.map((opt) => (
                <OptionButton
                  key={opt.value}
                  label={opt.label}
                  selected={answers.primaryGoal === opt.value}
                  onClick={() => patch({ primaryGoal: opt.value })}
                />
              ))}
            </div>
          </div>
          <div>
            <SectionLabel>How are you feeling about your health journey?</SectionLabel>
            <div className="space-y-2">
              {EMOTIONAL_STATE_OPTIONS.map((opt) => (
                <OptionButton
                  key={opt.value}
                  label={opt.label}
                  selected={answers.emotionalState === opt.value}
                  onClick={() => patch({ emotionalState: opt.value })}
                />
              ))}
            </div>
          </div>
        </div>
      );

    default:
      return null;
  }
}
