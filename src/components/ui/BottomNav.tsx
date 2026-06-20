"use client";

import { NavTab } from "@/lib/phone";
import { AppIcon, IconName } from "@/components/ui/icons";
import { usePermissions } from "@/hooks/usePermissions";
import type { Feature } from "@/lib/permissions/features";

interface BottomNavProps {
  active?: NavTab;
  onNavigate?: (tab: NavTab) => void;
}

const NAV_ICONS: Record<NavTab, IconName> = {
  home: "home",
  cycle: "calendar",
  chat: "chat",
  reports: "chart",
  profile: "user",
};

const NAV_LOCKS: Partial<Record<NavTab, Feature>> = {
  reports: "monthly_report",
};

export function BottomNav({ active = "home", onNavigate }: BottomNavProps) {
  const { can } = usePermissions();
  const items: { id: NavTab; label: string }[] = [
    { id: "home", label: "Home" },
    { id: "cycle", label: "Cycle" },
    { id: "chat", label: "AI Care" },
    { id: "reports", label: "Reports" },
    { id: "profile", label: "Profile" },
  ];

  return (
    <nav
      className="absolute bottom-0 left-0 right-0 z-20 border-t border-ink/[0.06] bg-surface"
      style={{ padding: "10px 0 calc(var(--app-safe-bottom) + 28px)" }}
    >
      <div className="flex">
        {items.map((item) => {
          const isActive = active === item.id;
          const lockFeature = NAV_LOCKS[item.id];
          const locked = lockFeature ? !can(lockFeature) : false;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onNavigate?.(item.id)}
              className="relative flex flex-1 flex-col items-center gap-1 border-none bg-transparent px-0 py-1 active:opacity-70"
            >
              <span className="relative">
                <AppIcon
                  name={NAV_ICONS[item.id]}
                  className={`h-5 w-5 ${isActive ? "text-rose-deep" : "text-ink-faint"}`}
                />
                {locked && (
                  <AppIcon
                    name="lock"
                    className="absolute -bottom-1 -right-1.5 h-2.5 w-2.5 text-ink-faint"
                    aria-hidden
                  />
                )}
              </span>
              <span
                className={`text-[0.55rem] font-medium tracking-[0.06em] ${
                  isActive ? "text-rose-deep" : "text-ink-faint"
                }`}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
