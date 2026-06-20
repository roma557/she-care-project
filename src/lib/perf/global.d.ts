import type { FrameCallback, PerfGlobal } from "@/lib/perf/types";

declare global {
  interface Window {
    __perf?: PerfGlobal;
  }
}

export {};
