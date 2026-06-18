"use client";

import { AppShell, AppHeader } from "@/components/layout/AppShell";
import { useAppState } from "@/context/AppStateContext";
import { getCyclePhase } from "@/lib/cycle";
import { formatTodayLong } from "@/lib/datetime";
import { getGreeting } from "@/lib/profile";
import { AppScreen } from "@/lib/phone";

const modules: { icon: string; title: string; desc: string; color: string; screen: AppScreen }[] = [
  { icon: "📋", title: "Assessment", desc: "9-question health profile", color: "bg-pink-light", screen: "assessment" },
  { icon: "📚", title: "Learn", desc: "PCOS & PCOD knowledge", color: "bg-purple-light", screen: "learn" },
  { icon: "🥗", title: "Care Plan", desc: "Diet, exercise & sleep", color: "bg-teal-light", screen: "careplan" },
  { icon: "📅", title: "Cycle", desc: "Track periods & symptoms", color: "bg-pink-light", screen: "cycle" },
  { icon: "💜", title: "Wellness", desc: "Affirmations & coping", color: "bg-purple-light", screen: "wellness" },
  { icon: "✨", title: "Ask AI", desc: "PCOS-specialised Q&A", color: "bg-amber-light", screen: "chat" },
];

interface HomeScreenProps {
  onNavigate: (screen: AppScreen) => void;
}

export function HomeScreen({ onNavigate }: HomeScreenProps) {
  const { currentCycleDay, assessmentResult, profile } = useAppState();
  const phase = getCyclePhase(currentCycleDay);
  const displayName = profile.name || "there";

  return (
    <AppShell className="bg-gradient-to-b from-peach/40 via-cream to-cream">
      <AppHeader>
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs text-gray-500">{getGreeting()},</p>
            <h1 className="font-serif text-2xl font-semibold text-purple-dark">
              {displayName}!
            </h1>
            <p className="mt-0.5 text-[10px] text-gray-400">{formatTodayLong()}</p>
            <p className="mt-1 text-xs text-gray-600">
              {phase.message}
            </p>
          </div>
          <button
            type="button"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white/80 shadow-card"
            aria-label="Notifications"
          >
            <svg className="h-4 w-4 text-pink-mid" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M13.7 21a2 2 0 01-3.4 0" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      </AppHeader>

      {assessmentResult && (
        <button
          type="button"
          onClick={() => onNavigate("assessment")}
          className="mb-4 w-full rounded-2xl bg-pink-light/80 p-3.5 text-left shadow-card"
        >
          <p className="text-[10px] font-medium uppercase tracking-wider text-pink-mid">Assessment</p>
          <p className="mt-0.5 text-sm font-medium text-purple-dark">
            {assessmentResult.severityLabel} symptom profile
          </p>
          <p className="text-[10px] text-gray-500">Tap to retake or review</p>
        </button>
      )}

      <div className="mb-5 rounded-3xl bg-white/70 p-5 shadow-card backdrop-blur-sm">
        <div className="mb-3 flex items-center justify-center">
          <div className="relative flex w-full items-center justify-between px-2">
            <div className="h-2 w-2 rounded-full bg-pink-mid/40" />
            <div className="h-2 w-2 rounded-full bg-pink-mid/60" />
            <div className="absolute left-1/2 top-1/2 flex h-10 w-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-gradient-to-br from-pink-mid to-purple-mid shadow-lg">
              <span className="text-sm">{phase.emoji}</span>
            </div>
            <div className="h-2 w-2 rounded-full bg-teal-mid/40" />
            <div className="h-2 w-2 rounded-full bg-teal-mid/60" />
          </div>
        </div>
        <p className="text-center font-serif text-lg text-purple-dark">
          {phase.name}
        </p>
        <p className="mt-0.5 text-center text-xs text-gray-500">Day {currentCycleDay} of cycle</p>
      </div>

      <button
        type="button"
        onClick={() => onNavigate("careplan")}
        className="mb-4 w-full rounded-2xl bg-white p-4 text-left shadow-card"
      >
        <p className="text-[10px] font-medium uppercase tracking-wider text-pink-mid">
          Today&apos;s focus
        </p>
        <div className="mt-1 flex items-center justify-between">
          <div>
            <p className="font-serif text-base text-purple-dark">Nourish & Move</p>
            <p className="text-xs text-gray-500">Low-GI meals & gentle yoga</p>
          </div>
          <span className="text-pink-mid">→</span>
        </div>
      </button>

      <button
        type="button"
        onClick={() => onNavigate("chat")}
        className="mb-5 w-full rounded-2xl bg-gradient-to-br from-peach via-pink-light to-purple-light p-4 text-left shadow-card"
      >
        <p className="font-serif text-base text-purple-dark">Ask Her Wellness</p>
        <p className="mb-3 text-xs text-gray-600">
          Get compassionate, evidence-based guidance
        </p>
        <div className="flex items-center gap-2 rounded-full bg-white px-4 py-2.5 shadow-sm">
          <span className="flex-1 text-xs text-gray-400">
            How can I manage PCOS symptoms?
          </span>
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-purple-dark">
            <svg className="h-3.5 w-3.5 text-white" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 14a3 3 0 003-3V5a3 3 0 10-6 0v6a3 3 0 003 3z" />
              <path d="M19 11a1 1 0 011 1 7 7 0 01-14 0 1 1 0 112 0 5 5 0 1010 0 1 1 0 011-1z" />
            </svg>
          </div>
        </div>
      </button>

      <p className="mb-3 text-sm font-medium text-purple-dark">Explore</p>
      <div className="grid grid-cols-2 gap-2.5">
        {modules.map((mod) => (
          <button
            key={mod.title}
            type="button"
            onClick={() => onNavigate(mod.screen)}
            className={`rounded-2xl p-3.5 text-left ${mod.color}`}
          >
            <span className="text-lg">{mod.icon}</span>
            <p className="mt-1.5 text-sm font-medium text-purple-dark">{mod.title}</p>
            <p className="text-[10px] text-gray-600">{mod.desc}</p>
          </button>
        ))}
      </div>

      <p className="mt-4 rounded-xl bg-amber-light/60 px-3 py-2 text-[9px] leading-relaxed text-amber-mid">
        This app supplements — not replaces — professional medical advice.
      </p>
    </AppShell>
  );
}
