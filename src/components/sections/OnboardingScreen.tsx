"use client";

import { useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { BtnOutline, BtnRose } from "@/components/ui/Button";
import { AppIcon } from "@/components/ui/icons";
import { AuthScreen } from "@/components/sections/AuthScreen";
import { IntakeFlow } from "@/components/sections/onboarding/IntakeFlow";
import { useAppState } from "@/context/AppStateContext";
import { useAuth } from "@/context/AuthContext";
import { INTAKE_STEPS, EMPTY_INTAKE_ANSWERS, buildIntakePlan } from "@/lib/intake";
import type { IntakeAnswers, IntakePlan } from "@/lib/intake";

type OnboardingStep = "splash" | "intake";

export function OnboardingScreen() {
  const { completeOnboarding } = useAppState();
  const { user } = useAuth();

  const [step, setStep] = useState<OnboardingStep>("splash");
  const [showAuth, setShowAuth] = useState(false);

  function handleIntakeComplete(answers: IntakeAnswers, plan: IntakePlan) {
    completeOnboarding({
      name: answers.name || user?.name || "",
      intakeAnswers: answers,
      intakePlan: plan,
    });
  }

  function handleSkipIntake() {
    const answers: IntakeAnswers = {
      ...EMPTY_INTAKE_ANSWERS,
      name: user?.name ?? "",
      cycleLength: 28,
      cycleRegularity: "irregular",
      primaryGoal: "understand",
      emotionalState: "hopeful",
      concerns: ["track-cycle"],
      diagnoses: ["none"],
    };
    handleIntakeComplete(answers, buildIntakePlan(answers));
  }

  if (showAuth) {
    return (
      <AuthScreen
        onSuccess={() => setShowAuth(false)}
        onCancel={() => setShowAuth(false)}
      />
    );
  }

  if (step === "splash") {
    return (
      <div className="relative flex h-full flex-col overflow-hidden bg-bg">
        <div className="relative h-[56%] min-h-[320px]">
          <div className="hero-gradient absolute inset-0" />
          <div className="hero-fade-bottom absolute inset-0" />
          <div className="absolute inset-0 overflow-hidden opacity-25">
            <div className="absolute left-[12%] top-[18%] h-16 w-16 rounded-full bg-white/40" />
            <div className="absolute right-[18%] top-[28%] h-10 w-10 rounded-full bg-white/30" />
            <div className="absolute bottom-[30%] left-[28%] h-8 w-8 rounded-full bg-white/35" />
            <div className="absolute bottom-[22%] right-[22%] h-14 w-14 rounded-full bg-white/25" />
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="animate-float flex h-16 w-16 items-center justify-center rounded-icon border border-white/50 bg-white/30 text-rose-deep shadow-glass-card backdrop-blur-[12px]">
              <AppIcon name="chat" className="h-8 w-8 text-white" />
            </div>
          </div>
        </div>

        <div
          className="flex flex-1 flex-col px-7 pb-[calc(var(--app-safe-bottom)+16px)]"
          style={{ paddingTop: "var(--app-safe-top)" }}
        >
          <div className="flex flex-1 flex-col items-center justify-center text-center">
            <h1 className="font-serif text-[2.4rem] font-light tracking-wide text-ink">
              She <span className="italic">Care</span>
            </h1>
            <div className="mt-3 flex items-center gap-2">
              <span className="h-1 w-1 rounded-full bg-rose-soft" />
              <span className="h-1 w-1 rounded-full bg-rose-mid" />
              <span className="h-1 w-1 rounded-full bg-rose-soft" />
            </div>
            <p className="mt-4 max-w-[280px] text-sm font-light leading-relaxed text-ink-mid">
              A calm companion for PCOS, cycle health &amp; women&apos;s wellbeing — built with care, not judgment.
            </p>
          </div>

          <div className="space-y-3">
            <BtnRose onClick={() => setStep("intake")}>Begin health intake</BtnRose>
            <BtnOutline onClick={() => setShowAuth(true)}>
              I already have an account
            </BtnOutline>
            <button
              type="button"
              onClick={handleSkipIntake}
              className="w-full py-2 text-center text-[0.72rem] font-medium tracking-wide text-ink-faint underline underline-offset-2 transition-colors active:text-ink-mid"
            >
              Skip questions for now
            </button>
            <p className="pt-1 text-center text-[0.65rem] font-light leading-relaxed text-ink-faint">
              A short, private questionnaire (~3 min) helps personalise your support.
              <br />
              By continuing you agree to our{" "}
              <button type="button" className="underline underline-offset-2">
                Terms &amp; Privacy
              </button>
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <IntakeFlow
      steps={INTAKE_STEPS}
      initialAnswers={{ name: user?.name ?? "" }}
      onComplete={handleIntakeComplete}
      onBackFromFirst={() => setStep("splash")}
      finishLabel="Enter SheCare"
    />
  );
}
