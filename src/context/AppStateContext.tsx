"use client";

import { createContext, useContext, useEffect, useState, ReactNode, useCallback, useMemo } from "react";
import { loadJSON, saveJSON } from "@/lib/storage";
import { CycleState, CycleMode, DEFAULT_CYCLE, migrateCycleState } from "@/lib/cycle";
import {
  applyPeriodEnd,
  applyPeriodStart,
  syncCycleStartDate,
} from "@/lib/cycle-prediction";
import { cycleStartFromDay, getCurrentCycleDay, toDateKey } from "@/lib/datetime";
import { AssessmentResult } from "@/lib/assessment";
import { UserProfile, DEFAULT_PROFILE } from "@/lib/profile";
import type { IntakeAnswers, IntakePlan } from "@/lib/intake";
import {
  DailyInsightEntry,
  DEFAULT_INSIGHTS,
  InsightsState,
  MAX_HYDRATION_GLASSES,
  MAX_SLEEP_HOURS,
  MIN_SLEEP_HOURS,
  StressLevel,
  getInsightForDate,
  getRecentInsightDates,
  migrateInsightsState,
} from "@/lib/insights";

function migrateAssessmentResult(raw: unknown): AssessmentResult | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Partial<AssessmentResult>;
  if (!Array.isArray(r.summaryLines) || !Array.isArray(r.topTips)) return null;
  return r as AssessmentResult;
}

function migrateProfile(raw: unknown): UserProfile {
  if (!raw || typeof raw !== "object") return DEFAULT_PROFILE;
  const p = raw as Partial<UserProfile>;
  return { ...DEFAULT_PROFILE, ...p };
}

interface AppStateContextValue {
  profile: UserProfile;
  hydrated: boolean;
  completeOnboarding: (data: {
    name?: string;
    intakeAnswers: IntakeAnswers;
    intakePlan: IntakePlan;
  }) => void;
  cycle: CycleState;
  currentCycleDay: number;
  setCycleMode: (mode: CycleMode) => void;
  toggleDay: (dateKey: string) => void;
  logPeriodStart: (dateKey?: string) => void;
  logPeriodEnd: (dateKey?: string) => void;
  hydrateTodayLog: () => void;
  toggleSymptom: (symptom: string) => void;
  saveSymptoms: (flowLevel: number) => void;
  symptomSaved: boolean;
  lastSymptomSaveDate: string | null;
  assessmentResult: AssessmentResult | null;
  saveAssessmentResult: (result: AssessmentResult) => void;
  updateIntakeProfile: (answers: IntakeAnswers, plan: IntakePlan) => void;
  updateProfile: (patch: Partial<UserProfile>) => void;
  clearAssessmentResult: () => void;
  insights: InsightsState;
  todayInsights: DailyInsightEntry;
  recentInsights: { dateKey: string; entry: DailyInsightEntry }[];
  incrementHydration: () => void;
  decrementHydration: () => void;
  adjustSleepHours: (delta: number) => void;
  setStressLevel: (stress: StressLevel) => void;
  rehydrateFromStorage: () => void;
}

const AppStateContext = createContext<AppStateContextValue | null>(null);

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<UserProfile>(DEFAULT_PROFILE);
  const [cycle, setCycle] = useState<CycleState>(DEFAULT_CYCLE);
  const [symptomSaved, setSymptomSaved] = useState(false);
  const [lastSymptomSaveDate, setLastSymptomSaveDate] = useState<string | null>(null);
  const [assessmentResult, setAssessmentResult] = useState<AssessmentResult | null>(null);
  const [insights, setInsights] = useState<InsightsState>(DEFAULT_INSIGHTS);
  const [hydrated, setHydrated] = useState(false);
  const [today, setToday] = useState(() => new Date());

  const todayKey = useMemo(() => toDateKey(today), [today]);

  useEffect(() => {
    setProfile(migrateProfile(loadJSON("profile", DEFAULT_PROFILE)));
    setCycle(migrateCycleState(loadJSON("cycle", DEFAULT_CYCLE)));
    setAssessmentResult(migrateAssessmentResult(loadJSON("assessment-result", null)));
    setLastSymptomSaveDate(loadJSON<string | null>("last-symptom-save", null));
    setInsights(migrateInsightsState(loadJSON("insights", DEFAULT_INSIGHTS)));
    setHydrated(true);

    const midnight = new Date();
    midnight.setHours(24, 0, 0, 0);
    const ms = midnight.getTime() - Date.now();
    const id = setTimeout(() => setToday(new Date()), ms);
    return () => clearTimeout(id);
  }, []);

  useEffect(() => {
    if (hydrated) saveJSON("profile", profile);
  }, [profile, hydrated]);

  useEffect(() => {
    if (hydrated) saveJSON("cycle", cycle);
  }, [cycle, hydrated]);

  useEffect(() => {
    if (hydrated) saveJSON("insights", insights);
  }, [insights, hydrated]);

  const todayInsights = useMemo(
    () => getInsightForDate(insights, todayKey),
    [insights, todayKey],
  );

  const recentInsights = useMemo(
    () =>
      getRecentInsightDates(7, today).map((dateKey) => ({
        dateKey,
        entry: getInsightForDate(insights, dateKey),
      })),
    [insights, today],
  );

  const updateTodayInsights = useCallback(
    (patch: Partial<DailyInsightEntry>) => {
      setInsights((prev) => {
        const current = getInsightForDate(prev, todayKey);
        return {
          history: {
            ...prev.history,
            [todayKey]: { ...current, ...patch },
          },
        };
      });
    },
    [todayKey],
  );

  const currentCycleDay = useMemo(
    () => getCurrentCycleDay(cycle.cycleStartDate, today),
    [cycle.cycleStartDate, today],
  );

  const rehydrateFromStorage = useCallback(() => {
    setProfile(migrateProfile(loadJSON("profile", DEFAULT_PROFILE)));
    setCycle(migrateCycleState(loadJSON("cycle", DEFAULT_CYCLE)));
    setAssessmentResult(migrateAssessmentResult(loadJSON("assessment-result", null)));
    setLastSymptomSaveDate(loadJSON<string | null>("last-symptom-save", null));
    setInsights(migrateInsightsState(loadJSON("insights", DEFAULT_INSIGHTS)));
  }, []);

  const completeOnboarding = useCallback(
    (data: {
      name?: string;
      intakeAnswers: IntakeAnswers;
      intakePlan: IntakePlan;
    }) => {
      const { intakeAnswers, intakePlan } = data;
      const cycleStartDate = cycleStartFromDay(1);
      setProfile({
        name: data.name ?? intakeAnswers.name ?? "",
        onboardingComplete: true,
        cycleLength: intakeAnswers.cycleLength,
        symptomTags: [],
        dietaryTags: intakeAnswers.dietaryTags,
        activityLevel: intakeAnswers.activityLevel,
        intakeAnswers,
      });
      setCycle((prev) => ({ ...prev, cycleStartDate }));
      setAssessmentResult(intakePlan);
      saveJSON("assessment-result", intakePlan);
    },
    [],
  );

  const setCycleMode = useCallback((mode: CycleMode) => {
    setCycle((prev) => ({ ...prev, cycleMode: mode }));
  }, []);

  const toggleDay = useCallback((dateKey: string) => {
    setCycle((prev) => {
      const next = { ...prev.markedDays };
      const mode = "period";
      if (next[dateKey] === mode) delete next[dateKey];
      else next[dateKey] = mode;

      return {
        ...prev,
        markedDays: next,
        cycleMode: mode,
        cycleStartDate: syncCycleStartDate(next, prev.cycleStartDate),
      };
    });
  }, []);

  const logPeriodStart = useCallback((dateKey?: string) => {
    const key = dateKey ?? toDateKey(new Date());
    setCycle((prev) => {
      const markedDays = applyPeriodStart(prev.markedDays, key);
      return {
        ...prev,
        markedDays,
        cycleMode: "period",
        cycleStartDate: syncCycleStartDate(markedDays, key),
      };
    });
  }, []);

  const logPeriodEnd = useCallback((dateKey?: string) => {
    const key = dateKey ?? toDateKey(new Date());
    setCycle((prev) => {
      const markedDays = applyPeriodEnd(prev.markedDays, key);
      return {
        ...prev,
        markedDays,
        cycleStartDate: syncCycleStartDate(markedDays, prev.cycleStartDate),
      };
    });
  }, []);

  const hydrateTodayLog = useCallback(() => {
    const key = toDateKey(new Date());
    setCycle((prev) => {
      const log = prev.dailyLogs[key];
      return {
        ...prev,
        selectedSymptoms: log?.symptoms ?? [],
      };
    });
  }, []);

  const toggleSymptom = useCallback((symptom: string) => {
    setSymptomSaved(false);
    setCycle((prev) => {
      const has = prev.selectedSymptoms.includes(symptom);
      return {
        ...prev,
        selectedSymptoms: has
          ? prev.selectedSymptoms.filter((s) => s !== symptom)
          : [...prev.selectedSymptoms, symptom],
      };
    });
  }, []);

  const saveSymptoms = useCallback((flowLevel: number) => {
    const today = toDateKey(new Date());
    setLastSymptomSaveDate(today);
    saveJSON("last-symptom-save", today);
    setCycle((prev) => ({
      ...prev,
      dailyLogs: {
        ...prev.dailyLogs,
        [today]: {
          flowLevel,
          symptoms: [...prev.selectedSymptoms],
        },
      },
    }));
    setSymptomSaved(true);
    setTimeout(() => setSymptomSaved(false), 3000);
  }, []);

  const saveAssessmentResult = useCallback((result: AssessmentResult) => {
    setAssessmentResult(result);
    saveJSON("assessment-result", result);
  }, []);

  const updateIntakeProfile = useCallback((answers: IntakeAnswers, plan: IntakePlan) => {
    setProfile((prev) => ({
      ...prev,
      name: answers.name || prev.name,
      cycleLength: answers.cycleLength,
      dietaryTags: answers.dietaryTags,
      activityLevel: answers.activityLevel,
      intakeAnswers: answers,
    }));
    setAssessmentResult(plan);
    saveJSON("assessment-result", plan);
  }, []);

  const updateProfile = useCallback((patch: Partial<UserProfile>) => {
    setProfile((prev) => ({ ...prev, ...patch }));
  }, []);

  const clearAssessmentResult = useCallback(() => {
    setAssessmentResult(null);
    saveJSON("assessment-result", null);
  }, []);

  const incrementHydration = useCallback(() => {
    setInsights((prev) => {
      const current = getInsightForDate(prev, todayKey);
      if (current.hydrationGlasses >= MAX_HYDRATION_GLASSES) return prev;
      return {
        history: {
          ...prev.history,
          [todayKey]: {
            ...current,
            hydrationGlasses: current.hydrationGlasses + 1,
          },
        },
      };
    });
  }, [todayKey]);

  const decrementHydration = useCallback(() => {
    setInsights((prev) => {
      const current = getInsightForDate(prev, todayKey);
      if (current.hydrationGlasses <= 0) return prev;
      return {
        history: {
          ...prev.history,
          [todayKey]: {
            ...current,
            hydrationGlasses: current.hydrationGlasses - 1,
          },
        },
      };
    });
  }, [todayKey]);

  const adjustSleepHours = useCallback(
    (delta: number) => {
      setInsights((prev) => {
        const current = getInsightForDate(prev, todayKey);
        const next = Math.min(
          MAX_SLEEP_HOURS,
          Math.max(MIN_SLEEP_HOURS, Math.round((current.sleepHours + delta) * 2) / 2),
        );
        if (next === current.sleepHours) return prev;
        return {
          history: {
            ...prev.history,
            [todayKey]: { ...current, sleepHours: next },
          },
        };
      });
    },
    [todayKey],
  );

  const setStressLevel = useCallback(
    (stress: StressLevel) => {
      updateTodayInsights({ stress });
    },
    [updateTodayInsights],
  );

  return (
    <AppStateContext.Provider
      value={{
        profile,
        hydrated,
        completeOnboarding,
        cycle,
        currentCycleDay,
        setCycleMode,
        toggleDay,
        logPeriodStart,
        logPeriodEnd,
        hydrateTodayLog,
        toggleSymptom,
        saveSymptoms,
        symptomSaved,
        lastSymptomSaveDate,
        assessmentResult,
        saveAssessmentResult,
        updateIntakeProfile,
        updateProfile,
        clearAssessmentResult,
        insights,
        todayInsights,
        recentInsights,
        incrementHydration,
        decrementHydration,
        adjustSleepHours,
        setStressLevel,
        rehydrateFromStorage,
      }}
    >
      {children}
    </AppStateContext.Provider>
  );
}

export function useAppState() {
  const ctx = useContext(AppStateContext);
  if (!ctx) throw new Error("useAppState must be used within AppStateProvider");
  return ctx;
}
