"use client";

import { createContext, useContext, useEffect, useState, ReactNode, useCallback, useMemo } from "react";
import { loadJSON, saveJSON } from "@/lib/storage";
import { CycleState, CycleMode, DEFAULT_CYCLE, migrateCycleState } from "@/lib/cycle";
import { cycleStartFromDay, getCurrentCycleDay } from "@/lib/datetime";
import { AssessmentResult } from "@/lib/assessment";
import { UserProfile, DEFAULT_PROFILE } from "@/lib/profile";

interface AppStateContextValue {
  profile: UserProfile;
  hydrated: boolean;
  completeOnboarding: (name: string, cycleDay: number) => void;
  cycle: CycleState;
  currentCycleDay: number;
  setCycleMode: (mode: CycleMode) => void;
  toggleDay: (dateKey: string) => void;
  toggleSymptom: (symptom: string) => void;
  saveSymptoms: () => void;
  symptomSaved: boolean;
  assessmentResult: AssessmentResult | null;
  saveAssessmentResult: (result: AssessmentResult) => void;
  clearAssessmentResult: () => void;
}

const AppStateContext = createContext<AppStateContextValue | null>(null);

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<UserProfile>(DEFAULT_PROFILE);
  const [cycle, setCycle] = useState<CycleState>(DEFAULT_CYCLE);
  const [symptomSaved, setSymptomSaved] = useState(false);
  const [assessmentResult, setAssessmentResult] = useState<AssessmentResult | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const [today, setToday] = useState(() => new Date());

  useEffect(() => {
    setProfile(loadJSON("profile", DEFAULT_PROFILE));
    setCycle(migrateCycleState(loadJSON("cycle", DEFAULT_CYCLE)));
    setAssessmentResult(loadJSON("assessment-result", null));
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

  const completeOnboarding = useCallback((name: string, cycleDay: number) => {
    const cycleStartDate = cycleStartFromDay(cycleDay);
    setProfile({ name, onboardingComplete: true });
    setCycle((prev) => ({ ...prev, cycleStartDate }));
  }, []);

  const setCycleMode = useCallback((mode: CycleMode) => {
    setCycle((prev) => ({ ...prev, cycleMode: mode }));
  }, []);

  const toggleDay = useCallback((dateKey: string) => {
    setCycle((prev) => {
      const next = { ...prev.markedDays };
      const mode = prev.cycleMode;
      if (next[dateKey] === mode) delete next[dateKey];
      else next[dateKey] = mode;
      return { ...prev, markedDays: next };
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
    setSymptomSaved(true);
    setTimeout(() => setSymptomSaved(false), 3000);
  }, []);

  const saveAssessmentResult = useCallback((result: AssessmentResult) => {
    setAssessmentResult(result);
    saveJSON("assessment-result", result);
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
        assessmentResult,
        saveAssessmentResult,
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
