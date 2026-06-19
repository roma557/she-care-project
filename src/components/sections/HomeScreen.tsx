"use client";

import { AppShell, AppFullBleed } from "@/components/layout/AppShell";
import { CycleCard } from "@/components/ui/CycleCard";
import { InsightCard } from "@/components/ui/InsightCard";
import { SymptomChip } from "@/components/ui/SymptomChip";
import { useAppState } from "@/context/AppStateContext";
import { ALL_SYMPTOMS, getCyclePhase } from "@/lib/cycle";
import { getGreeting } from "@/lib/profile";
import { AppScreen } from "@/lib/phone";

const INSIGHTS = [
  { icon: "💧", title: "Hydration", value: "6", unit: "glasses" },
  { icon: "🌙", title: "Sleep", value: "7.5", unit: "hrs" },
  { icon: "🧘", title: "Stress", value: "Low", unit: "" },
];

interface HomeScreenProps {
  onNavigate: (screen: AppScreen) => void;
  onOpenNotifications?: () => void;
  unreadCount?: number;
}

export function HomeScreen({
  onNavigate,
  onOpenNotifications,
  unreadCount = 0,
}: HomeScreenProps) {
  const { currentCycleDay, profile, toggleSymptom, cycle, assessmentResult } = useAppState();
  const phase = getCyclePhase(currentCycleDay);
  const displayName = profile.name || "Priya";
  const cycleLength = profile.cycleLength || 28;

  return (
    <AppShell className="bg-bg">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-serif text-2xl text-ink">
            {getGreeting()}, {displayName}{" "}
            <span className="text-rose-soft">✦</span>
          </h1>
        </div>
        <button
          type="button"
          onClick={onOpenNotifications}
          className="relative flex h-10 w-10 items-center justify-center rounded-full bg-surface shadow-avatar"
          aria-label="Profile"
        >
          <span className="font-serif text-lg text-rose-deep">
            {displayName.charAt(0).toUpperCase()}
          </span>
          {unreadCount > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-deep px-1 text-[9px] font-bold text-white">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </button>
      </div>

      {assessmentResult && (
        <div className="mb-5 rounded-2xl border border-rose-soft/40 bg-rose-pale/80 p-4">
          <p className="text-[0.6rem] font-medium uppercase tracking-[0.18em] text-rose-deep">
            Your care focus
          </p>
          <p className="mt-2 text-xs leading-relaxed text-ink-mid">{assessmentResult.reassurance}</p>
          {assessmentResult.showDoctorAlert && (
            <button
              type="button"
              onClick={() => onNavigate("assessment")}
              className="mt-3 text-[10px] font-medium text-rose-deep underline underline-offset-2"
            >
              View health profile &amp; doctor guidance →
            </button>
          )}
        </div>
      )}

      <CycleCard
        phaseName={phase.name}
        cycleDay={currentCycleDay}
        cycleLength={cycleLength}
        message={phase.message}
      />

      <div className="mb-3 mt-6 flex items-center justify-between">
        <p className="font-sans text-[0.6rem] font-medium uppercase tracking-[0.2em] text-ink-faint">
          Today&apos;s insights
        </p>
        <button
          type="button"
          onClick={() => onNavigate("learn")}
          className="text-[0.65rem] font-medium text-rose-deep"
        >
          See all
        </button>
      </div>

      <AppFullBleed className="hide-scrollbar mb-6 flex gap-3 overflow-x-auto px-7 pb-1">
        {INSIGHTS.map((item) => (
          <InsightCard key={item.title} {...item} />
        ))}
      </AppFullBleed>

      <div className="mb-3 flex items-center justify-between">
        <p className="font-sans text-[0.6rem] font-medium uppercase tracking-[0.2em] text-ink-faint">
          Log symptoms
        </p>
        <button
          type="button"
          onClick={() => onNavigate("cycle")}
          className="text-[0.65rem] font-medium text-rose-deep"
        >
          History
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        {ALL_SYMPTOMS.slice(0, 6).map((s) => (
          <SymptomChip
            key={s}
            label={s}
            active={cycle.selectedSymptoms.includes(s)}
            onToggle={() => toggleSymptom(s)}
          />
        ))}
      </div>
    </AppShell>
  );
}
