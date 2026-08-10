function pad(n: number): string {
  return String(n).padStart(2, '0');
}

export function Calendar({
  year,
  month,
  selectedDate,
  activeDates,
  basePath,
  weekdayLabels
}: {
  year: number;
  month: number;
  selectedDate: string;
  activeDates: Set<string>;
  basePath: string;
  weekdayLabels: string[];
}) {
  const first = new Date(year, month - 1, 1);
  const startWeekday = first.getDay();
  const daysInMonth = new Date(year, month, 0).getDate();
  const prevMonth = new Date(year, month - 2, 1);
  const nextMonth = new Date(year, month, 1);

  const cells: (number | null)[] = Array.from({ length: startWeekday }, () => null);
  for (let d = 1; d <= daysInMonth; d += 1) cells.push(d);

  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm dark:border-neutral-800 dark:bg-neutral-950">
      <div className="flex items-center justify-between">
        <a
          href={`${basePath}?year=${prevMonth.getFullYear()}&month=${prevMonth.getMonth() + 1}`}
          className="rounded-lg px-2 py-1 text-sm hover:bg-neutral-100 dark:hover:bg-neutral-900"
        >
          ‹
        </a>
        <p className="font-display text-lg tracking-wide">
          {year}.{pad(month)}
        </p>
        <a
          href={`${basePath}?year=${nextMonth.getFullYear()}&month=${nextMonth.getMonth() + 1}`}
          className="rounded-lg px-2 py-1 text-sm hover:bg-neutral-100 dark:hover:bg-neutral-900"
        >
          ›
        </a>
      </div>
      <div className="mt-3 grid grid-cols-7 gap-1 text-center text-xs text-neutral-500 dark:text-neutral-400">
        {weekdayLabels.map((label) => (
          <div key={label}>{label}</div>
        ))}
      </div>
      <div className="mt-1 grid grid-cols-7 gap-1">
        {cells.map((d, i) => {
          if (d === null) return <div key={`empty-${i}`} />;
          const dateKey = `${year}-${pad(month)}-${pad(d)}`;
          const isSelected = dateKey === selectedDate;
          const hasLog = activeDates.has(dateKey);
          return (
            <a
              key={dateKey}
              href={`${basePath}?year=${year}&month=${month}&date=${dateKey}`}
              className={
                isSelected
                  ? 'flex h-9 items-center justify-center rounded-lg bg-black text-sm text-white dark:bg-white dark:text-black'
                  : hasLog
                    ? 'flex h-9 items-center justify-center rounded-lg bg-blue-50 text-sm text-blue-700 dark:bg-blue-950 dark:text-blue-300'
                    : 'flex h-9 items-center justify-center rounded-lg text-sm hover:bg-neutral-100 dark:hover:bg-neutral-900'
              }
            >
              {d}
            </a>
          );
        })}
      </div>
    </div>
  );
}
