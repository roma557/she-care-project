import { applyCssVars } from "./css-bridge";
import { detectRefreshRate, prefersReducedMotion } from "./detect-fps";
import { getTargetFps, onFrame, setTargetFps } from "./frame-loop";
import {
  tierFromFps,
  type PerfConfig,
  type PerfGlobal,
  type PerfTier,
} from "./types";

export type { FrameCallback, FpsTier, PerfConfig, PerfGlobal, PerfTier } from "./types";
export { onFrame, getTargetFps, setTargetFps } from "./frame-loop";
export { detectRefreshRate, prefersReducedMotion } from "./detect-fps";
export { applyCssVars } from "./css-bridge";

const DEFAULT_CONFIG: PerfConfig = {
  fps: 60,
  tier: "mid",
  ready: false,
  reducedMotion: false,
};

let currentConfig: PerfConfig = { ...DEFAULT_CONFIG };
const listeners = new Set<(config: PerfConfig) => void>();
let initPromise: Promise<PerfConfig> | null = null;

function syncGlobal(config: PerfConfig): void {
  if (typeof window === "undefined") return;

  window.__perf = {
    fps: config.fps,
    tier: config.tier,
    ready: config.ready,
    reducedMotion: config.reducedMotion,
    onFrame,
  };
}

function publish(config: PerfConfig): void {
  currentConfig = config;
  syncGlobal(config);
  applyCssVars(config);
  for (const listener of listeners) {
    listener(config);
  }
}

export function getPerfConfig(): PerfConfig {
  return currentConfig;
}

export function subscribePerf(listener: (config: PerfConfig) => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function initPerf(): Promise<PerfConfig> {
  if (initPromise) return initPromise;

  initPromise = (async () => {
    if (typeof window === "undefined") {
      return currentConfig;
    }

    syncGlobal(currentConfig);

    const reducedMotion = prefersReducedMotion();
    if (reducedMotion) {
      const config: PerfConfig = { fps: 30, tier: "low", ready: true, reducedMotion: true };
      setTargetFps(30);
      publish(config);
      return config;
    }

    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    motionQuery.addEventListener("change", () => {
      if (motionQuery.matches) {
        setTargetFps(30);
        publish({ fps: 30, tier: "low", ready: true, reducedMotion: true });
        return;
      }

      void detectRefreshRate().then((fps) => {
        const tier = tierFromFps(fps);
        setTargetFps(fps);
        publish({ fps, tier, ready: true, reducedMotion: false });
      });
    });

    publish({ ...DEFAULT_CONFIG, ready: false });

    const fps = await detectRefreshRate();
    const tier = tierFromFps(fps);
    const config: PerfConfig = { fps, tier, ready: true, reducedMotion: false };

    setTargetFps(fps);
    publish(config);
    return config;
  })();

  return initPromise;
}

export function waitForPerf(): Promise<PerfConfig> {
  return initPerf();
}
