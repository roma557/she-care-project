"use client";

import { useEffect, useState } from "react";
import { formatStatusBarTime } from "@/lib/datetime";

export function StatusBarClock() {
  const [time, setTime] = useState("");

  useEffect(() => {
    const tick = () => setTime(formatStatusBarTime());
    tick();
    const id = setInterval(tick, 30_000);
    return () => clearInterval(id);
  }, []);

  return <span suppressHydrationWarning>{time || "--:--"}</span>;
}
