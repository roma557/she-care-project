"use client";

import { useEffect, useState } from "react";
import { getPerfConfig, onFrame, subscribePerf, type PerfConfig } from "@/lib/perf";

export function usePerf(): PerfConfig {
  const [config, setConfig] = useState<PerfConfig>(() => getPerfConfig());

  useEffect(() => subscribePerf(setConfig), []);

  return config;
}

export function useOnFrame(callback: (deltaMs: number, elapsedMs: number) => void): void {
  useEffect(() => onFrame(callback), [callback]);
}
