"use client";

import { AppShell } from "@/components/layout/AppShell";
import { UpgradePrompt } from "@/components/ui/UpgradePrompt";
import { usePermissions } from "@/hooks/usePermissions";
import { useAppState } from "@/context/AppStateContext";
import { extractPeriodRecords, normalizeCycleRegularity } from "@/lib/cycle-prediction";
import { toDateKey } from "@/lib/datetime";

export function PcosDashboardScreen({ onBack }: { onBack: () => void }) {
  const { can, startCheckout, tier } = usePermissions();
  const { profile, cycle } = useAppState();
  const todayKey = toDateKey(new Date());
  const records = extractPeriodRecords(cycle.markedDays, todayKey);
  const regularity = normalizeCycleRegularity(profile.intakeAnswers?.cycleRegularity);

  if (!can("pcos_dashboard") && !can("pcos_basic")) {
    return (
      <AppShell className="bg-bg">
        <button type="button" onClick={onBack} className="mb-4 text-xs text-ink-faint">
          ← Back
        </button>
        <UpgradePrompt
          feature="PCOS monitoring"
          requiredTier="plus"
          onUpgrade={(t) => startCheckout(t)}
        />
      </AppShell>
    );
  }

  const symptomDays = Object.values(cycle.dailyLogs ?? {}).filter(
    (log) => (log.symptoms?.length ?? 0) > 0,
  ).length;
  const isPremium = can("pcos_dashboard");
  const cycleLengths = records
    .map((r) => r.cycleLength)
    .filter((l): l is number => l !== undefined);
  const avgLength =
    cycleLengths.length > 0
      ? Math.round(cycleLengths.reduce((a, b) => a + b, 0) / cycleLengths.length)
      : profile.cycleLength;

  return (
    <AppShell className="bg-bg">
      <button type="button" onClick={onBack} className="mb-4 text-xs text-ink-faint">
        ← Back
      </button>
      <h1 className="font-serif text-2xl text-ink">
        {isPremium ? "PCOS Analytics" : "PCOS Monitoring"}
      </h1>
      <p className="mt-1 text-xs text-ink-mid">
        {isPremium ? "Advanced hormonal health dashboard" : "Basic cycle irregularity alerts"}
      </p>

      <div className="mt-5 grid gap-3">
        <div className="rounded-card bg-surface p-4 shadow-card">
          <p className="text-[0.65rem] font-medium uppercase tracking-wider text-rose-deep">
            Cycle regularity
          </p>
          <p className="mt-1 font-serif text-xl text-ink capitalize">{regularity}</p>
          {regularity === "irregular" && (
            <p className="mt-2 text-[10px] text-amber-mid">
              Irregular cycles are common with PCOS — discuss patterns with your gynecologist.
            </p>
          )}
        </div>

        <div className="rounded-card bg-surface p-4 shadow-card">
          <p className="text-[0.65rem] font-medium uppercase tracking-wider text-rose-deep">
            Average cycle length
          </p>
          <p className="mt-1 font-serif text-xl text-ink">{avgLength} days</p>
          <p className="mt-1 text-[10px] text-ink-faint">{records.length} logged cycles</p>
        </div>

        {isPremium && (
          <>
            <div className="rounded-card bg-surface p-4 shadow-card">
              <p className="text-[0.65rem] font-medium uppercase tracking-wider text-rose-deep">
                Symptom frequency
              </p>
              <p className="mt-1 text-sm text-ink">
                {symptomDays} symptom days logged
              </p>
            </div>
            <div className="rounded-card bg-surface p-4 shadow-card">
              <p className="text-[0.65rem] font-medium uppercase tracking-wider text-rose-deep">
                Mood tracking
              </p>
              <p className="mt-1 text-sm text-ink">
                {Object.keys(cycle.dailyLogs ?? {}).length} daily logs
              </p>
            </div>
          </>
        )}
      </div>

      {!isPremium && tier === "plus" && (
        <p className="mt-4 text-[10px] text-ink-faint">
          Upgrade to Premium for the full PCOS analytics dashboard.
        </p>
      )}
    </AppShell>
  );
}
