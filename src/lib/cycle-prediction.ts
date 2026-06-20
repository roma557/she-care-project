import type { DayMark } from "@/lib/cycle";
import { addDays, parseDateKey, startOfDay, toDateKey } from "@/lib/datetime";
import type { CalendarCell } from "@/components/ui/CalendarGrid";
import type { SubscriptionTier } from "@/lib/subscription";

export type CycleRegularity = "regular" | "irregular" | "absent" | "unknown";

export interface PeriodRecord {
  startDate: string;
  endDate: string;
  periodLengthDays: number;
  /** Days from the previous period start to this one */
  cycleLength?: number;
  /** True when today falls within this period streak */
  isActive?: boolean;
}

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

/** Build structured period records (newest first) from calendar marks. */
export function extractPeriodRecords(
  markedDays: Record<string, DayMark>,
  todayKey?: string,
): PeriodRecord[] {
  const periodKeys = Object.entries(markedDays)
    .filter(([, mark]) => mark === "period")
    .map(([key]) => key)
    .sort();

  const chronological: PeriodRecord[] = [];
  let i = 0;
  while (i < periodKeys.length) {
    const startDate = periodKeys[i];
    let endDate = startDate;
    while (i + 1 < periodKeys.length) {
      const next = periodKeys[i + 1];
      const expected = toDateKey(addDays(parseDateKey(endDate), 1));
      if (next !== expected) break;
      endDate = next;
      i++;
    }
    chronological.push({
      startDate,
      endDate,
      periodLengthDays: daysBetween(startDate, endDate) + 1,
    });
    i++;
  }

  for (let j = 1; j < chronological.length; j++) {
    chronological[j].cycleLength = daysBetween(
      chronological[j - 1].startDate,
      chronological[j].startDate,
    );
  }

  if (todayKey && chronological.length) {
    const latest = chronological[chronological.length - 1];
    if (todayKey >= latest.startDate && todayKey <= latest.endDate) {
      latest.isActive = true;
    }
  }

  return chronological.reverse();
}

export function isPeriodActive(
  markedDays: Record<string, DayMark>,
  todayKey: string,
): boolean {
  const records = extractPeriodRecords(markedDays, todayKey);
  return records.some((r) => r.isActive);
}

/** Mark today (or dateKey) as period day 1 of a new or continuing streak. */
export function applyPeriodStart(
  markedDays: Record<string, DayMark>,
  dateKey: string,
): Record<string, DayMark> {
  return { ...markedDays, [dateKey]: "period" };
}

/** Close the current or most recent period streak at dateKey. */
export function applyPeriodEnd(
  markedDays: Record<string, DayMark>,
  dateKey: string,
): Record<string, DayMark> {
  const chronological = [...extractPeriodRecords(markedDays)].reverse();
  if (!chronological.length) return markedDays;

  let target =
    chronological.find((r) => dateKey >= r.startDate && dateKey <= r.endDate) ??
    chronological[chronological.length - 1];

  const next = { ...markedDays };
  let cursor = parseDateKey(target.startDate);
  const end = parseDateKey(dateKey);

  while (cursor <= end) {
    next[toDateKey(cursor)] = "period";
    cursor = addDays(cursor, 1);
  }

  cursor = addDays(end, 1);
  while (next[toDateKey(cursor)] === "period") {
    delete next[toDateKey(cursor)];
    cursor = addDays(cursor, 1);
  }

  return next;
}

export function syncCycleStartDate(
  markedDays: Record<string, DayMark>,
  fallback: string,
): string {
  const starts = extractPeriodStarts(markedDays);
  return starts[starts.length - 1] ?? fallback;
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
  predictionTier?: SubscriptionTier;
}): CycleProjection {
  const { markedDays, cycleLength, cycleRegularity, fertilityGoal, predictionTier = "free" } = input;

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
    predictionTier !== "free" &&
    cycleRegularity === "regular" &&
    periodStarts.length >= 1;

  const predictedPeriodKeys = new Set<string>();
  const fertileDateKeys = new Set<string>();
  let nextPeriodEstimate: string | undefined;

  if (showPredictions) {
    const lastStart = periodStarts[periodStarts.length - 1];
    nextPeriodEstimate = toDateKey(addDays(parseDateKey(lastStart), avgCycleLength));

    for (let i = 0; i < 5; i++) {
      predictedPeriodKeys.add(toDateKey(addDays(parseDateKey(nextPeriodEstimate), i)));
    }

    const canFertilityBasic = predictionTier === "starter" || predictionTier === "plus" || predictionTier === "premium";
    const canFertilityAdvanced = predictionTier === "plus" || predictionTier === "premium";

    if (fertilityGoal && canFertilityBasic) {
      const ovulDay = Math.round(avgCycleLength * 0.5);
      const ovulKey = toDateKey(addDays(parseDateKey(lastStart), ovulDay));
      if (canFertilityAdvanced) {
        for (let offset = -2; offset <= 2; offset++) {
          fertileDateKeys.add(toDateKey(addDays(parseDateKey(ovulKey), offset)));
        }
      } else {
        fertileDateKeys.add(ovulKey);
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

export function formatPeriodDate(dateKey: string): string {
  return parseDateKey(dateKey).toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}
