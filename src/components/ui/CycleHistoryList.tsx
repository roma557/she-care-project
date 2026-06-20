import type { PeriodRecord } from "@/lib/cycle-prediction";
import { formatPeriodDate } from "@/lib/cycle-prediction";
import type { DayLog } from "@/lib/cycle";

interface CycleHistoryListProps {
  records: PeriodRecord[];
  dailyLogs: Record<string, DayLog>;
}

function symptomsForRange(
  startDate: string,
  endDate: string,
  dailyLogs: Record<string, DayLog>,
): string[] {
  const seen = new Set<string>();
  const keys = Object.keys(dailyLogs).filter((k) => k >= startDate && k <= endDate);
  for (const key of keys) {
    for (const s of dailyLogs[key]?.symptoms ?? []) seen.add(s);
  }
  return [...seen];
}

export function CycleHistoryList({ records, dailyLogs }: CycleHistoryListProps) {
  if (!records.length) {
    return (
      <div className="rounded-card border border-ink/[0.05] bg-surface p-6 text-center shadow-card">
        <p className="font-serif text-base italic text-ink">No cycles logged yet</p>
        <p className="mt-2 text-xs font-light leading-relaxed text-ink-mid">
          Tap &ldquo;Period started&rdquo; on the tracker or mark days on the calendar to build your
          history.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {records.map((record) => {
        const symptoms = symptomsForRange(record.startDate, record.endDate, dailyLogs);
        const dateRange =
          record.startDate === record.endDate
            ? formatPeriodDate(record.startDate)
            : `${formatPeriodDate(record.startDate)} – ${formatPeriodDate(record.endDate)}`;

        return (
          <article
            key={record.startDate}
            className="rounded-card border border-ink/[0.05] bg-surface p-4 shadow-card"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-serif text-base text-ink">{dateRange}</p>
                <p className="mt-0.5 text-[0.65rem] font-light text-ink-faint">
                  {record.periodLengthDays} day{record.periodLengthDays !== 1 ? "s" : ""} bleeding
                </p>
              </div>
              {record.isActive && (
                <span className="shrink-0 rounded-full bg-rose-pale px-2.5 py-1 text-[0.6rem] font-medium uppercase tracking-wide text-rose-deep">
                  Active
                </span>
              )}
            </div>

            <dl className="mt-3 grid grid-cols-2 gap-3 text-[0.7rem]">
              <div>
                <dt className="text-ink-faint">Period start</dt>
                <dd className="mt-0.5 font-medium text-ink-mid">
                  {formatPeriodDate(record.startDate)}
                </dd>
              </div>
              <div>
                <dt className="text-ink-faint">Period end</dt>
                <dd className="mt-0.5 font-medium text-ink-mid">
                  {formatPeriodDate(record.endDate)}
                </dd>
              </div>
              {record.cycleLength != null && (
                <div className="col-span-2">
                  <dt className="text-ink-faint">Cycle length</dt>
                  <dd className="mt-0.5 font-medium text-ink-mid">{record.cycleLength} days</dd>
                </div>
              )}
            </dl>

            {symptoms.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {symptoms.map((s) => (
                  <span
                    key={s}
                    className="rounded-full bg-rose-pale/60 px-2 py-0.5 text-[0.6rem] text-ink-mid"
                  >
                    {s}
                  </span>
                ))}
              </div>
            )}
          </article>
        );
      })}
    </div>
  );
}
