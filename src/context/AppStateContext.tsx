"use client";

import { createContext, useContext, useEffect, useState, ReactNode, useCallback, useMemo } from "react";
import { loadJSON, saveJSON } from "@/lib/storage";
import { CycleState, CycleMode, DEFAULT_CYCLE, migrateCycleState } from "@/lib/cycle";
import { extractPeriodStarts } from "@/lib/cycle-prediction";
import { cycleStartFromDay, getCurrentCycleDay } from "@/lib/datetime";
import { AssessmentResult } from "@/lib/assessment";
import { UserProfile, DEFAULT_PROFILE } from "@/lib/profile";
import type { IntakeAnswers, IntakePlan } from "@/lib/intake";

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
  toggleSymptom: (symptom: string) => void;
  saveSymptoms: () => void;
  symptomSaved: boolean;
  lastSymptomSaveDate: string | null;
  assessmentResult: AssessmentResult | null;
  saveAssessmentResult: (result: AssessmentResult) => void;
  updateIntakeProfile: (answers: IntakeAnswers, plan: IntakePlan) => void;
  clearAssessmentResult: () => void;
}

const AppStateContext = createContext<AppStateContextValue | null>(null);

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<UserProfile>(DEFAULT_PROFILE);
  const [cycle, setCycle] = useState<CycleState>(DEFAULT_CYCLE);
  const [symptomSaved, setSymptomSaved] = useState(false);
  const [lastSymptomSaveDate, setLastSymptomSaveDate] = useState<string | null>(null);
  const [assessmentResult, setAssessmentResult] = useState<AssessmentResult | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const [today, setToday] = useState(() => new Date());

  useEffect(() => {
    setProfile(migrateProfile(loadJSON("profile", DEFAULT_PROFILE)));
    setCycle(migrateCycleState(loadJSON("cycle", DEFAULT_CYCLE)));
    setAssessmentResult(migrateAssessmentResult(loadJSON("assessment-result", null)));
    setLastSymptomSaveDate(loadJSON<string | null>("last-symptom-save", null));
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

  const currentCycleDay = useMemo(
    () => getCurrentCycleDay(cycle.cycleStartDate, today),
    [cycle.cycleStartDate, today],
  );

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

      const periodStarts = extractPeriodStarts(next);
      const latestStart = periodStarts[periodStarts.length - 1];

      return {
        ...prev,
        markedDays: next,
        cycleMode: mode,
        cycleStartDate: latestStart ?? prev.cycleStartDate,
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

  const saveSymptoms = useCallback(() => {
    const today = new Date().toISOString().slice(0, 10);
    setLastSymptomSaveDate(today);
    saveJSON("last-symptom-save", today);
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

  const clearAssessmentResult = useCallback(() => {
    setAssessmentResult(null);
    saveJSON("assessment-result", null);
  }, []);

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
        toggleSymptom,
        saveSymptoms,
        symptomSaved,
        lastSymptomSaveDate,
        assessmentResult,
        saveAssessmentResult,
        updateIntakeProfile,
        clearAssessmentResult,
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
