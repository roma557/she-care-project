"use client";

import { useLayoutEffect } from "react";
import { initPerf } from "@/lib/perf";

export function PerfInit() {
  useLayoutEffect(() => {
    void initPerf();
  }, []);

  return null;
}
