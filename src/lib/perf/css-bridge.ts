import { motionScaleForTier, type PerfConfig } from "./types";

export function applyCssVars(config: PerfConfig): void {
  if (typeof document === "undefined") return;

  const root = document.documentElement;
  const { fps, tier, reducedMotion } = config;
  const timingScale = fps / 90;
  const motionScale = reducedMotion ? 0 : motionScaleForTier(tier);

  root.style.setProperty("--fps-target", String(fps));
  root.style.setProperty("--perf-tier", tier);
  root.style.setProperty("--motion-scale", String(motionScale));
  root.style.setProperty("--transition-scale", String(timingScale));
  root.style.setProperty("--animation-scale", String(timingScale));
  root.style.setProperty("--frame-ms", String(1000 / fps));

  root.style.setProperty("--transition-fast", `${Math.round(150 * timingScale)}ms`);
  root.style.setProperty("--transition-base", `${Math.round(300 * timingScale)}ms`);
  root.style.setProperty("--transition-slow", `${Math.round(450 * timingScale)}ms`);

  root.dataset.perfTier = tier;
  root.dataset.perfReady = config.ready ? "true" : "false";

  if (reducedMotion) {
    root.dataset.perfReducedMotion = "true";
  } else {
    delete root.dataset.perfReducedMotion;
  }
}
