"use client";

import { AppShell } from "@/components/layout/AppShell";
import { CycleHistoryList } from "@/components/ui/CycleHistoryList";
import { ScreenBackHeader } from "@/components/ui/ScreenBackHeader";
import { useAppState } from "@/context/AppStateContext";
import {
  buildCycleProjection,
  extractPeriodRecords,
  normalizeCycleRegularity,
} from "@/lib/cycle-prediction";
import { toDateKey } from "@/lib/datetime";

interface CycleHistoryScreenProps {
  onBack: () => void;
}

export function CycleHistoryScreen({ onBack }: CycleHistoryScreenProps) {
  const { profile, cycle } = useAppState();
  const todayKey = toDateKey(new Date());

  const cycleLength = profile.cycleLength || 28;
  const regularity = normalizeCycleRegularity(profile.intakeAnswers?.cycleRegularity);

  const projection = buildCycleProjection({
    markedDays: cycle.markedDays,
    cycleLength,
    cycleRegularity: regularity,
    fertilityGoal: profile.intakeAnswers?.primaryGoal === "fertility",
  });

  const records = extractPeriodRecords(cycle.markedDays, todayKey);

  return (
    <AppShell hasNav={false} className="bg-bg">
      <ScreenBackHeader
        title="Cycle history"
        subtitle={`${records.length} logged cycle${records.length !== 1 ? "s" : ""} · ${projection.avgCycleLength} day average`}
        onBack={onBack}
      />

      {projection.showPredictions && projection.nextPeriodEstimate && (
        <div className="mb-5 rounded-card border border-rose-pale bg-rose-pale/30 p-4">
          <p className="text-[0.65rem] font-medium uppercase tracking-wider text-rose-deep">
            Next period estimate
          </p>
          <p className="mt-1 font-serif text-lg text-ink">
            {new Date(projection.nextPeriodEstimate + "T00:00:00").toLocaleDateString(undefined, {
              weekday: "long",
              day: "numeric",
              month: "long",
            })}
          </p>
          <p className="mt-1 text-[0.65rem] font-light text-ink-mid">
            Based on your last {records.length} logged cycle{records.length !== 1 ? "s" : ""} and
            average length of {projection.avgCycleLength} days.
          </p>
        </div>
      )}

      <CycleHistoryList records={records} dailyLogs={cycle.dailyLogs} />
    </AppShell>
  );
}
