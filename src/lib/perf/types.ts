export type PerfTier = "low" | "mid" | "high";

export type FrameCallback = (deltaMs: number, elapsedMs: number) => void;

export interface PerfConfig {
  fps: number;
  tier: PerfTier;
  ready: boolean;
  reducedMotion: boolean;
}

export interface PerfGlobal extends PerfConfig {
  onFrame: (callback: FrameCallback) => () => void;
}

export const FPS_TIERS = [30, 60, 90] as const;
export type FpsTier = (typeof FPS_TIERS)[number];

export const MAX_FPS = 90;

export function normalizeFps(measured: number): FpsTier {
  if (measured <= 35) return 30;
  if (measured <= 75) return 60;
  return MAX_FPS;
}

export function tierFromFps(fps: number): PerfTier {
  if (fps <= 30) return "low";
  if (fps <= 60) return "mid";
  return "high";
}

export function motionScaleForTier(tier: PerfTier): number {
  switch (tier) {
    case "low":
      return 0.5;
    case "mid":
      return 0.85;
    case "high":
      return 1;
  }
}
