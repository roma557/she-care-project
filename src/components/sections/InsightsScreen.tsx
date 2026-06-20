"use client";

import { useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { ScreenBackHeader } from "@/components/ui/ScreenBackHeader";
import { AppIcon } from "@/components/ui/icons";
import { UpgradePrompt } from "@/components/ui/UpgradePrompt";
import { usePermissions } from "@/hooks/usePermissions";
import { useAppState } from "@/context/AppStateContext";
import {
  HYDRATION_GOAL,
  MAX_HYDRATION_GLASSES,
  MAX_SLEEP_HOURS,
  MIN_SLEEP_HOURS,
  STRESS_OPTIONS,
  formatInsightDateLabel,
  formatHydrationDisplay,
  formatSleepDisplay,
  formatStressLabel,
} from "@/lib/insights";
import { toDateKey } from "@/lib/datetime";

interface InsightsScreenProps {
  onBack: () => void;
}

export function InsightsScreen({ onBack }: InsightsScreenProps) {
  const {
    todayInsights,
    incrementHydration,
    decrementHydration,
    adjustSleepHours,
    setStressLevel,
    recentInsights,
  } = useAppState();
  const { can, startCheckout } = usePermissions();
  const [aiInsights, setAiInsights] = useState<{ title: string; body: string }[]>([]);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  async function loadAiInsights() {
    setAiLoading(true);
    setAiError(null);
    const res = await fetch("/api/insights/ai", { method: "POST" });
    const data = await res.json();
    setAiLoading(false);
    if (res.status === 403) {
      setAiError("upgrade");
      return;
    }
    if (res.status === 429) {
      setAiError("limit");
      return;
    }
    if (res.ok) setAiInsights(data.insights ?? []);
  }

  const todayKey = toDateKey(new Date());
  const hydration = formatHydrationDisplay(todayInsights.hydrationGlasses);
  const sleep = formatSleepDisplay(todayInsights.sleepHours);
  const hydrationProgress = Math.min(
    100,
    Math.round((todayInsights.hydrationGlasses / HYDRATION_GOAL) * 100),
  );

  return (
    <AppShell hasNav={false} className="bg-bg">
      <ScreenBackHeader
        title="Today's insights"
        subtitle="Track hydration, sleep & stress daily"
        onBack={onBack}
      />

      <div className="mb-5 rounded-2xl border border-ink/[0.05] bg-surface p-4 shadow-card">
        <div className="flex items-start justify-between gap-3">
          <div>
            <AppIcon name="droplet" className="h-5 w-5 text-rose-deep" />
            <p className="mt-2 text-[0.65rem] font-medium uppercase tracking-wider text-ink-faint">
              Hydration
            </p>
            <p className="mt-1 font-serif text-3xl text-ink">
              {hydration.value}
              {hydration.unit && (
                <span className="ml-1 font-sans text-sm font-light text-ink-mid">
                  {hydration.unit}
                </span>
              )}
            </p>
            <p className="mt-1 text-[10px] text-ink-mid">Goal: {HYDRATION_GOAL} glasses</p>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={decrementHydration}
              disabled={todayInsights.hydrationGlasses <= 0}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-ink/[0.08] bg-bg text-lg text-ink-mid disabled:opacity-40"
              aria-label="Remove one glass"
            >
              −
            </button>
            <button
              type="button"
              onClick={incrementHydration}
              disabled={todayInsights.hydrationGlasses >= MAX_HYDRATION_GLASSES}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-rose-deep text-lg text-white disabled:opacity-40"
              aria-label="Add one glass"
            >
              +
            </button>
          </div>
        </div>
        <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-rose-pale">
          <div
            className="h-full rounded-full bg-rose-deep transition-all"
            style={{ width: `${hydrationProgress}%` }}
          />
        </div>
      </div>

      <div className="mb-5 rounded-2xl border border-ink/[0.05] bg-surface p-4 shadow-card">
        <div className="flex items-start justify-between gap-3">
          <div>
            <AppIcon name="moon" className="h-5 w-5 text-rose-deep" />
            <p className="mt-2 text-[0.65rem] font-medium uppercase tracking-wider text-ink-faint">
              Sleep
            </p>
            <p className="mt-1 font-serif text-3xl text-ink">
              {sleep.value}
              {sleep.unit && (
                <span className="ml-1 font-sans text-sm font-light text-ink-mid">{sleep.unit}</span>
              )}
            </p>
            <p className="mt-1 text-[10px] text-ink-mid">Recommended: 7–9 hours</p>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => adjustSleepHours(-0.5)}
              disabled={todayInsights.sleepHours <= MIN_SLEEP_HOURS}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-ink/[0.08] bg-bg text-lg text-ink-mid disabled:opacity-40"
              aria-label="Reduce sleep by 30 minutes"
            >
              −
            </button>
            <button
              type="button"
              onClick={() => adjustSleepHours(0.5)}
              disabled={todayInsights.sleepHours >= MAX_SLEEP_HOURS}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-rose-deep text-lg text-white disabled:opacity-40"
              aria-label="Add 30 minutes of sleep"
            >
              +
            </button>
          </div>
        </div>
      </div>

      <div className="mb-6 rounded-2xl border border-ink/[0.05] bg-surface p-4 shadow-card">
        <AppIcon name="wind" className="h-5 w-5 text-rose-deep" />
        <p className="mt-2 text-[0.65rem] font-medium uppercase tracking-wider text-ink-faint">
          Stress
        </p>
        <p className="mt-1 font-serif text-2xl text-ink">
          {formatStressLabel(todayInsights.stress)}
        </p>
        <div className="mt-3 flex gap-2">
          {STRESS_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setStressLevel(option.value)}
              className={`flex-1 rounded-full py-2 text-[10px] font-medium transition-colors ${
                todayInsights.stress === option.value
                  ? "bg-rose-deep text-white"
                  : "border border-ink/[0.08] bg-bg text-ink-mid"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <p className="mb-3 text-[0.6rem] font-medium uppercase tracking-[0.2em] text-ink-faint">
        Last 7 days
      </p>
      <div className="space-y-2">
        {recentInsights.map(({ dateKey, entry }) => (
          <div
            key={dateKey}
            className="flex items-center justify-between rounded-xl border border-ink/[0.05] bg-surface px-3 py-2.5"
          >
            <p className="text-xs font-medium text-ink">
              {formatInsightDateLabel(dateKey, todayKey)}
            </p>
            <div className="flex gap-3 text-[10px] text-ink-mid">
              <span>{entry.hydrationGlasses} glasses</span>
              <span>{entry.sleepHours > 0 ? `${entry.sleepHours}h sleep` : "— sleep"}</span>
              <span>{formatStressLabel(entry.stress)}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8">
        <p className="mb-3 text-[0.6rem] font-medium uppercase tracking-[0.2em] text-ink-faint">
          AI Insights
        </p>
        {can("ai_insights") ? (
          <>
            <button
              type="button"
              disabled={aiLoading}
              onClick={loadAiInsights}
              className="w-full rounded-full bg-rose-deep py-2.5 text-xs font-medium text-white disabled:opacity-50"
            >
              {aiLoading ? "Analyzing…" : "Generate AI insights"}
            </button>
            {aiError === "limit" && (
              <p className="mt-2 text-[10px] text-amber-mid">Monthly AI insights limit reached.</p>
            )}
            <ul className="mt-3 space-y-2">
              {aiInsights.map((ins) => (
                <li key={ins.title} className="rounded-xl border border-rose-pale bg-rose-pale/30 p-3">
                  <p className="text-xs font-medium text-ink">{ins.title}</p>
                  <p className="mt-1 text-[10px] text-ink-mid">{ins.body}</p>
                </li>
              ))}
            </ul>
          </>
        ) : (
          <UpgradePrompt
            feature="AI-powered pattern insights"
            requiredTier="starter"
            onUpgrade={(t) => startCheckout(t)}
            compact
          />
        )}
      </div>
    </AppShell>
  );
}
