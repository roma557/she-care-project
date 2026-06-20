import type { FC } from "react";

export type IconName =
  | "home"
  | "calendar"
  | "chat"
  | "chart"
  | "user"
  | "moon"
  | "sparkle"
  | "droplet"
  | "leaf"
  | "heart"
  | "bell"
  | "clipboard"
  | "star"
  | "pencil"
  | "book"
  | "refresh"
  | "info"
  | "lock"
  | "settings"
  | "walk"
  | "dumbbell"
  | "wind"
  | "clock"
  | "phone-off"
  | "thermometer"
  | "coffee"
  | "warning"
  | "flower"
  | "sun"
  | "shield"
  | "watch";

interface IconProps {
  className?: string;
}

export function AppIcon({ name, className = "h-5 w-5" }: { name: IconName; className?: string }) {
  const icons: Record<IconName, FC<IconProps>> = {
    home: HomeIcon,
    calendar: CalendarIcon,
    chat: ChatIcon,
    chart: ChartIcon,
    user: UserIcon,
    moon: MoonIcon,
    sparkle: SparkleIcon,
    droplet: DropletIcon,
    leaf: LeafIcon,
    heart: HeartIcon,
    bell: BellIcon,
    clipboard: ClipboardIcon,
    star: StarIcon,
    pencil: PencilIcon,
    book: BookIcon,
    refresh: RefreshIcon,
    info: InfoIcon,
    lock: LockIcon,
    settings: SettingsIcon,
    walk: WalkIcon,
    dumbbell: DumbbellIcon,
    wind: WindIcon,
    clock: ClockIcon,
    "phone-off": PhoneOffIcon,
    thermometer: ThermometerIcon,
    coffee: CoffeeIcon,
    warning: WarningIcon,
    flower: FlowerIcon,
    sun: SunIcon,
    shield: ShieldIcon,
    watch: WatchIcon,
  };

  const Icon = icons[name];
  return <Icon className={className} />;
}

function strokeIcon(className?: string) {
  return `stroke-current ${className ?? "h-5 w-5"}`;
}

function HomeIcon({ className }: IconProps) {
  return (
    <svg className={strokeIcon(className)} viewBox="0 0 24 24" fill="none" strokeWidth="1.8">
      <path d="M3 10.5L12 3l9 7.5V20a1 1 0 01-1 1h-5v-6H9v6H4a1 1 0 01-1-1v-9.5z" strokeLinejoin="round" />
    </svg>
  );
}

function CalendarIcon({ className }: IconProps) {
  return (
    <svg className={strokeIcon(className)} viewBox="0 0 24 24" fill="none" strokeWidth="1.8">
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <path d="M16 2v4M8 2v4M3 10h18" strokeLinecap="round" />
    </svg>
  );
}

function ChatIcon({ className }: IconProps) {
  return (
    <svg className={strokeIcon(className)} viewBox="0 0 24 24" fill="none" strokeWidth="1.8">
      <path d="M12 3l1.5 3.5L17 8l-3.5 1.5L12 13l-1.5-3.5L7 8l3.5-1.5L12 3z" strokeLinejoin="round" />
      <path d="M5 17l-1 4 4-1" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ChartIcon({ className }: IconProps) {
  return (
    <svg className={strokeIcon(className)} viewBox="0 0 24 24" fill="none" strokeWidth="1.8">
      <path d="M4 20V10M10 20V4M16 20v-6M22 20V8" strokeLinecap="round" />
    </svg>
  );
}

function UserIcon({ className }: IconProps) {
  return (
    <svg className={strokeIcon(className)} viewBox="0 0 24 24" fill="none" strokeWidth="1.8">
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" strokeLinecap="round" />
    </svg>
  );
}

function MoonIcon({ className }: IconProps) {
  return (
    <svg className={strokeIcon(className)} viewBox="0 0 24 24" fill="none" strokeWidth="1.8">
      <path d="M21 14.5A8.5 8.5 0 1112.5 6 6.5 6.5 0 0021 14.5z" strokeLinejoin="round" />
    </svg>
  );
}

function SparkleIcon({ className }: IconProps) {
  return (
    <svg className={strokeIcon(className)} viewBox="0 0 24 24" fill="none" strokeWidth="1.8">
      <path d="M12 2l1.2 4.8L18 8l-4.8 1.2L12 14l-1.2-4.8L6 8l4.8-1.2L12 2z" strokeLinejoin="round" />
      <path d="M19 15l.6 2.4L22 18l-2.4.6L19 21l-.6-2.4L16 18l2.4-.6L19 15z" strokeLinejoin="round" />
    </svg>
  );
}

function DropletIcon({ className }: IconProps) {
  return (
    <svg className={strokeIcon(className)} viewBox="0 0 24 24" fill="none" strokeWidth="1.8">
      <path d="M12 3c3 5 7 8.5 7 12a7 7 0 11-14 0c0-3.5 4-7 7-12z" strokeLinejoin="round" />
    </svg>
  );
}

function LeafIcon({ className }: IconProps) {
  return (
    <svg className={strokeIcon(className)} viewBox="0 0 24 24" fill="none" strokeWidth="1.8">
      <path d="M6 20C14 20 18 14 20 4c-8 2-14 8-14 16z" strokeLinejoin="round" />
      <path d="M10 14l4-4" strokeLinecap="round" />
    </svg>
  );
}

function HeartIcon({ className }: IconProps) {
  return (
    <svg className={strokeIcon(className)} viewBox="0 0 24 24" fill="none" strokeWidth="1.8">
      <path d="M12 20s-7-4.5-7-10a4 4 0 017-2 4 4 0 017 2c0 5.5-7 10-7 10z" strokeLinejoin="round" />
    </svg>
  );
}

function BellIcon({ className }: IconProps) {
  return (
    <svg className={strokeIcon(className)} viewBox="0 0 24 24" fill="none" strokeWidth="1.8">
      <path d="M18 16H6l1.5-2v-5a5.5 5.5 0 1111 0v5L18 16z" strokeLinejoin="round" />
      <path d="M10 20a2 2 0 004 0" strokeLinecap="round" />
    </svg>
  );
}

function ClipboardIcon({ className }: IconProps) {
  return (
    <svg className={strokeIcon(className)} viewBox="0 0 24 24" fill="none" strokeWidth="1.8">
      <rect x="5" y="4" width="14" height="18" rx="2" />
      <path d="M9 4h6v3H9z" strokeLinejoin="round" />
      <path d="M9 12h6M9 16h4" strokeLinecap="round" />
    </svg>
  );
}

function StarIcon({ className }: IconProps) {
  return (
    <svg className={strokeIcon(className)} viewBox="0 0 24 24" fill="none" strokeWidth="1.8">
      <path d="M12 3l2.4 5.5L20 9.5l-4.5 4 1.1 5.5L12 16.8 7.4 19l1.1-5.5-4.5-4 5.6-1L12 3z" strokeLinejoin="round" />
    </svg>
  );
}

function PencilIcon({ className }: IconProps) {
  return (
    <svg className={strokeIcon(className)} viewBox="0 0 24 24" fill="none" strokeWidth="1.8">
      <path d="M4 20h4l10-10-4-4L4 16v4z" strokeLinejoin="round" />
      <path d="M13 7l4 4" strokeLinecap="round" />
    </svg>
  );
}

function BookIcon({ className }: IconProps) {
  return (
    <svg className={strokeIcon(className)} viewBox="0 0 24 24" fill="none" strokeWidth="1.8">
      <path d="M5 4h9a3 3 0 013 3v14H8a3 3 0 00-3 3V4z" strokeLinejoin="round" />
      <path d="M8 4v17" strokeLinecap="round" />
    </svg>
  );
}

function RefreshIcon({ className }: IconProps) {
  return (
    <svg className={strokeIcon(className)} viewBox="0 0 24 24" fill="none" strokeWidth="1.8">
      <path d="M4 12a8 8 0 0113.5-5.7L20 8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M20 5v3h-3" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M20 12a8 8 0 01-13.5 5.7L4 16" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M4 19v-3h3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function InfoIcon({ className }: IconProps) {
  return (
    <svg className={strokeIcon(className)} viewBox="0 0 24 24" fill="none" strokeWidth="1.8">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 10v6M12 7h.01" strokeLinecap="round" />
    </svg>
  );
}

function LockIcon({ className }: IconProps) {
  return (
    <svg className={strokeIcon(className)} viewBox="0 0 24 24" fill="none" strokeWidth="1.8">
      <rect x="5" y="11" width="14" height="10" rx="2" />
      <path d="M8 11V8a4 4 0 118 0v3" strokeLinecap="round" />
    </svg>
  );
}

function SettingsIcon({ className }: IconProps) {
  return (
    <svg className={strokeIcon(className)} viewBox="0 0 24 24" fill="none" strokeWidth="1.8">
      <circle cx="12" cy="12" r="3" />
      <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" strokeLinecap="round" />
    </svg>
  );
}

function WalkIcon({ className }: IconProps) {
  return (
    <svg className={strokeIcon(className)} viewBox="0 0 24 24" fill="none" strokeWidth="1.8">
      <circle cx="13" cy="5" r="2" />
      <path d="M6 21l3-7 4 1 3-5 2 4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function DumbbellIcon({ className }: IconProps) {
  return (
    <svg className={strokeIcon(className)} viewBox="0 0 24 24" fill="none" strokeWidth="1.8">
      <path d="M4 9v6M7 7v10M17 7v10M20 9v6" strokeLinecap="round" />
      <path d="M7 12h10" strokeLinecap="round" />
    </svg>
  );
}

function WindIcon({ className }: IconProps) {
  return (
    <svg className={strokeIcon(className)} viewBox="0 0 24 24" fill="none" strokeWidth="1.8">
      <path d="M4 8h11a3 3 0 100-6M4 14h14a3 3 0 110 6M4 20h8" strokeLinecap="round" />
    </svg>
  );
}

function ClockIcon({ className }: IconProps) {
  return (
    <svg className={strokeIcon(className)} viewBox="0 0 24 24" fill="none" strokeWidth="1.8">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function PhoneOffIcon({ className }: IconProps) {
  return (
    <svg className={strokeIcon(className)} viewBox="0 0 24 24" fill="none" strokeWidth="1.8">
      <rect x="7" y="3" width="10" height="18" rx="2" />
      <path d="M11 18h2" strokeLinecap="round" />
      <path d="M4 4l16 16" strokeLinecap="round" />
    </svg>
  );
}

function ThermometerIcon({ className }: IconProps) {
  return (
    <svg className={strokeIcon(className)} viewBox="0 0 24 24" fill="none" strokeWidth="1.8">
      <path d="M14 4a4 4 0 00-8 0v9a6 6 0 1016 0V9a4 4 0 00-8 0" strokeLinejoin="round" />
      <path d="M10 13v3" strokeLinecap="round" />
    </svg>
  );
}

function CoffeeIcon({ className }: IconProps) {
  return (
    <svg className={strokeIcon(className)} viewBox="0 0 24 24" fill="none" strokeWidth="1.8">
      <path d="M6 8h12v7a4 4 0 01-4 4H8a4 4 0 01-4-4V8z" strokeLinejoin="round" />
      <path d="M18 10h1a2 2 0 010 4h-1M6 4v2M10 4v2M14 4v2" strokeLinecap="round" />
    </svg>
  );
}

function WarningIcon({ className }: IconProps) {
  return (
    <svg className={strokeIcon(className)} viewBox="0 0 24 24" fill="none" strokeWidth="1.8">
      <path d="M12 4l9 16H3L12 4z" strokeLinejoin="round" />
      <path d="M12 10v4M12 18h.01" strokeLinecap="round" />
    </svg>
  );
}

function FlowerIcon({ className }: IconProps) {
  return (
    <svg className={strokeIcon(className)} viewBox="0 0 24 24" fill="none" strokeWidth="1.8">
      <circle cx="12" cy="12" r="2.5" />
      <path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M5.6 18.4l2.1-2.1M16.3 7.7l2.1-2.1" strokeLinecap="round" />
    </svg>
  );
}

function SunIcon({ className }: IconProps) {
  return (
    <svg className={strokeIcon(className)} viewBox="0 0 24 24" fill="none" strokeWidth="1.8">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" strokeLinecap="round" />
    </svg>
  );
}

function ShieldIcon({ className }: IconProps) {
  return (
    <svg className={strokeIcon(className)} viewBox="0 0 24 24" fill="none" strokeWidth="1.8">
      <path d="M12 3l8 3v6c0 5-3.5 8.5-8 9-4.5-.5-8-4-8-9V6l8-3z" strokeLinejoin="round" />
    </svg>
  );
}

function WatchIcon({ className }: IconProps) {
  return (
    <svg className={strokeIcon(className)} viewBox="0 0 24 24" fill="none" strokeWidth="1.8">
      <rect x="6" y="6" width="12" height="12" rx="3" />
      <path d="M9 3h6M9 21h6" strokeLinecap="round" />
      <path d="M12 9v4l2 1" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
