"use client";

import { useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { useAppState } from "@/context/AppStateContext";
import { getCyclePhase } from "@/lib/cycle";

export function OnboardingScreen() {
  const { completeOnboarding } = useAppState();
  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [cycleDay, setCycleDay] = useState(8);

  const phase = getCyclePhase(cycleDay);
  const trimmedName = name.trim();

  function handleFinish() {
    if (trimmedName) completeOnboarding(trimmedName, cycleDay);
  }

  if (step === 0) {
    return (
      <AppShell hasNav={false} className="flex flex-col bg-gradient-to-b from-peach/50 via-cream to-purple-light/30">
        <div className="flex flex-1 flex-col items-center justify-center text-center">
          <span className="text-5xl">🌸</span>
          <h1 className="mt-5 font-serif text-3xl font-semibold text-purple-dark">Her Wellness</h1>
          <p className="mt-3 max-w-[260px] text-sm leading-relaxed text-gray-600">
            Your compassionate companion for PCOS & PCOD — personalised care, cycle tracking, and AI guidance.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setStep(1)}
          className="w-full rounded-full bg-pink-mid py-3.5 text-sm font-medium text-white"
        >
          Get started
        </button>
      </AppShell>
    );
  }

  if (step === 1) {
    return (
      <AppShell hasNav={false} className="bg-gradient-to-b from-pink-light/40 to-cream">
        <p className="mb-1 text-[10px] font-medium uppercase tracking-widest text-pink-mid">Step 1 of 2</p>
        <h2 className="font-serif text-2xl text-purple-dark">What should we call you?</h2>
        <p className="mt-2 text-xs text-gray-500">We&apos;ll personalise your home screen greeting.</p>

        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your first name"
          maxLength={24}
          className="mt-6 w-full rounded-2xl border border-pink-light bg-white px-4 py-3.5 text-sm text-purple-dark outline-none focus:border-pink-mid"
          autoFocus
        />

        <button
          type="button"
          onClick={() => setStep(2)}
          disabled={!trimmedName}
          className="mt-6 w-full rounded-full bg-pink-mid py-3 text-sm font-medium text-white disabled:opacity-40"
        >
          Continue
        </button>
      </AppShell>
    );
  }

  return (
    <AppShell hasNav={false} className="bg-gradient-to-b from-purple-light/40 to-cream">
      <p className="mb-1 text-[10px] font-medium uppercase tracking-widest text-pink-mid">Step 2 of 2</p>
      <h2 className="font-serif text-2xl text-purple-dark">Where are you in your cycle?</h2>
      <p className="mt-2 text-xs text-gray-500">This helps us show your current phase on the home screen.</p>

      <div className="mt-6 rounded-3xl bg-white p-5 shadow-card">
        <div className="text-center">
          <span className="text-3xl">{phase.emoji}</span>
          <p className="mt-2 font-serif text-lg text-purple-dark">{phase.name}</p>
          <p className="mt-1 text-xs text-gray-500">Day {cycleDay}</p>
        </div>

        <input
          type="range"
          min={1}
          max={35}
          value={cycleDay}
          onChange={(e) => setCycleDay(Number(e.target.value))}
          className="mt-5 w-full accent-pink-mid"
        />
        <div className="mt-1 flex justify-between text-[10px] text-gray-400">
          <span>Day 1</span>
          <span>Day 35</span>
        </div>
      </div>

      <button
        type="button"
        onClick={handleFinish}
        className="mt-6 w-full rounded-full bg-purple-dark py-3 text-sm font-medium text-white"
      >
        Welcome, {trimmedName}! →
      </button>
    </AppShell>
  );
}
