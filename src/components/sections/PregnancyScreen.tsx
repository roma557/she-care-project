"use client";

import { useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { UpgradePrompt } from "@/components/ui/UpgradePrompt";
import { usePermissions } from "@/hooks/usePermissions";
import { useAppState } from "@/context/AppStateContext";

function gestationalWeek(startDate: string): number {
  const start = new Date(startDate);
  const now = new Date();
  const days = Math.floor((now.getTime() - start.getTime()) / 86400000);
  return Math.max(1, Math.floor(days / 7) + 1);
}

export function PregnancyScreen({ onBack }: { onBack: () => void }) {
  const { can, startCheckout } = usePermissions();
  const { profile, updateProfile } = useAppState();
  const [startDate, setStartDate] = useState(profile.pregnancyStartDate ?? "");

  if (!can("pregnancy_mode")) {
    return (
      <AppShell className="bg-bg">
        <button type="button" onClick={onBack} className="mb-4 text-xs text-ink-faint">
          ← Back
        </button>
        <UpgradePrompt
          feature="Pregnancy mode"
          requiredTier="premium"
          onUpgrade={(t) => startCheckout(t)}
        />
      </AppShell>
    );
  }

  const week = profile.pregnancyStartDate ? gestationalWeek(profile.pregnancyStartDate) : null;

  return (
    <AppShell className="bg-bg">
      <button type="button" onClick={onBack} className="mb-4 text-xs text-ink-faint">
        ← Back
      </button>
      <h1 className="font-serif text-2xl text-ink">Pregnancy Mode</h1>
      <p className="mt-1 text-xs text-ink-mid">Track your pregnancy journey</p>

      <div className="mt-5 rounded-card bg-surface p-4 shadow-card">
        <label className="text-[10px] font-medium text-ink-faint">Last menstrual period (LMP)</label>
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="mt-2 w-full rounded-lg border border-rose-pale px-3 py-2 text-sm"
        />
        <button
          type="button"
          onClick={() =>
            updateProfile({
              pregnancyMode: true,
              pregnancyStartDate: startDate,
            })
          }
          className="mt-3 w-full rounded-full bg-rose-deep py-2.5 text-xs font-medium text-white"
        >
          {profile.pregnancyMode ? "Update" : "Enable pregnancy mode"}
        </button>
      </div>

      {profile.pregnancyMode && week && (
        <div className="mt-4 rounded-card border border-rose-pale bg-rose-pale/30 p-4">
          <p className="text-[0.65rem] font-medium uppercase tracking-wider text-rose-deep">
            Gestational week
          </p>
          <p className="mt-1 font-serif text-3xl text-ink">Week {week}</p>
          <p className="mt-2 text-[10px] text-ink-mid">
            Ovulation tracking is hidden in pregnancy mode. Continue logging symptoms and wellness.
          </p>
        </div>
      )}
    </AppShell>
  );
}
