export type ProgressBarColor = 'blue' | 'rose' | 'emerald' | 'amber';

const COLOR_CLASSES: Record<ProgressBarColor, string> = {
  blue: 'bg-blue-500 dark:bg-blue-400',
  rose: 'bg-rose-500 dark:bg-rose-400',
  emerald: 'bg-emerald-500 dark:bg-emerald-400',
  amber: 'bg-amber-500 dark:bg-amber-400'
};

export function ProgressBar({
  label,
  value,
  target,
  unit,
  color = 'blue'
}: {
  label: string;
  value: number;
  target: number;
  unit: string;
  color?: ProgressBarColor;
}) {
  const pct = target > 0 ? Math.min(100, Math.round((value / target) * 100)) : 0;
  return (
    <div>
      <div className="flex justify-between text-sm">
        <span>{label}</span>
        <span className="text-neutral-500 dark:text-neutral-400">
          {value}{unit} / {target}{unit}
        </span>
      </div>
      <div className="mt-1 h-2 rounded-full bg-neutral-200 dark:bg-neutral-800">
        <div className={`h-2 rounded-full ${COLOR_CLASSES[color]}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
