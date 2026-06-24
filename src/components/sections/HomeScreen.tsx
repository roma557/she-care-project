"use client";

import { useEffect, useMemo, useState } from "react";
import { AppShell, AppFullBleed } from "@/components/layout/AppShell";
import { CycleCard } from "@/components/ui/CycleCard";
import { InsightCard } from "@/components/ui/InsightCard";
import { SymptomChip } from "@/components/ui/SymptomChip";
import { PlanHomeDashboard } from "@/components/sections/plan/PlanHomeDashboard";
import { PlanCardsCarousel } from "@/components/sections/plan/PlanCardsCarousel";
import { useAppState } from "@/context/AppStateContext";
import { usePermissions } from "@/hooks/usePermissions";
import {
  ALL_SYMPTOMS,
  getCyclePhase,
  getDaysToOvulation,
  getLoggedPeriodLength,
  getPhaseProgress,
  getPlusCycleInsights,
} from "@/lib/cycle";
import { buildHomeInsightCards } from "@/lib/insights";
import { getGreeting } from "@/lib/profile";
import { toDateKey } from "@/lib/datetime";
import { loadJSON, saveJSON } from "@/lib/storage";
import { AppScreen } from "@/lib/phone";
import type { DbWearableDevice } from "@/lib/db/types";
import { PLAN_CARD_THEME } from "@/lib/subscription/plan-card-theme";
import type { CycleCardVariant } from "@/lib/subscription/plan-card-theme";

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
  const { currentCycleDay, profile, toggleSymptom, cycle, assessmentResult, todayInsights, incrementHydration, hydrateTodayLog, saveSymptoms } =
    useAppState();
  const { tier, can } = usePermissions();
  const phase = getCyclePhase(currentCycleDay);
  const displayName = profile.name || "there";
  const cycleLength = profile.cycleLength || 28;
  const todayKey = useMemo(() => toDateKey(new Date()), []);
  const todayLog = cycle.dailyLogs[todayKey];
  const periodLength = Math.max(
    5,
    getLoggedPeriodLength(cycle.markedDays, cycle.cycleStartDate) || 5,
  );
  const phaseProgress = getPhaseProgress(currentCycleDay, cycleLength, periodLength);
  const daysToOvulation = getDaysToOvulation(currentCycleDay);
  const insightCards = buildHomeInsightCards(todayInsights);
  const cycleVariant: CycleCardVariant =
    tier === "plus" ? "plus" : tier === "premium" ? "premium" : "default";
  const showPlanDashboard = tier === "plus" || tier === "premium";
  const isPremium = tier === "premium";
  const isPlus = tier === "plus";
  const plusInsights = isPlus ? getPlusCycleInsights(currentCycleDay, cycleLength) : undefined;
  const tierTheme =
    cycleVariant === "plus" || cycleVariant === "premium"
      ? PLAN_CARD_THEME[cycleVariant]
      : null;
  const sectionLabelClass = tierTheme?.sectionLabel ?? "text-ink-faint";
  const sectionLinkClass = tierTheme?.link ?? "text-rose-deep";

  const [flowLevel, setFlowLevel] = useState(() => todayLog?.flowLevel ?? 2);
  const [wearables, setWearables] = useState<DbWearableDevice[]>([]);
  const [careFocusDismissed, setCareFocusDismissed] = useState(false);

  useEffect(() => {
    setCareFocusDismissed(loadJSON("care-focus-dismissed", false));
  }, []);

  useEffect(() => {
    hydrateTodayLog();
    setFlowLevel(todayLog?.flowLevel ?? 2);
  }, [todayKey, hydrateTodayLog, todayLog?.flowLevel]);

  useEffect(() => {
    if (!isPremium || !can("wearable_sync")) return;
    fetch("/api/wearables")
      .then((res) => res.json())
      .then((data) => setWearables(data.devices ?? []))
      .catch(() => setWearables([]));
  }, [isPremium, can]);

  const latestWearable = wearables[0];
  const wearableSyncAt = latestWearable?.lastSyncAt ?? null;
  const wearableConnected = wearables.length > 0;

  function dismissCareFocus() {
    setCareFocusDismissed(true);
    saveJSON("care-focus-dismissed", true);
  }

  function handleFlowChange(level: number) {
    setFlowLevel(level);
    saveSymptoms(level);
  }

  const cycleCard = (
    <CycleCard
      variant={cycleVariant}
      phaseName={phase.name}
      cycleDay={currentCycleDay}
      cycleLength={cycleLength}
      message={phase.message}
      phaseDay={phaseProgress.phaseDay}
      phaseTotal={phaseProgress.phaseTotal}
      subtitleDay={phaseProgress.subtitleDay}
      subtitleTotal={phaseProgress.subtitleTotal}
      daysToOvulation={daysToOvulation}
      flowLevel={flowLevel}
      onFlowChange={isPlus || isPremium ? handleFlowChange : undefined}
      wearableSyncAt={wearableSyncAt}
      wearableConnected={wearableConnected}
      onWearableTap={isPremium ? () => onNavigate("wearables") : undefined}
      plusInsights={plusInsights}
      onInsightTap={
        plusInsights ? () => onNavigate(plusInsights.insightScreen) : undefined
      }
    />
  );

  return (
    <AppShell className="bg-bg">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-serif text-2xl text-ink">
            {getGreeting()}, {displayName}
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

      {assessmentResult && !careFocusDismissed && (
        <div className="relative mb-5 rounded-2xl border border-rose-soft/40 bg-rose-pale/80 p-4 pr-10">
          <button
            type="button"
            onClick={dismissCareFocus}
            className="absolute right-3 top-3 flex h-6 w-6 items-center justify-center rounded-full text-rose-deep/50 transition-colors hover:bg-rose-soft/40 hover:text-rose-deep"
            aria-label="Dismiss care focus"
          >
            <svg className="h-3.5 w-3.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
              <path d="M4 4l8 8M12 4l-8 8" strokeLinecap="round" />
            </svg>
          </button>
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

      {showPlanDashboard ? (
        <PlanCardsCarousel
          dotActiveClass={
            tier === "premium" ? "bg-plan-premium-deep" : "bg-plan-plus-deep"
          }
          slides={[
            { id: "cycle", label: "Cycle", content: cycleCard },
            {
              id: "plan",
              label: "Your plan",
              content: (
                <PlanHomeDashboard
                  tier={tier as "plus" | "premium"}
                  onNavigate={onNavigate}
                />
              ),
            },
          ]}
        />
      ) : (
        cycleCard
      )}

      <div className="mb-3 mt-6 flex items-center justify-between">
        <p
          className={`font-sans text-[0.6rem] font-medium uppercase tracking-[0.2em] ${sectionLabelClass}`}
        >
          Today&apos;s insights
        </p>
        <button
          type="button"
          onClick={() => onNavigate("insights")}
          className={`text-[0.65rem] font-medium ${sectionLinkClass}`}
        >
          See all
        </button>
      </div>

      <AppFullBleed className="hide-scrollbar mb-6 flex gap-3 overflow-x-auto px-7 pb-1">
        {insightCards.map((item) => (
          <InsightCard
            key={item.title}
            {...item}
            variant={cycleVariant}
            onClick={
              item.title === "Hydration"
                ? incrementHydration
                : () => onNavigate("insights")
            }
          />
        ))}
      </AppFullBleed>

      <div className="mb-3 flex items-center justify-between">
        <p
          className={`font-sans text-[0.6rem] font-medium uppercase tracking-[0.2em] ${sectionLabelClass}`}
        >
          Log symptoms
        </p>
        <button
          type="button"
          onClick={() => onNavigate("cycle-history")}
          className={`text-[0.65rem] font-medium ${sectionLinkClass}`}
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
            variant={cycleVariant}
          />
        ))}
      </div>
    </AppShell>
  );
}
