import type { FrameCallback } from "./types";

const callbacks = new Set<FrameCallback>();

let targetFps = 60;
let frameInterval = 1000 / 60;
let lastFrameTime = 0;
let rafId: number | null = null;
let running = false;

function loop(now: number) {
  rafId = requestAnimationFrame(loop);

  const elapsed = now - lastFrameTime;
  if (elapsed < frameInterval - 0.5) return;

  const drift = elapsed % frameInterval;
  lastFrameTime = now - drift;

  for (const callback of callbacks) {
    callback(elapsed, now);
  }
}

function startLoop() {
  if (running || typeof window === "undefined") return;
  running = true;
  lastFrameTime = performance.now();
  rafId = requestAnimationFrame(loop);
}

function stopLoop() {
  if (rafId !== null) {
    cancelAnimationFrame(rafId);
    rafId = null;
  }
  running = false;
}

export function setTargetFps(fps: number): void {
  targetFps = fps;
  frameInterval = 1000 / fps;
}

export function getTargetFps(): number {
  return targetFps;
}

export function onFrame(callback: FrameCallback): () => void {
  callbacks.add(callback);
  startLoop();

  return () => {
    callbacks.delete(callback);
    if (callbacks.size === 0) stopLoop();
  };
}
