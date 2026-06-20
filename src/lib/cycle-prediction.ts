import type { DayMark } from "@/lib/cycle";
import { addDays, parseDateKey, startOfDay, toDateKey } from "@/lib/datetime";
import type { CalendarCell } from "@/components/ui/CalendarGrid";

export type CycleRegularity = "regular" | "irregular" | "absent" | "unknown";

export interface CycleProjection {
  loggedPeriodKeys: Set<string>;
  loggedOvulationKeys: Set<string>;
  predictedPeriodKeys: Set<string>;
  fertileDateKeys: Set<string>;
  avgCycleLength: number;
  loggedCycleCount: number;
  showPredictions: boolean;
  nextPeriodEstimate?: string;
}

function daysBetween(startKey: string, endKey: string): number {
  const start = startOfDay(parseDateKey(startKey));
  const end = startOfDay(parseDateKey(endKey));
  return Math.round((end.getTime() - start.getTime()) / 86400000);
}

/** First day of each consecutive period streak in marked days. */
export function extractPeriodStarts(markedDays: Record<string, DayMark>): string[] {
  const periodKeys = Object.entries(markedDays)
    .filter(([, mark]) => mark === "period")
    .map(([key]) => key)
    .sort();

  const starts: string[] = [];
  for (const key of periodKeys) {
    const prev = toDateKey(addDays(parseDateKey(key), -1));
    if (markedDays[prev] !== "period") starts.push(key);
  }
  return starts;
}

function averageCycleLength(starts: string[], fallback: number): number {
  if (starts.length < 2) return fallback;
  const gaps: number[] = [];
  for (let i = 1; i < starts.length; i++) {
    gaps.push(daysBetween(starts[i - 1], starts[i]));
  }
  const avg = Math.round(gaps.reduce((a, b) => a + b, 0) / gaps.length);
  return Math.min(Math.max(avg, 21), 45);
}

export function buildCycleProjection(input: {
  markedDays: Record<string, DayMark>;
  cycleLength: number;
  cycleRegularity: CycleRegularity;
  fertilityGoal?: boolean;
}): CycleProjection {
  const { markedDays, cycleLength, cycleRegularity, fertilityGoal } = input;

  const loggedPeriodKeys = new Set(
    Object.entries(markedDays)
      .filter(([, m]) => m === "period")
      .map(([k]) => k),
  );
  const loggedOvulationKeys = new Set(
    Object.entries(markedDays)
      .filter(([, m]) => m === "ovulation")
      .map(([k]) => k),
  );

  const periodStarts = extractPeriodStarts(markedDays);
  const avgCycleLength = averageCycleLength(periodStarts, cycleLength);
  const showPredictions =
    cycleRegularity === "regular" && periodStarts.length >= 1;

  const predictedPeriodKeys = new Set<string>();
  const fertileDateKeys = new Set<string>();
  let nextPeriodEstimate: string | undefined;

  if (showPredictions) {
    const lastStart = periodStarts[periodStarts.length - 1];
    nextPeriodEstimate = toDateKey(addDays(parseDateKey(lastStart), avgCycleLength));

    for (let i = 0; i < 5; i++) {
      predictedPeriodKeys.add(toDateKey(addDays(parseDateKey(nextPeriodEstimate), i)));
    }

    if (fertilityGoal) {
      const ovulDay = Math.round(avgCycleLength * 0.5);
      const ovulKey = toDateKey(addDays(parseDateKey(lastStart), ovulDay));
      for (let offset = -2; offset <= 2; offset++) {
        if (offset !== 0) {
          fertileDateKeys.add(toDateKey(addDays(parseDateKey(ovulKey), offset)));
        }
      }
    }
  }

  return {
    loggedPeriodKeys,
    loggedOvulationKeys,
    predictedPeriodKeys,
    fertileDateKeys,
    avgCycleLength,
    loggedCycleCount: Math.max(periodStarts.length, 1),
    showPredictions,
    nextPeriodEstimate,
  };
}

export function buildMonthCalendarCells(
  year: number,
  month: number,
  projection: CycleProjection,
  today: number,
): CalendarCell[] {
  const startDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: CalendarCell[] = [];

  for (let i = 0; i < startDay; i++) cells.push({ day: null });

  for (let d = 1; d <= daysInMonth; d++) {
    const dateKey = toDateKey(new Date(year, month, d));
    const isLoggedPeriod = projection.loggedPeriodKeys.has(dateKey);
    const isLoggedOvulation = projection.loggedOvulationKeys.has(dateKey);
    const isPredicted =
      projection.showPredictions &&
      projection.predictedPeriodKeys.has(dateKey) &&
      !isLoggedPeriod;

    cells.push({
      day: d,
      isPeriod: isLoggedPeriod,
      isOvulation: isLoggedOvulation,
      isFertile: projection.fertileDateKeys.has(dateKey),
      isPredicted,
      isToday: d === today,
    });
  }

  return cells;
}

export function normalizeCycleRegularity(value?: string): CycleRegularity {
  if (value === "regular" || value === "irregular" || value === "absent") return value;
  return "unknown";
}
