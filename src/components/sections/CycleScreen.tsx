"use client";

import { useEffect, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { CalendarGrid } from "@/components/ui/CalendarGrid";
import { PhaseBar } from "@/components/ui/PhaseBar";
import { SymptomChip } from "@/components/ui/SymptomChip";
import { BtnOutline, BtnRose } from "@/components/ui/Button";
import { useAppState } from "@/context/AppStateContext";
import { usePermissions } from "@/hooks/usePermissions";
import { UpgradePrompt } from "@/components/ui/UpgradePrompt";
import { useAuth } from "@/context/AuthContext";
import { ALL_SYMPTOMS } from "@/lib/cycle";
import { dateKeyForDayOfMonth, formatTodayLong, toDateKey } from "@/lib/datetime";
import {
  buildCycleProjection,
  buildMonthCalendarCells,
  isPeriodActive,
  normalizeCycleRegularity,
} from "@/lib/cycle-prediction";
import { AppScreen } from "@/lib/phone";

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

interface CycleScreenProps {
  onNavigate?: (screen: AppScreen) => void;
}

export function CycleScreen({ onNavigate }: CycleScreenProps) {
  const {
    profile,
    toggleDay,
    logPeriodStart,
    logPeriodEnd,
    hydrateTodayLog,
    toggleSymptom,
    saveSymptoms,
    symptomSaved,
    cycle,
  } = useAppState();
  const { tier } = usePermissions();
  const { isAuthenticated } = useAuth();

  const now = new Date();
  const todayKey = toDateKey(now);

  const todayLog = cycle.dailyLogs[todayKey];

  const [viewMonth, setViewMonth] = useState(now.getMonth());
  const [viewYear, setViewYear] = useState(now.getFullYear());
  const [flowLevel, setFlowLevel] = useState(() => todayLog?.flowLevel ?? 2);
  const [periodActionDone, setPeriodActionDone] = useState<string | null>(null);

  useEffect(() => {
    hydrateTodayLog();
    setFlowLevel(todayLog?.flowLevel ?? 2);
  }, [todayKey, hydrateTodayLog, todayLog?.flowLevel, todayLog?.symptoms]);

  const cycleLength = profile.cycleLength || 28;
  const regularity = normalizeCycleRegularity(profile.intakeAnswers?.cycleRegularity);
  const fertilityGoal = profile.intakeAnswers?.primaryGoal === "fertility";
  const periodActive = isPeriodActive(cycle.markedDays, todayKey);

  const projection = buildCycleProjection({
    markedDays: cycle.markedDays,
    cycleLength,
    cycleRegularity: regularity,
    fertilityGoal: profile.pregnancyMode ? false : fertilityGoal,
    predictionTier: isAuthenticated ? tier : "free",
  });

  const isCurrentMonth =
    viewMonth === now.getMonth() && viewYear === now.getFullYear();

  const cells = buildMonthCalendarCells(
    viewYear,
    viewMonth,
    projection,
    isCurrentMonth ? now.getDate() : -1,
  );

  function prevMonth() {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else {
      setViewMonth((m) => m - 1);
    }
  }

  function nextMonth() {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else {
      setViewMonth((m) => m + 1);
    }
  }

  function handleDayClick(day: number) {
    const dateKey = dateKeyForDayOfMonth(day, new Date(viewYear, viewMonth, 1));
    toggleDay(dateKey);
  }

  function handlePeriodStart() {
    logPeriodStart(todayKey);
    setPeriodActionDone("start");
    setTimeout(() => setPeriodActionDone(null), 2500);
  }

  function handlePeriodEnd() {
    logPeriodEnd(todayKey);
    setPeriodActionDone("end");
    setTimeout(() => setPeriodActionDone(null), 2500);
  }

  return (
    <AppShell className="bg-bg">
      <div className="mb-1 flex items-start justify-between gap-3">
        <div>
          <h1 className="font-serif text-[1.75rem] italic text-ink">Cycle Tracker</h1>
          <p className="mt-1 text-sm font-light text-ink-mid">
            Cycle {projection.loggedCycleCount} · {projection.avgCycleLength} day average
          </p>
          {!projection.showPredictions && regularity !== "unknown" && (
            <p className="mt-1 text-[10px] text-ink-faint">
              Predictions hidden — tracking mode for {regularity} cycles
            </p>
          )}
          {projection.showPredictions && projection.nextPeriodEstimate && (
            <p className="mt-1 text-[10px] text-ink-faint">
              Next period estimated around{" "}
              {new Date(projection.nextPeriodEstimate + "T00:00:00").toLocaleDateString(undefined, {
                day: "numeric",
                month: "short",
              })}
            </p>
          )}
        </div>
        {onNavigate && (
          <button
            type="button"
            onClick={() => onNavigate("cycle-history")}
            className="shrink-0 text-[0.65rem] font-medium text-rose-deep"
          >
            History
          </button>
        )}
      </div>

      <div className="mb-5 mt-4 grid grid-cols-2 gap-2">
        <BtnRose
          fullWidth
          onClick={handlePeriodStart}
          className="!py-3 text-sm"
          disabled={periodActionDone === "start"}
        >
          {periodActionDone === "start" ? "Logged ✓" : "Period started"}
        </BtnRose>
        <BtnOutline
          fullWidth
          onClick={handlePeriodEnd}
          className="!py-3"
          disabled={!periodActive || periodActionDone === "end"}
        >
          {periodActionDone === "end" ? "Logged ✓" : "Period ended"}
        </BtnOutline>
      </div>

      {!periodActive && (
        <p className="mb-4 text-[10px] text-ink-faint">
          Log when bleeding begins. &ldquo;Period ended&rdquo; unlocks once today is marked as a
          period day.
        </p>
      )}

      <div className="mb-5 flex items-center justify-between">
        <button
          type="button"
          onClick={prevMonth}
          className="flex h-8 w-8 items-center justify-center rounded-full text-ink-mid transition-colors active:bg-rose-pale"
          aria-label="Previous month"
        >
          ‹
        </button>
        <p className="font-serif text-lg text-ink">
          {MONTH_NAMES[viewMonth]} {viewYear}
        </p>
        <button
          type="button"
          onClick={nextMonth}
          className="flex h-8 w-8 items-center justify-center rounded-full text-ink-mid transition-colors active:bg-rose-pale"
          aria-label="Next month"
        >
          ›
        </button>
      </div>

      <div className="mb-2 grid grid-cols-7 text-center">
        {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => (
          <span key={d} className="text-[0.65rem] font-medium text-ink-faint">
            {d}
          </span>
        ))}
      </div>

      <CalendarGrid cells={cells} onDayClick={handleDayClick} />

      <div className="mt-3 flex flex-wrap gap-3 text-[9px] text-ink-faint">
        <span className="flex items-center gap-1">
          <span className="h-2 w-2 rounded-full bg-rose-deep" /> Logged period
        </span>
        {projection.showPredictions && (
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-rose-deep/20" /> Estimated
          </span>
        )}
        <span className="flex items-center gap-1">
          <span className="h-2 w-2 rounded-full border border-rose-deep" /> Today
        </span>
      </div>

      <p className="mb-4 mt-2 text-[10px] text-ink-faint">
        Tap a day to log or remove period marks
      </p>

      <div className="mb-6">
        <PhaseBar />
      </div>

      <div className="rounded-card border border-ink/[0.05] bg-surface p-5 shadow-card">
        <p className="font-serif text-base italic text-ink">Flow &amp; symptoms</p>
        <p className="mt-0.5 text-[0.65rem] font-light text-ink-faint">{formatTodayLong(now)}</p>

        <p className="mb-2 mt-4 text-[0.6rem] font-medium uppercase tracking-[0.15em] text-ink-faint">
          Flow intensity
        </p>
        <div className="mb-4 flex gap-2">
          {[1, 2, 3, 4, 5].map((level) => (
            <button
              key={level}
              type="button"
              onClick={() => setFlowLevel(level)}
              className={`h-2 w-2 rounded-full transition-colors ${
                level <= flowLevel ? "bg-rose-deep" : "bg-rose-pale"
              }`}
              aria-label={`Flow level ${level}`}
            />
          ))}
        </div>

        <div className="flex flex-wrap gap-2">
          {ALL_SYMPTOMS.map((s) => (
            <SymptomChip
              key={s}
              label={s}
              active={cycle.selectedSymptoms.includes(s)}
              onToggle={() => toggleSymptom(s)}
            />
          ))}
        </div>

        <BtnRose className="mt-5" onClick={() => saveSymptoms(flowLevel)}>
          {symptomSaved ? "Saved ✓" : "Save log"}
        </BtnRose>
      </div>
    </AppShell>
  );
}
