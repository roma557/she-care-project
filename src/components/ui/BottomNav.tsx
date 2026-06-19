"use client";

import { NavTab, PHONE } from "@/lib/phone";

interface BottomNavProps {
  active?: NavTab;
  onNavigate?: (tab: NavTab) => void;
}

export function BottomNav({ active = "home", onNavigate }: BottomNavProps) {
  const items: { id: NavTab; label: string; icon: typeof HomeIcon; center?: boolean }[] = [
    { id: "home", label: "Home", icon: HomeIcon },
    { id: "learn", label: "Learn", icon: BookIcon },
    { id: "chat", label: "Ask AI", icon: ChatIcon, center: true },
    { id: "cycle", label: "Cycle", icon: CalendarIcon },
    { id: "profile", label: "Profile", icon: UserIcon },
  ];

  return (
    <nav
      className="absolute bottom-0 left-0 right-0 z-20 border-t border-pink-light/60 bg-white/95 px-2 pt-2 backdrop-blur-md"
      style={{ paddingBottom: PHONE.safeBottom }}
    >
      <div className="flex items-end justify-around">
        {items.map((item) => {
          const isActive = active === item.id;
          const Icon = item.icon;

          if (item.center) {
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onNavigate?.(item.id)}
                className="-mt-5 flex flex-col items-center"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-dark shadow-card">
                  <Icon className="h-5 w-5 text-white" />
                </div>
                <span className="mt-1 text-[10px] font-medium text-purple-dark">
                  {item.label}
                </span>
              </button>
            );
          }

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onNavigate?.(item.id)}
              className="flex flex-col items-center gap-0.5 py-1"
            >
              <Icon
                className={`h-5 w-5 ${isActive ? "text-pink-mid" : "text-gray-400"}`}
              />
              <span
                className={`text-[10px] font-medium ${isActive ? "text-pink-mid" : "text-gray-400"}`}
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

function BookIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M4 19.5A2.5 2.5 0 016.5 17H20" strokeLinecap="round" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" />
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

function CalendarIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <path d="M16 2v4M8 2v4M3 10h18" strokeLinecap="round" />
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
