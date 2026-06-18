"use client";

import { useState, useEffect } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { ScreenBackHeader } from "@/components/ui/ScreenBackHeader";
import { AssessmentResults } from "@/components/sections/AssessmentResults";
import { useAppState } from "@/context/AppStateContext";
import {
  ASSESSMENT_QUESTIONS,
  calculateResult,
} from "@/lib/assessment";

interface AssessmentScreenProps {
  onBack: () => void;
}

export function AssessmentScreen({ onBack }: AssessmentScreenProps) {
  const { assessmentResult, saveAssessmentResult, clearAssessmentResult } = useAppState();
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});
  const [result, setResult] = useState(assessmentResult);
  const [retaking, setRetaking] = useState(false);

  useEffect(() => {
    if (!retaking && assessmentResult) setResult(assessmentResult);
  }, [assessmentResult, retaking]);

  const question = ASSESSMENT_QUESTIONS[currentQ];
  const progress = ((currentQ + 1) / ASSESSMENT_QUESTIONS.length) * 100;

  function selectSingle(key: string, value: string) {
    setAnswers((prev) => ({ ...prev, [key]: value }));
  }

  function toggleMulti(key: string, value: string) {
    setAnswers((prev) => {
      const current = (prev[key] as string[]) ?? [];
      const next = current.includes(value)
        ? current.filter((v) => v !== value)
        : [...current, value];
      return { ...prev, [key]: next };
    });
  }

  function isSelected(key: string, value: string, type: "single" | "multi") {
    if (type === "single") return answers[key] === value;
    return ((answers[key] as string[]) ?? []).includes(value);
  }

  function canProceed() {
    const answer = answers[question.key];
    if (question.type === "single") return !!answer;
    return ((answer as string[]) ?? []).length > 0;
  }

  function handleNext() {
    if (currentQ < ASSESSMENT_QUESTIONS.length - 1) {
      setCurrentQ((q) => q + 1);
    } else {
      const computed = calculateResult(answers);
      setResult(computed);
      saveAssessmentResult(computed);
      setRetaking(false);
    }
  }

  function handleRetake() {
    clearAssessmentResult();
    setCurrentQ(0);
    setAnswers({});
    setResult(null);
    setRetaking(true);
  }

  if (result && !retaking) {
    return (
      <AssessmentResults
        result={result}
        onBack={onBack}
        onRetake={handleRetake}
      />
    );
  }

  return (
    <AppShell hasNav={false} className="bg-gradient-to-b from-pink-light/40 to-cream">
      <ScreenBackHeader
        title="Assessment"
        subtitle={`Question ${currentQ + 1} of ${ASSESSMENT_QUESTIONS.length}`}
        onBack={onBack}
      />

      <div className="mb-5 h-1.5 overflow-hidden rounded-full bg-white">
        <div
          className="h-full rounded-full bg-pink-mid transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>

      <p className="mb-4 font-serif text-lg text-purple-dark">{question.prompt}</p>

      <div className="space-y-2">
        {question.options.map((opt) => {
          const selected = isSelected(question.key, opt.value, question.type);
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() =>
                question.type === "single"
                  ? selectSingle(question.key, opt.value)
                  : toggleMulti(question.key, opt.value)
              }
              className={`w-full rounded-2xl px-4 py-3 text-left text-xs transition-colors ${
                selected
                  ? "bg-purple-dark text-white shadow-card"
                  : "border border-gray-200 bg-white text-gray-700"
              }`}
            >
              {opt.label}
            </button>
          );
        })}
      </div>

      <button
        type="button"
        onClick={handleNext}
        disabled={!canProceed()}
        className="mt-6 w-full rounded-full bg-pink-mid py-3 text-xs font-medium text-white disabled:opacity-40"
      >
        {currentQ < ASSESSMENT_QUESTIONS.length - 1 ? "Next →" : "See results"}
      </button>
    </AppShell>
  );
}
