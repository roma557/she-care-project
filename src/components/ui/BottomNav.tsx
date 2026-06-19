"use client";

import { NavTab } from "@/lib/phone";

interface BottomNavProps {
  active?: NavTab;
  onNavigate?: (tab: NavTab) => void;
}

export function BottomNav({ active = "home", onNavigate }: BottomNavProps) {
  const items: { id: NavTab; label: string; icon: typeof HomeIcon }[] = [
    { id: "home", label: "Home", icon: HomeIcon },
    { id: "cycle", label: "Cycle", icon: CalendarIcon },
    { id: "chat", label: "AI Care", icon: ChatIcon },
    { id: "learn", label: "Reports", icon: ChartIcon },
    { id: "profile", label: "Profile", icon: UserIcon },
  ];

  return (
    <nav
      className="absolute bottom-0 left-0 right-0 z-20 border-t border-ink/[0.06] bg-surface"
      style={{ padding: "10px 0 calc(var(--app-safe-bottom) + 28px)" }}
    >
      <div className="flex">
        {items.map((item) => {
          const isActive = active === item.id;
          const Icon = item.icon;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onNavigate?.(item.id)}
              className="flex flex-1 flex-col items-center gap-1 border-none bg-transparent px-0 py-1 active:opacity-70"
            >
              <Icon
                className={`h-5 w-5 ${isActive ? "text-rose-deep" : "text-ink-faint"}`}
              />
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

function HomeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M3 10.5L12 3l9 7.5V20a1 1 0 01-1 1h-5v-6H9v6H4a1 1 0 01-1-1v-9.5z" strokeLinejoin="round" />
    </svg>
  );
}

function CalendarIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <path d="M16 2v4M8 2v4M3 10h18" strokeLinecap="round" />
    </svg>
  );
}

function ChatIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M12 3l1.5 3.5L17 8l-3.5 1.5L12 13l-1.5-3.5L7 8l3.5-1.5L12 3z" strokeLinejoin="round" />
      <path d="M5 17l-1 4 4-1" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ChartIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M4 20V10M10 20V4M16 20v-6M22 20V8" strokeLinecap="round" />
    </svg>
  );
}

function UserIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" strokeLinecap="round" />
    </svg>
  );
}
