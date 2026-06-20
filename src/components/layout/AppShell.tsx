"use client";

import { ReactNode, useRef } from "react";
import { useAppRefresh } from "@/hooks/useAppRefresh";
import { useIsTouchDevice } from "@/hooks/useIsTouchDevice";
import { usePullToRefresh } from "@/hooks/usePullToRefresh";

const PULL_ROTATE_DIVISOR = 72;

interface AppShellProps {
  children: ReactNode;
  /** Reserve space for the fixed bottom nav bar */
  hasNav?: boolean;
  className?: string;
  /** Enable pull-to-refresh on touch devices (default: true) */
  pullToRefresh?: boolean;
  onRefresh?: () => Promise<void>;
}

/**
 * Standard in-frame layout. Handles safe areas, scroll, and nav spacing.
 * Put screen content as children — no manual pt-12 or absolute positioning needed.
 */
export function AppShell({
  children,
  hasNav = true,
  className = "",
  pullToRefresh = true,
  onRefresh,
}: AppShellProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const isTouch = useIsTouchDevice();
  const { refresh } = useAppRefresh();
  const ptrEnabled = pullToRefresh && isTouch;

  const ptr = usePullToRefresh({
    enabled: ptrEnabled,
    scrollRef,
    onRefresh: onRefresh ?? refresh,
  });

  const bottomPad = hasNav
    ? "calc(var(--phone-nav-h) + var(--app-safe-bottom) + 12px)"
    : "calc(var(--app-safe-bottom) + 16px)";

  const indicatorHeight = ptrEnabled ? Math.max(ptr.pull, ptr.showHint ? 28 : 0) : 0;

  return (
    <div
      ref={scrollRef}
      className={`hide-scrollbar relative h-full overflow-y-auto overflow-x-hidden overscroll-contain ${className}`}
      style={{
        paddingTop: "var(--app-safe-top)",
        paddingLeft: "var(--app-pad-x)",
        paddingRight: "var(--app-pad-x)",
        paddingBottom: bottomPad,
      }}
      {...(ptrEnabled ? ptr.handlers : {})}
    >
      {ptrEnabled && (
        <div
          className="ptr-indicator"
          style={{ height: indicatorHeight }}
          aria-hidden={!ptr.statusLabel}
        >
          <div
            className="ptr-indicator-inner"
            style={{
              opacity: ptr.pull > 0 || ptr.refreshing || ptr.showHint ? 1 : 0,
            }}
          >
            <span
              className={`ptr-spinner ${ptr.refreshing ? "ptr-spinner--spinning" : ""}`}
              style={
                ptr.refreshing
                  ? undefined
                  : { transform: `rotate(${Math.min(ptr.pull / PULL_ROTATE_DIVISOR, 1) * 360}deg)` }
              }
            />
          </div>
          {(ptr.statusLabel || ptr.showHint) && (
            <p className="ptr-label">{ptr.statusLabel || "Pull down to refresh"}</p>
          )}
        </div>
      )}

      {children}
    </div>
  );
}

/** Screen header block — aligns to content grid */
export function AppHeader({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <header className={`mb-5 ${className}`}>
      {children}
    </header>
  );
}

/** Full-width element that breaks out of horizontal padding */
export function AppFullBleed({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={className}
      style={{
        marginLeft: "calc(-1 * var(--app-pad-x))",
        marginRight: "calc(-1 * var(--app-pad-x))",
        width: "calc(100% + 2 * var(--app-pad-x))",
      }}
    >
      {children}
    </div>
  );
}
