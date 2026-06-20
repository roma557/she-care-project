import { cycleStartFromDay, toDateKey, addDays, startOfDay, parseDateKey } from "@/lib/datetime";
import type { AppScreen } from "@/lib/phone";

export type DayMark = "period" | "ovulation";
export type CycleMode = DayMark;

export interface DayLog {
  flowLevel?: number;
  symptoms?: string[];
}

export interface CycleState {
  /** ISO date keys YYYY-MM-DD */
  markedDays: Record<string, DayMark>;
  cycleMode: CycleMode;
  selectedSymptoms: string[];
  /** Per-day flow & symptom logs keyed by ISO date */
  dailyLogs: Record<string, DayLog>;
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
  dailyLogs: {},
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

import type { IconName } from "@/components/ui/icons";

export interface CyclePhase {
  name: string;
  icon: IconName;
  message: string;
}

export function getCyclePhase(cycleDay: number): CyclePhase {
  if (cycleDay <= 5) {
    return { name: "Menstruation", icon: "moon", message: "Rest and replenish — be gentle with yourself" };
  }
  if (cycleDay <= 13) {
    return { name: "Follicular Phase", icon: "flower", message: "Energy is rising — great time to start new habits" };
  }
  if (cycleDay === 14) {
    return { name: "Ovulation", icon: "sparkle", message: "Peak energy window — listen to your body" };
  }
  return { name: "Luteal Phase", icon: "leaf", message: "Wind down — prioritise sleep and low-GI meals" };
}

const FLOW_LABELS = ["", "Light", "Medium", "Heavy"] as const;

export function getFlowLabel(level: number): string {
  return FLOW_LABELS[level] ?? "Medium";
}

export function getDaysToOvulation(cycleDay: number, ovulationDay = 14): number {
  if (cycleDay >= ovulationDay) return 0;
  return ovulationDay - cycleDay;
}

export interface PlusCycleInsights {
  fertilityLabel: string;
  insightTitle: string;
  insightDetail: string;
  insightScreen: AppScreen;
}

const DEFAULT_OVULATION_DAY = 14;
const FERTILE_WINDOW_OFFSET = 2;

export function getPlusCycleInsights(cycleDay: number, _cycleLength = 28): PlusCycleInsights {
  const fertileStart = DEFAULT_OVULATION_DAY - FERTILE_WINDOW_OFFSET;
  const fertileEnd = DEFAULT_OVULATION_DAY + FERTILE_WINDOW_OFFSET;
  const daysToOvulation = getDaysToOvulation(cycleDay, DEFAULT_OVULATION_DAY);

  let fertilityLabel: string;
  if (cycleDay === DEFAULT_OVULATION_DAY) {
    fertilityLabel = "Today";
  } else if (cycleDay >= fertileStart && cycleDay <= fertileEnd) {
    fertilityLabel = "In window";
  } else if (cycleDay < fertileStart) {
    fertilityLabel = `${fertileStart - cycleDay}d`;
  } else {
    fertilityLabel = "—";
  }

  if (cycleDay <= 5) {
    return {
      fertilityLabel,
      insightTitle: "Cycle trends",
      insightDetail: "logging builds your patterns",
      insightScreen: "cycle",
    };
  }
  if (cycleDay <= 9) {
    return {
      fertilityLabel,
      insightTitle: "Fertility window",
      insightDetail: `opens in ${fertileStart - cycleDay}d`,
      insightScreen: "cycle",
    };
  }
  if (cycleDay === DEFAULT_OVULATION_DAY) {
    return {
      fertilityLabel,
      insightTitle: "Ovulation",
      insightDetail: "today · peak fertility",
      insightScreen: "cycle",
    };
  }
  if (cycleDay >= 10 && cycleDay <= fertileEnd) {
    return {
      fertilityLabel,
      insightTitle: "Fertile window",
      insightDetail:
        daysToOvulation > 0
          ? `active · ovulation in ${daysToOvulation}d`
          : "active · post-ovulation",
      insightScreen: "cycle",
    };
  }
  return {
    fertilityLabel,
    insightTitle: "PMS watch",
    insightDetail: "early signals active",
    insightScreen: "insights",
  };
}

export interface PhaseProgress {
  phaseDay: number;
  phaseTotal: number;
  subtitleDay: number;
  subtitleTotal: number;
}

export function getPhaseProgress(
  cycleDay: number,
  cycleLength = 28,
  periodLength = 5,
): PhaseProgress {
  if (cycleDay <= 5) {
    return {
      phaseDay: cycleDay,
      phaseTotal: periodLength,
      subtitleDay: cycleDay,
      subtitleTotal: periodLength,
    };
  }
  if (cycleDay <= 13) {
    return {
      phaseDay: cycleDay - 5,
      phaseTotal: 8,
      subtitleDay: cycleDay,
      subtitleTotal: cycleLength,
    };
  }
  if (cycleDay === 14) {
    return { phaseDay: 1, phaseTotal: 1, subtitleDay: cycleDay, subtitleTotal: cycleLength };
  }
  const lutealLength = Math.max(1, cycleLength - 14);
  return {
    phaseDay: cycleDay - 14,
    phaseTotal: lutealLength,
    subtitleDay: cycleDay,
    subtitleTotal: cycleLength,
  };
}

/** Count consecutive logged period days from cycle start. */
export function getLoggedPeriodLength(
  markedDays: Record<string, DayMark>,
  cycleStartDate: string,
): number {
  let count = 0;
  let key = cycleStartDate;
  while (markedDays[key] === "period") {
    count++;
    key = toDateKey(addDays(parseDateKey(key), 1));
  }
  return count;
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
      dailyLogs: state.dailyLogs ?? {},
      cycleStartDate: state.cycleStartDate,
    };
  }

  const cycleDay = state.cycleDay ?? 8;
  const cycleStartDate = cycleStartFromDay(cycleDay);
  return {
    markedDays: {},
    cycleMode: state.cycleMode ?? "period",
    selectedSymptoms: state.selectedSymptoms ?? [],
    dailyLogs: {},
    cycleStartDate,
  };
}
