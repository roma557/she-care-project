import { cycleStartFromDay, toDateKey, addDays, startOfDay, parseDateKey } from "@/lib/datetime";

export type DayMark = "period" | "ovulation";
export type CycleMode = DayMark;

export interface CycleState {
  /** ISO date keys YYYY-MM-DD */
  markedDays: Record<string, DayMark>;
  cycleMode: CycleMode;
  selectedSymptoms: string[];
  /** ISO date when cycle day 1 started */
  cycleStartDate: string;
}

function buildDefaultMarkedDays(cycleStartDate: string): Record<string, DayMark> {
  const start = startOfDay(parseDateKey(cycleStartDate));
  const marked: Record<string, DayMark> = {};
  for (let i = 0; i < 5; i++) {
    marked[toDateKey(addDays(start, i))] = "period";
  }
  marked[toDateKey(addDays(start, 13))] = "ovulation";
  return marked;
}

const defaultStart = cycleStartFromDay(8);

export const DEFAULT_CYCLE: CycleState = {
  markedDays: buildDefaultMarkedDays(defaultStart),
  cycleMode: "period",
  selectedSymptoms: [],
  cycleStartDate: defaultStart,
};

export const ALL_SYMPTOMS = [
  "Cramps",
  "Fatigue",
  "Mood",
  "Headache",
  "Bloating",
  "Cravings",
  "Insomnia",
  "Brain fog",
  "Anxiety",
] as const;

export interface CyclePhase {
  name: string;
  emoji: string;
  message: string;
}

export function getCyclePhase(cycleDay: number): CyclePhase {
  if (cycleDay <= 5) {
    return { name: "Menstruation", emoji: "🌙", message: "Rest and replenish — be gentle with yourself" };
  }
  if (cycleDay <= 13) {
    return { name: "Follicular Phase", emoji: "🌸", message: "Energy is rising — great time to start new habits" };
  }
  if (cycleDay === 14) {
    return { name: "Ovulation", emoji: "✨", message: "Peak energy window — listen to your body" };
  }
  return { name: "Luteal Phase", emoji: "🍂", message: "Wind down — prioritise sleep and low-GI meals" };
}

/** Migrate legacy cycle state (numeric day keys) to ISO date keys */
export function migrateCycleState(raw: unknown): CycleState {
  if (!raw || typeof raw !== "object") return DEFAULT_CYCLE;

  const state = raw as Partial<CycleState> & { cycleDay?: number; markedDays?: Record<string | number, DayMark> };

  if (state.cycleStartDate && typeof state.cycleStartDate === "string") {
    return {
      markedDays: state.markedDays ?? {},
      cycleMode: state.cycleMode ?? "period",
      selectedSymptoms: state.selectedSymptoms ?? [],
      cycleStartDate: state.cycleStartDate,
    };
  }

  const cycleDay = state.cycleDay ?? 8;
  const cycleStartDate = cycleStartFromDay(cycleDay);
  return {
    markedDays: {},
    cycleMode: state.cycleMode ?? "period",
    selectedSymptoms: state.selectedSymptoms ?? [],
    cycleStartDate,
  };
}
