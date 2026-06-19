import { ReactNode } from "react";

interface AppShellProps {
  children: ReactNode;
  /** Reserve space for the fixed bottom nav bar */
  hasNav?: boolean;
  className?: string;
}

/**
 * Standard in-frame layout. Handles safe areas, scroll, and nav spacing.
 * Put screen content as children — no manual pt-12 or absolute positioning needed.
 */
export function AppShell({ children, hasNav = true, className = "" }: AppShellProps) {
  const bottomPad = hasNav
    ? "calc(var(--phone-nav-h) + var(--app-safe-bottom) + 12px)"
    : "calc(var(--app-safe-bottom) + 16px)";

  return (
    <div
      className={`hide-scrollbar h-full overflow-y-auto overflow-x-hidden overscroll-contain ${className}`}
      style={{
        paddingTop: "var(--app-safe-top)",
        paddingLeft: "var(--app-pad-x)",
        paddingRight: "var(--app-pad-x)",
        paddingBottom: bottomPad,
      }}
    >
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
