export interface CalendarCell {
  day: number | null;
  isPeriod?: boolean;
  isOvulation?: boolean;
  isFertile?: boolean;
  isPredicted?: boolean;
  isToday?: boolean;
}

interface CalendarGridProps {
  cells: CalendarCell[];
  onDayClick?: (day: number) => void;
}

export function buildCalendarCells(
  year: number,
  month: number,
  periodDays: number[],
  ovulDay: number,
  fertileDays: number[],
  predictedDays: number[],
  today: number,
): CalendarCell[] {
  const startDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: CalendarCell[] = [];

  for (let i = 0; i < startDay; i++) cells.push({ day: null });

  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({
      day: d,
      isPeriod: periodDays.includes(d),
      isOvulation: d === ovulDay,
      isFertile: fertileDays.includes(d),
      isPredicted: predictedDays.includes(d),
      isToday: d === today,
    });
  }

  return cells;
}

function dayClass(cell: CalendarCell): string {
  const base =
    "flex aspect-square w-full max-w-[40px] items-center justify-center rounded-full text-[0.75rem] transition-all duration-150 active:scale-95";

  if (cell.isPeriod) return `${base} bg-rose-deep text-white`;
  if (cell.isOvulation) return `${base} bg-rose-mid text-white shadow-[0_0_0_3px_rgba(217,137,154,0.30)]`;
  if (cell.isFertile) return `${base} bg-rose-deep/10 text-rose-deep`;
  if (cell.isPredicted) return `${base} bg-rose-deep/[0.07] text-ink-mid`;
  if (cell.isToday) return `${base} border-[1.5px] border-rose-deep font-medium text-rose-deep`;
  return `${base} text-ink-mid hover:bg-rose-pale/50`;
}

export function CalendarGrid({ cells, onDayClick }: CalendarGridProps) {
  return (
    <div className="grid grid-cols-7 gap-y-2">
      {cells.map((cell, i) =>
        cell.day === null ? (
          <div key={`empty-${i}`} />
        ) : (
          <button
            key={cell.day}
            type="button"
            onClick={() => onDayClick?.(cell.day!)}
            className="flex justify-center"
          >
            <span className={dayClass(cell)}>{cell.day}</span>
          </button>
        ),
      )}
    </div>
  );
}
