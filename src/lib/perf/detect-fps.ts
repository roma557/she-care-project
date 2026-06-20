import { normalizeFps } from "./types";

const SAMPLE_MS = 1000;
const MAX_DELTA_MS = 200;

export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function detectRefreshRate(): Promise<number> {
  return new Promise((resolve) => {
    const deltas: number[] = [];
    let start = 0;
    let prev = 0;

    function tick(now: number) {
      if (!start) {
        start = now;
        prev = now;
        requestAnimationFrame(tick);
        return;
      }

      const delta = now - prev;
      prev = now;

      if (delta > 0 && delta < MAX_DELTA_MS) {
        deltas.push(delta);
      }

      if (now - start >= SAMPLE_MS) {
        if (deltas.length === 0) {
          resolve(60);
          return;
        }

        const avgDelta = deltas.reduce((sum, value) => sum + value, 0) / deltas.length;
        resolve(normalizeFps(Math.round(1000 / avgDelta)));
        return;
      }

      requestAnimationFrame(tick);
    }

    requestAnimationFrame(tick);
  });
}
