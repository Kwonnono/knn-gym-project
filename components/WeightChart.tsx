interface WeightPoint {
  date: string;
  weightKg: number;
}

export function WeightChart({ points }: { points: WeightPoint[] }) {
  const weights = points.map((p) => p.weightKg);
  const minW = Math.min(...weights);
  const maxW = Math.max(...weights);
  const latest = points[points.length - 1].weightKg;
  const range = maxW - minW || 1;

  const width = 100;
  const height = 100;
  const stepX = points.length > 1 ? width / (points.length - 1) : 0;
  const coords = points.map((p, i) => ({
    x: points.length > 1 ? i * stepX : width / 2,
    y: height - ((p.weightKg - minW) / range) * height
  }));
  const linePoints = coords.map((c) => `${c.x.toFixed(1)},${c.y.toFixed(1)}`).join(' ');

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-baseline justify-between text-xs text-neutral-500 dark:text-neutral-400">
        <span>{maxW}kg</span>
        <span className="font-display text-lg tracking-wide text-blue-600 dark:text-blue-400">{latest}kg</span>
        <span>{minW}kg</span>
      </div>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="none"
        className="mt-2 min-h-[80px] w-full flex-1 text-blue-500 dark:text-blue-400"
      >
        <polyline points={linePoints} fill="none" stroke="currentColor" strokeWidth="2" vectorEffect="non-scaling-stroke" />
        {coords.map((c, i) => (
          <circle key={i} cx={c.x} cy={c.y} r="1.6" vectorEffect="non-scaling-stroke" className="fill-blue-500 dark:fill-blue-400" />
        ))}
      </svg>
    </div>
  );
}
