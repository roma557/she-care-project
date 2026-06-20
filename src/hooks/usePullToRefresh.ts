"use client";

import { RefObject, useCallback, useEffect, useRef, useState } from "react";

const PULL_THRESHOLD = 72;
const MAX_PULL = 112;

interface UsePullToRefreshOptions {
  enabled: boolean;
  scrollRef: RefObject<HTMLElement | null>;
  onRefresh: () => Promise<void>;
}

export function usePullToRefresh({ enabled, scrollRef, onRefresh }: UsePullToRefreshOptions) {
  const [pull, setPull] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [atTop, setAtTop] = useState(true);
  const [hintDismissed, setHintDismissed] = useState(() => {
    if (typeof window === "undefined") return true;
    return localStorage.getItem("shecare-ptr-hint-seen") === "1";
  });

  const startY = useRef(0);
  const pulling = useRef(false);
  const refreshingRef = useRef(false);

  useEffect(() => {
    const el = scrollRef.current;
    if (!enabled || !el) return;

    function onScroll() {
      setAtTop(el!.scrollTop <= 1);
    }

    onScroll();
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, [enabled, scrollRef]);

  const runRefresh = useCallback(async () => {
    if (refreshingRef.current) return;
    refreshingRef.current = true;
    setRefreshing(true);
    setPull(PULL_THRESHOLD);

    try {
      await onRefresh();
      localStorage.setItem("shecare-ptr-hint-seen", "1");
      setHintDismissed(true);
    } finally {
      refreshingRef.current = false;
      setRefreshing(false);
      setPull(0);
      pulling.current = false;
    }
  }, [onRefresh]);

  const onTouchStart = useCallback(
    (event: React.TouchEvent) => {
      if (!enabled || refreshingRef.current) return;
      const el = scrollRef.current;
      if (!el || el.scrollTop > 1) return;

      startY.current = event.touches[0]?.clientY ?? 0;
      pulling.current = true;
    },
    [enabled, scrollRef],
  );

  const onTouchMove = useCallback(
    (event: React.TouchEvent) => {
      if (!enabled || !pulling.current || refreshingRef.current) return;
      const el = scrollRef.current;
      if (!el || el.scrollTop > 1) {
        pulling.current = false;
        setPull(0);
        return;
      }

      const delta = (event.touches[0]?.clientY ?? 0) - startY.current;
      if (delta <= 0) {
        setPull(0);
        return;
      }

      const next = Math.min(delta * 0.45, MAX_PULL);
      setPull(next);

      if (next > 8) {
        event.preventDefault();
      }
    },
    [enabled, scrollRef],
  );

  const onTouchEnd = useCallback(() => {
    if (!enabled || !pulling.current || refreshingRef.current) return;
    pulling.current = false;

    if (pull >= PULL_THRESHOLD) {
      void runRefresh();
      return;
    }

    setPull(0);
  }, [enabled, pull, runRefresh]);

  const showHint = enabled && atTop && !refreshing && pull === 0 && !hintDismissed;

  const statusLabel = refreshing
    ? "Refreshing…"
    : pull >= PULL_THRESHOLD
      ? "Release to refresh"
      : pull > 0
        ? "Pull to refresh"
        : showHint
          ? "Pull down to refresh"
          : "";

  return {
    pull,
    refreshing,
    atTop,
    showHint,
    statusLabel,
    handlers: { onTouchStart, onTouchMove, onTouchEnd },
  };
}
