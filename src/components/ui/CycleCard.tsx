"use client";

import { ReactNode, useState } from "react";
import { AppIcon } from "@/components/ui/icons";
import { CycleRing } from "./CycleRing";
import { formatRelativeTime } from "@/lib/datetime";
import { getFlowLabel, type PlusCycleInsights } from "@/lib/cycle";
import {
  CYCLE_CARD_GRADIENT,
  CYCLE_CARD_SHADOW,
  type CycleCardVariant,
} from "@/lib/subscription/plan-card-theme";

export type { CycleCardVariant };

interface CycleCardProps {
  phaseName: string;
  cycleDay: number;
  cycleLength: number;
  message?: string;
  variant?: CycleCardVariant;
  children?: ReactNode;
  phaseDay?: number;
  phaseTotal?: number;
  subtitleDay?: number;
  subtitleTotal?: number;
  daysToOvulation?: number;
  flowLevel?: number;
  onFlowChange?: (level: number) => void;
  wearableSyncAt?: string | null;
  wearableConnected?: boolean;
  onWearableTap?: () => void;
  plusInsights?: PlusCycleInsights;
  onInsightTap?: () => void;
}

function StatColumn({ label, value }: { label: string; value: string }) {
  return (
    <div className="text-center">
      <p className="text-[0.55rem] font-medium uppercase tracking-[0.18em] text-white/60">{label}</p>
      <p className="mt-1 font-sans text-sm font-semibold text-white">{value}</p>
    </div>
  );
}

function FlowToggle({
  level,
  flowLevel,
  onChange,
  accentClass = "bg-plan-premium-deep",
}: {
  level: number;
  flowLevel: number;
  onChange: (level: number) => void;
  accentClass?: string;
}) {
  const active = level <= flowLevel;
  return (
    <button
      type="button"
      onClick={() => onChange(level)}
      className={`flex h-7 w-7 items-center justify-center rounded-full border transition-colors duration-perf ${
        active
          ? "border-white/80 bg-white/90"
          : "border-white/25 bg-white/10 hover:border-white/40"
      }`}
      aria-label={`Flow level ${getFlowLabel(level)}`}
      aria-pressed={level === flowLevel}
    >
      {active && <span className={`h-1.5 w-1.5 rounded-full ${accentClass}`} />}
    </button>
  );
}

function PremiumCycleCard({
  phaseName,
  cycleDay,
  cycleLength,
  message,
  phaseDay,
  phaseTotal,
  subtitleDay,
  subtitleTotal,
  daysToOvulation = 0,
  flowLevel = 2,
  onFlowChange,
  wearableSyncAt,
  wearableConnected = false,
  onWearableTap,
}: Omit<CycleCardProps, "variant" | "children">) {
  const [wearableVisible, setWearableVisible] = useState(true);
  const progress = phaseTotal ? phaseDay! / phaseTotal : cycleDay / cycleLength;
  const flowLabel = getFlowLabel(flowLevel);
  const ovulationLabel = daysToOvulation > 0 ? `${daysToOvulation}d` : "Today";
  const synced = Boolean(wearableConnected && wearableSyncAt);
  const syncLabel = synced ? formatRelativeTime(wearableSyncAt) : "Not synced";

  function handleWearableTap() {
    setWearableVisible((v) => !v);
  }

  return (
    <div>
      <div
        className={`relative overflow-hidden rounded-[28px] bg-gradient-to-br p-[22px_24px_0] ${CYCLE_CARD_GRADIENT.premium} ${CYCLE_CARD_SHADOW.premium}`}
      >
        <div
          className="pointer-events-none absolute -right-8 -top-8 h-[120px] w-[120px] rounded-full bg-white/[0.08]"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -bottom-12 -left-8 h-[100px] w-[100px] rounded-full bg-black/[0.06]"
          aria-hidden
        />

        <div className="relative flex items-start justify-between gap-4">
          <div className="flex-1">
            <p className="text-[0.6rem] font-medium uppercase tracking-[0.18em] text-white/65">
              Current phase
            </p>
            <h2 className="mt-1 font-serif text-[1.65rem] italic leading-tight text-white">
              {phaseName}
            </h2>
            <p className="mt-1 text-xs font-light text-white/80">
              Day {subtitleDay ?? cycleDay} of {subtitleTotal ?? cycleLength}
            </p>
          </div>
          <div className="relative flex shrink-0 items-center justify-center">
            <CycleRing progress={progress} thin />
            <span className="absolute font-serif text-lg text-white">{cycleDay}</span>
          </div>
        </div>

        <div className="relative mt-5 border-t border-white/15 pt-4">
          <div className="grid grid-cols-3 gap-2">
            <StatColumn label="Cycle" value={`${cycleLength}d`} />
            <StatColumn label="Ovulation" value={ovulationLabel} />
            <StatColumn label="Flow" value={flowLabel} />
          </div>
        </div>

        <div className="relative mt-4 border-t border-white/15 pt-4">
          <div className="flex items-center gap-3">
            <span className="text-[0.6rem] font-medium uppercase tracking-[0.15em] text-white/65">
              Flow
            </span>
            <div className="flex items-center gap-2">
              {[1, 2, 3].map((level) => (
                <FlowToggle
                  key={level}
                  level={level}
                  flowLevel={flowLevel}
                  onChange={onFlowChange ?? (() => {})}
                />
              ))}
            </div>
            <span className="ml-auto text-xs font-medium text-white/90">{flowLabel}</span>
          </div>
        </div>

        {message && (
          <p className="relative mt-4 text-center font-serif text-[0.8rem] italic leading-relaxed text-white/80">
            {message}
          </p>
        )}

        {wearableVisible && (
          <div className="relative mt-5 -mx-6 flex w-[calc(100%+3rem)] items-center justify-between bg-black/20 px-6 py-3 transition-colors duration-perf hover:bg-black/25">
            <button
              type="button"
              onClick={handleWearableTap}
              className="flex flex-1 items-center gap-2 text-left text-xs text-white/85"
              aria-label="Toggle wearable sync strip"
            >
              <AppIcon name="watch" className="h-4 w-4 text-white/80" />
              Wearable
            </button>
            <span className="flex shrink-0 items-center gap-2 text-[0.65rem] text-white/75">
              {synced ? (
                <>
                  Synced {syncLabel}
                  <span
                    className="h-1.5 w-1.5 rounded-full bg-teal-mid shadow-[0_0_6px_rgba(29,158,117,0.8)]"
                    aria-hidden
                  />
                  <span className="text-white/90">Synced</span>
                </>
              ) : (
                <button
                  type="button"
                  onClick={onWearableTap}
                  className="text-white/80 underline underline-offset-2"
                >
                  Connect device
                </button>
              )}
            </span>
          </div>
        )}

        {!wearableVisible && (
          <button
            type="button"
            onClick={handleWearableTap}
            className="relative mt-5 w-full py-2 text-center text-[0.6rem] uppercase tracking-[0.12em] text-white/50"
          >
            Show wearable strip
          </button>
        )}
      </div>

      <p className="mt-2 text-center text-[0.55rem] font-medium uppercase tracking-[0.14em] text-ink-faint/70">
        Tap wearable strip to toggle · SheCare Premium
      </p>
    </div>
  );
}

function PlusCycleCard({
  phaseName,
  cycleDay,
  cycleLength,
  message,
  phaseDay,
  phaseTotal,
  subtitleDay,
  subtitleTotal,
  flowLevel = 2,
  onFlowChange,
  plusInsights,
  onInsightTap,
}: Omit<CycleCardProps, "variant" | "children"> & {
  plusInsights: PlusCycleInsights;
}) {
  const [insightVisible, setInsightVisible] = useState(true);
  const progress = phaseTotal ? phaseDay! / phaseTotal : cycleDay / cycleLength;
  const flowLabel = getFlowLabel(flowLevel);
  const insightIcon = plusInsights.insightScreen === "insights" ? "sparkle" : "calendar";

  function handleInsightToggle() {
    setInsightVisible((v) => !v);
  }

  return (
    <div>
      <div
        className={`relative overflow-hidden rounded-[28px] bg-gradient-to-br p-[22px_24px_0] ${CYCLE_CARD_GRADIENT.plus} ${CYCLE_CARD_SHADOW.plus}`}
      >
        <div
          className="pointer-events-none absolute -right-8 -top-8 h-[120px] w-[120px] rounded-full bg-white/[0.08]"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -bottom-12 -left-8 h-[100px] w-[100px] rounded-full bg-black/[0.06]"
          aria-hidden
        />

        <div className="relative flex items-start justify-between gap-4">
          <div className="flex-1">
            <p className="text-[0.6rem] font-medium uppercase tracking-[0.18em] text-white/65">
              Current phase
            </p>
            <h2 className="mt-1 font-serif text-[1.65rem] italic leading-tight text-white">
              {phaseName}
            </h2>
            <p className="mt-1 text-xs font-light text-white/80">
              Day {subtitleDay ?? cycleDay} of {subtitleTotal ?? cycleLength}
            </p>
          </div>
          <div className="relative flex shrink-0 items-center justify-center">
            <CycleRing progress={progress} thin />
            <span className="absolute font-serif text-lg text-white">{cycleDay}</span>
          </div>
        </div>

        <div className="relative mt-5 border-t border-white/15 pt-4">
          <div className="grid grid-cols-3 gap-2">
            <StatColumn label="Cycle" value={`${cycleLength}d`} />
            <StatColumn label="Fertility" value={plusInsights.fertilityLabel} />
            <StatColumn label="Flow" value={flowLabel} />
          </div>
        </div>

        <div className="relative mt-4 border-t border-white/15 pt-4">
          <div className="flex items-center gap-3">
            <span className="text-[0.6rem] font-medium uppercase tracking-[0.15em] text-white/65">
              Flow
            </span>
            <div className="flex items-center gap-2">
              {[1, 2, 3].map((level) => (
                <FlowToggle
                  key={level}
                  level={level}
                  flowLevel={flowLevel}
                  onChange={onFlowChange ?? (() => {})}
                  accentClass="bg-plan-plus-deep"
                />
              ))}
            </div>
            <span className="ml-auto text-xs font-medium text-white/90">{flowLabel}</span>
          </div>
        </div>

        {message && (
          <p className="relative mt-4 text-center font-serif text-[0.8rem] italic leading-relaxed text-white/80">
            {message}
          </p>
        )}

        {insightVisible && (
          <div className="relative mt-5 -mx-6 flex w-[calc(100%+3rem)] items-center justify-between bg-black/20 px-6 py-3 transition-colors duration-perf hover:bg-black/25">
            <button
              type="button"
              onClick={handleInsightToggle}
              className="flex flex-1 items-center gap-2 text-left text-xs text-white/85"
              aria-label="Toggle Plus insight strip"
            >
              <AppIcon name={insightIcon} className="h-4 w-4 text-white/80" />
              {plusInsights.insightTitle}
            </button>
            <button
              type="button"
              onClick={onInsightTap}
              className="shrink-0 text-[0.65rem] text-white/75 underline underline-offset-2"
            >
              {plusInsights.insightDetail}
            </button>
          </div>
        )}

        {!insightVisible && (
          <button
            type="button"
            onClick={handleInsightToggle}
            className="relative mt-5 w-full py-2 text-center text-[0.6rem] uppercase tracking-[0.12em] text-white/50"
          >
            Show insight strip
          </button>
        )}
      </div>

      <p className="mt-2 text-center text-[0.55rem] font-medium uppercase tracking-[0.14em] text-ink-faint/70">
        Tap for details · SheCare Plus
      </p>
    </div>
  );
}

export function CycleCard({
  phaseName,
  cycleDay,
  cycleLength,
  message,
  variant = "default",
  children,
  phaseDay,
  phaseTotal,
  subtitleDay,
  subtitleTotal,
  daysToOvulation,
  flowLevel,
  onFlowChange,
  wearableSyncAt,
  wearableConnected,
  onWearableTap,
  plusInsights,
  onInsightTap,
}: CycleCardProps) {
  if (variant === "premium") {
    return (
      <PremiumCycleCard
        phaseName={phaseName}
        cycleDay={cycleDay}
        cycleLength={cycleLength}
        message={message}
        phaseDay={phaseDay}
        phaseTotal={phaseTotal}
        subtitleDay={subtitleDay}
        subtitleTotal={subtitleTotal}
        daysToOvulation={daysToOvulation}
        flowLevel={flowLevel}
        onFlowChange={onFlowChange}
        wearableSyncAt={wearableSyncAt}
        wearableConnected={wearableConnected}
        onWearableTap={onWearableTap}
      />
    );
  }

  if (variant === "plus" && plusInsights) {
    return (
      <PlusCycleCard
        phaseName={phaseName}
        cycleDay={cycleDay}
        cycleLength={cycleLength}
        message={message}
        phaseDay={phaseDay}
        phaseTotal={phaseTotal}
        subtitleDay={subtitleDay}
        subtitleTotal={subtitleTotal}
        flowLevel={flowLevel}
        onFlowChange={onFlowChange}
        plusInsights={plusInsights}
        onInsightTap={onInsightTap}
      />
    );
  }

  const progress = cycleDay / cycleLength;

  return (
    <div
      className={`relative overflow-hidden rounded-[24px] bg-gradient-to-br p-[22px_24px] ${CYCLE_CARD_SHADOW[variant]} ${CYCLE_CARD_GRADIENT[variant]}`}
    >
      <div
        className="pointer-events-none absolute -right-10 -top-10 h-[140px] w-[140px] rounded-full bg-white/[0.07]"
        aria-hidden
      />
      <div className="relative flex items-center justify-between gap-4">
        <div className="flex-1">
          <p className="text-[0.65rem] font-medium uppercase tracking-[0.15em] text-white/70">
            Current phase
          </p>
          <h2 className="mt-1 font-serif text-2xl italic text-white">{phaseName}</h2>
          <p className="mt-1 text-xs font-light text-white/80">
            Day {cycleDay} of {cycleLength}
          </p>
          {message && (
            <p className="mt-2 text-[0.72rem] font-light leading-relaxed text-white/75">
              {message}
            </p>
          )}
        </div>
        <div className="relative flex shrink-0 items-center justify-center">
          <CycleRing progress={progress} />
          <span className="absolute font-serif text-lg text-white">{cycleDay}</span>
        </div>
      </div>
      {children}
    </div>
  );
}
