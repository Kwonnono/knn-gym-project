'use client';

import { useRouter } from 'next/navigation';

function pad(n: number): string {
  return String(n).padStart(2, '0');
}

function toDateKey(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function DateNav({ date, todayLabel }: { date: string; todayLabel: string }) {
  const router = useRouter();
  const current = new Date(`${date}T00:00:00`);
  const prev = new Date(current);
  prev.setDate(current.getDate() - 1);
  const next = new Date(current);
  next.setDate(current.getDate() + 1);
  const todayKey = toDateKey(new Date());
  const isToday = date === todayKey;

  return (
    <div className="flex items-center gap-1.5 text-sm">
      <a
        href={`/dashboard?date=${toDateKey(prev)}`}
        className="rounded-lg px-2 py-1 text-neutral-500 transition-colors hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-900"
      >
        ‹
      </a>
      <input
        type="date"
        defaultValue={date}
        onChange={(e) => {
          if (e.target.value) router.push(`/dashboard?date=${e.target.value}`);
        }}
        className="rounded-lg border border-neutral-300 bg-white px-2 py-1 text-sm dark:border-neutral-700 dark:bg-neutral-900"
      />
      <a
        href={`/dashboard?date=${toDateKey(next)}`}
        className="rounded-lg px-2 py-1 text-neutral-500 transition-colors hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-900"
      >
        ›
      </a>
      {isToday && <span className="text-xs text-neutral-400 dark:text-neutral-500">({todayLabel})</span>}
    </div>
  );
}
