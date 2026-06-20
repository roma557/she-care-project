"use client";

import { useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { CalendarGrid } from "@/components/ui/CalendarGrid";
import { PhaseBar } from "@/components/ui/PhaseBar";
import { SymptomChip } from "@/components/ui/SymptomChip";
import { BtnRose } from "@/components/ui/Button";
import { useAppState } from "@/context/AppStateContext";
import { ALL_SYMPTOMS } from "@/lib/cycle";
import { dateKeyForDayOfMonth, formatTodayLong } from "@/lib/datetime";
import {
  buildCycleProjection,
  buildMonthCalendarCells,
  normalizeCycleRegularity,
} from "@/lib/cycle-prediction";

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export function CycleScreen() {
  const {
    profile,
    toggleDay,
    toggleSymptom,
    saveSymptoms,
    symptomSaved,
    cycle,
  } = useAppState();

  const now = new Date();
  const [viewMonth, setViewMonth] = useState(now.getMonth());
  const [viewYear, setViewYear] = useState(now.getFullYear());
  const [flowLevel, setFlowLevel] = useState(2);

  const cycleLength = profile.cycleLength || 28;
  const regularity = normalizeCycleRegularity(profile.intakeAnswers?.cycleRegularity);
  const fertilityGoal = profile.intakeAnswers?.primaryGoal === "fertility";

  const projection = buildCycleProjection({
    markedDays: cycle.markedDays,
    cycleLength,
    cycleRegularity: regularity,
    fertilityGoal,
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

  return (
    <AppShell className="bg-bg">
      <div className="mb-1">
        <h1 className="font-serif text-[1.75rem] italic text-ink">Cycle Tracker</h1>
        <p className="mt-1 text-sm font-light text-ink-mid">
          Cycle {projection.loggedCycleCount} of {viewYear} · {projection.avgCycleLength} day average
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

      <div className="mb-5 mt-4 flex items-center justify-between">
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

        <BtnRose className="mt-5" onClick={saveSymptoms}>
          {symptomSaved ? "Saved ✓" : "Save log"}
        </BtnRose>
      </div>
    </AppShell>
  );
}
