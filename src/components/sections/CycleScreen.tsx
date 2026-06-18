"use client";

import { AppShell, AppHeader } from "@/components/layout/AppShell";
import { useAppState } from "@/context/AppStateContext";
import { ALL_SYMPTOMS, DayMark } from "@/lib/cycle";
import {
  dateKeyForDayOfMonth,
  formatTodayLong,
  getMonthCalendar,
  getWeekStrip,
  parseDateKey,
} from "@/lib/datetime";

function CalendarDay({
  day,
  mark,
  onClick,
  muted,
}: {
  day: number;
  mark: DayMark | "current" | "default";
  onClick?: () => void;
  muted?: boolean;
}) {
  const styles = {
    period: "bg-pink-mid text-white",
    ovulation: "bg-teal-mid text-white ring-2 ring-teal-mid/30 ring-offset-1",
    current: "bg-purple-dark text-white",
    default: muted ? "text-gray-300" : "text-gray-600 hover:bg-pink-light/50",
  };

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={muted}
      className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-medium transition-colors ${styles[mark]}`}
    >
      {day}
    </button>
  );
}

function resolveMark(
  dateKey: string,
  markedDays: Record<string, DayMark>,
  todayKey: string,
): DayMark | "current" | "default" {
  if (dateKey === todayKey) return "current";
  return markedDays[dateKey] ?? "default";
}

export function CycleScreen() {
  const {
    cycle,
    setCycleMode,
    toggleDay,
    toggleSymptom,
    saveSymptoms,
    symptomSaved,
  } = useAppState();

  const { markedDays, cycleMode, selectedSymptoms } = cycle;
  const now = new Date();
  const weekStrip = getWeekStrip(now);
  const month = getMonthCalendar(now);
  const currentMonth = now.getMonth();

  return (
    <AppShell className="bg-gradient-to-b from-purple-light/30 to-cream">
      <AppHeader>
        <div className="flex items-center justify-between">
          <div>
            <p className="font-serif text-xl text-purple-dark">{month.monthLabel}</p>
            <p className="text-[10px] text-gray-500">{formatTodayLong(now)}</p>
          </div>
          <button
            type="button"
            className="flex h-7 w-7 items-center justify-center rounded-full bg-white shadow-card"
            aria-label="Info"
          >
            <span className="text-xs font-medium text-purple-mid">i</span>
          </button>
        </div>
      </AppHeader>

      <div className="mb-4 flex gap-2">
        <ModeButton
          active={cycleMode === "period"}
          label="Mark period"
          color="bg-pink-mid"
          onClick={() => setCycleMode("period")}
        />
        <ModeButton
          active={cycleMode === "ovulation"}
          label="Mark ovulation"
          color="bg-teal-mid"
          onClick={() => setCycleMode("ovulation")}
        />
      </div>

      <div className="mb-5 rounded-2xl bg-white p-3 shadow-card">
        <div className="mb-2 grid grid-cols-7 gap-1 text-center">
          {weekStrip.map((d) => (
            <span key={d.dateKey} className="text-[10px] text-gray-400">{d.weekday}</span>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {weekStrip.map((d) => {
            const inCurrentMonth = parseDateKey(d.dateKey).getMonth() === currentMonth;
            return (
            <div key={d.dateKey} className="flex justify-center">
              <CalendarDay
                day={d.dayNum}
                mark={resolveMark(d.dateKey, markedDays, month.todayKey)}
                onClick={() => toggleDay(d.dateKey)}
                muted={!inCurrentMonth}
              />
            </div>
            );
          })}
        </div>
      </div>

      <div className="mb-5 rounded-2xl bg-white p-4 shadow-card">
        <p className="mb-3 text-xs font-medium text-purple-dark">Cycle Phases</p>
        <div className="flex h-3 overflow-hidden rounded-full">
          <div className="w-[17%] bg-pink-mid" />
          <div className="w-[30%] bg-purple-mid/60" />
          <div className="w-[3%] bg-teal-mid" />
          <div className="flex-1 bg-peach/80" />
        </div>
        <div className="mt-2 flex flex-wrap gap-3 text-[9px] text-gray-500">
          <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-pink-mid" /> Period</span>
          <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-purple-mid/60" /> Follicular</span>
          <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-teal-mid" /> Ovulation</span>
          <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-peach/80" /> Luteal</span>
        </div>
      </div>

      <div className="mb-5 rounded-2xl bg-white p-4 shadow-card">
        <div className="mb-3 grid grid-cols-7 gap-1 text-center text-[10px] text-gray-400">
          {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => (
            <span key={d}>{d}</span>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-y-2">
          {Array.from({ length: month.startOffset }).map((_, i) => (
            <div key={`empty-${i}`} />
          ))}
          {Array.from({ length: month.daysInMonth }, (_, i) => i + 1).map((day) => {
            const dateKey = dateKeyForDayOfMonth(day, now);
            return (
              <div key={day} className="flex justify-center">
                <CalendarDay
                  day={day}
                  mark={resolveMark(dateKey, markedDays, month.todayKey)}
                  onClick={() => toggleDay(dateKey)}
                />
              </div>
            );
          })}
        </div>
      </div>

      <div className="rounded-2xl bg-white p-4 shadow-card">
        <p className="mb-1 font-serif text-base text-purple-dark">Today&apos;s Symptoms</p>
        <p className="mb-3 text-[10px] text-gray-500">{formatTodayLong(now)}</p>
        <div className="flex flex-wrap gap-2">
          {ALL_SYMPTOMS.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => toggleSymptom(s)}
              className={`rounded-full px-3 py-1.5 text-[10px] font-medium transition-colors ${
                selectedSymptoms.includes(s)
                  ? "bg-peach/70 text-purple-dark"
                  : "border border-gray-200 bg-white text-gray-600"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={saveSymptoms}
          className="mt-4 w-full rounded-full bg-pink-mid py-2.5 text-xs font-medium text-white"
        >
          {symptomSaved ? "Saved ✓" : "Save symptoms"}
        </button>
      </div>
    </AppShell>
  );
}

function ModeButton({
  active,
  label,
  color,
  onClick,
}: {
  active: boolean;
  label: string;
  color: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex-1 rounded-full py-2 text-[10px] font-medium transition-opacity ${
        active ? `${color} text-white` : "border border-gray-200 bg-white text-gray-600"
      }`}
    >
      {label}
    </button>
  );
}
