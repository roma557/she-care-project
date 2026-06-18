import { ReactNode } from "react";
import { PHONE } from "@/lib/phone";

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
    ? PHONE.navHeight + PHONE.safeBottom + 12
    : PHONE.safeBottom + 16;

  return (
    <div
      className={`hide-scrollbar h-full overflow-y-auto overflow-x-hidden ${className}`}
      style={{
        paddingTop: PHONE.safeTop,
        paddingLeft: PHONE.paddingX,
        paddingRight: PHONE.paddingX,
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
        marginLeft: -PHONE.paddingX,
        marginRight: -PHONE.paddingX,
        width: PHONE.width,
      }}
    >
      {children}
    </div>
  );
}
