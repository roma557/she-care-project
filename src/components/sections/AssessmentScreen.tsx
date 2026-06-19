"use client";

import { useState } from "react";
import { IntakeFlow } from "@/components/sections/onboarding/IntakeFlow";
import { IntakeSummary } from "@/components/sections/onboarding/IntakeSummary";
import { useAppState } from "@/context/AppStateContext";
import { INTAKE_STEPS } from "@/lib/intake";
import type { IntakeAnswers, IntakePlan } from "@/lib/intake";

interface AssessmentScreenProps {
  onBack: () => void;
}

export function AssessmentScreen({ onBack }: AssessmentScreenProps) {
  const { profile, assessmentResult, updateIntakeProfile, clearAssessmentResult } = useAppState();
  const [editing, setEditing] = useState(!assessmentResult || !profile.intakeAnswers);

  function handleComplete(answers: IntakeAnswers, plan: IntakePlan) {
    updateIntakeProfile(answers, plan);
    setEditing(false);
  }

  function handleRetake() {
    clearAssessmentResult();
    setEditing(true);
  }

  if (!editing && assessmentResult && profile.intakeAnswers) {
    return (
      <IntakeSummary
        answers={profile.intakeAnswers}
        plan={assessmentResult}
        finishLabel="Done"
        onConfirm={onBack}
        onEdit={handleRetake}
        onBack={onBack}
      />
    );
  }

  return (
    <IntakeFlow
      steps={INTAKE_STEPS}
      initialAnswers={profile.intakeAnswers}
      onComplete={handleComplete}
      onBackFromFirst={onBack}
      finishLabel="Save profile"
    />
  );
}
