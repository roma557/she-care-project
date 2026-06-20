import { addDays, startOfDay, toDateKey } from "@/lib/datetime";
import type { IconName } from "@/components/ui/icons";

export type StressLevel = "low" | "moderate" | "high";

export interface DailyInsightEntry {
  hydrationGlasses: number;
  sleepHours: number;
  stress: StressLevel | null;
}

export interface InsightsState {
  /** ISO date key → daily log */
  history: Record<string, DailyInsightEntry>;
}

export const HYDRATION_GOAL = 8;
export const MAX_HYDRATION_GLASSES = 20;
export const MIN_SLEEP_HOURS = 0;
export const MAX_SLEEP_HOURS = 14;

export const DEFAULT_DAILY_INSIGHT: DailyInsightEntry = {
  hydrationGlasses: 0,
  sleepHours: 0,
  stress: null,
};

export const DEFAULT_INSIGHTS: InsightsState = {
  history: {},
};

export const STRESS_OPTIONS: { value: StressLevel; label: string }[] = [
  { value: "low", label: "Low" },
  { value: "moderate", label: "Moderate" },
  { value: "high", label: "High" },
];

export function migrateInsightsState(raw: unknown): InsightsState {
  if (!raw || typeof raw !== "object") return DEFAULT_INSIGHTS;
  const state = raw as Partial<InsightsState>;
  if (!state.history || typeof state.history !== "object") return DEFAULT_INSIGHTS;

  const history: Record<string, DailyInsightEntry> = {};
  for (const [dateKey, entry] of Object.entries(state.history)) {
    if (!entry || typeof entry !== "object") continue;
    const e = entry as Partial<DailyInsightEntry>;
    history[dateKey] = {
      hydrationGlasses: clampNumber(e.hydrationGlasses ?? 0, 0, MAX_HYDRATION_GLASSES),
      sleepHours: clampNumber(e.sleepHours ?? 0, MIN_SLEEP_HOURS, MAX_SLEEP_HOURS),
      stress: isStressLevel(e.stress) ? e.stress : null,
    };
  }

  return { history };
}

function clampNumber(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function isStressLevel(value: unknown): value is StressLevel {
  return value === "low" || value === "moderate" || value === "high";
}

export function getInsightForDate(
  state: InsightsState,
  dateKey: string,
): DailyInsightEntry {
  return state.history[dateKey] ?? DEFAULT_DAILY_INSIGHT;
}

export function getRecentInsightDates(days: number, from: Date = new Date()): string[] {
  const start = startOfDay(from);
  return Array.from({ length: days }, (_, i) => toDateKey(addDays(start, -i))).reverse();
}

export function formatStressLabel(stress: StressLevel | null): string {
  if (!stress) return "—";
  return STRESS_OPTIONS.find((o) => o.value === stress)?.label ?? "—";
}

export function formatSleepDisplay(hours: number): { value: string; unit: string } {
  if (hours <= 0) return { value: "—", unit: "" };
  const rounded = Math.round(hours * 2) / 2;
  return { value: String(rounded), unit: "hrs" };
}

export function formatHydrationDisplay(glasses: number): { value: string; unit: string } {
  if (glasses <= 0) return { value: "—", unit: "" };
  return { value: String(glasses), unit: glasses === 1 ? "glass" : "glasses" };
}

export interface InsightCardData {
  icon: IconName;
  title: string;
  value: string;
  unit: string;
}

export function buildHomeInsightCards(entry: DailyInsightEntry): InsightCardData[] {
  const hydration = formatHydrationDisplay(entry.hydrationGlasses);
  const sleep = formatSleepDisplay(entry.sleepHours);

  return [
    { icon: "droplet", title: "Hydration", value: hydration.value, unit: hydration.unit },
    { icon: "moon", title: "Sleep", value: sleep.value, unit: sleep.unit },
    {
      icon: "wind",
      title: "Stress",
      value: formatStressLabel(entry.stress),
      unit: "",
    },
  ];
}

export function formatInsightDateLabel(dateKey: string, todayKey: string): string {
  if (dateKey === todayKey) return "Today";
  const date = new Date(dateKey + "T12:00:00");
  return date.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });
}
