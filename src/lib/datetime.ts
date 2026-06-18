/** Date/time helpers — all values derived from the device clock */

export function startOfDay(date: Date = new Date()): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

export function toDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function parseDateKey(key: string): Date {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function formatStatusBarTime(date: Date = new Date()): string {
  return date.toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });
}

export function formatMonthYear(date: Date = new Date()): string {
  return date.toLocaleDateString(undefined, { month: "long", year: "numeric" });
}

export function formatTodayLong(date: Date = new Date()): string {
  return date.toLocaleDateString(undefined, {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

export function getDaysInMonth(date: Date = new Date()): number {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
}

export function getMonthStartOffset(date: Date = new Date()): number {
  return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
}

export function getCurrentCycleDay(cycleStartDate: string, today: Date = new Date()): number {
  const start = startOfDay(parseDateKey(cycleStartDate));
  const now = startOfDay(today);
  const diff = Math.round((now.getTime() - start.getTime()) / 86400000);
  return Math.min(Math.max(diff + 1, 1), 35);
}

export function cycleStartFromDay(cycleDay: number, today: Date = new Date()): string {
  return toDateKey(addDays(startOfDay(today), -(cycleDay - 1)));
}

export interface WeekStripDay {
  dateKey: string;
  dayNum: number;
  weekday: string;
  isToday: boolean;
}

export function getWeekStrip(reference: Date = new Date()): WeekStripDay[] {
  const todayKey = toDateKey(reference);
  return Array.from({ length: 7 }, (_, i) => {
    const d = addDays(reference, i - 3);
    return {
      dateKey: toDateKey(d),
      dayNum: d.getDate(),
      weekday: ["S", "M", "T", "W", "T", "F", "S"][d.getDay()],
      isToday: toDateKey(d) === todayKey,
    };
  });
}

export interface MonthCalendar {
  year: number;
  month: number;
  daysInMonth: number;
  startOffset: number;
  monthLabel: string;
  todayKey: string;
}

export function getMonthCalendar(reference: Date = new Date()): MonthCalendar {
  return {
    year: reference.getFullYear(),
    month: reference.getMonth(),
    daysInMonth: getDaysInMonth(reference),
    startOffset: getMonthStartOffset(reference),
    monthLabel: formatMonthYear(reference),
    todayKey: toDateKey(reference),
  };
}

export function dateKeyForDayOfMonth(
  day: number,
  reference: Date = new Date(),
): string {
  return toDateKey(new Date(reference.getFullYear(), reference.getMonth(), day));
}
