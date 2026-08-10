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
  const yPad = 10;
  const stepX = points.length > 1 ? width / (points.length - 1) : 0;
  const coords = points.map((p, i) => ({
    x: points.length > 1 ? i * stepX : width / 2,
    y: yPad + (1 - (p.weightKg - minW) / range) * (height - yPad * 2)
  }));
  const linePoints = coords.map((c) => `${c.x.toFixed(1)},${c.y.toFixed(1)}`).join(' ');
  const areaPath =
    `M ${coords[0].x.toFixed(1)},${height} ` +
    coords.map((c) => `L ${c.x.toFixed(1)},${c.y.toFixed(1)}`).join(' ') +
    ` L ${coords[coords.length - 1].x.toFixed(1)},${height} Z`;

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
        <path d={areaPath} fill="currentColor" className="opacity-[0.08]" />
        <polyline
          points={linePoints}
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
        />
        {coords.map((c, i) => (
          <circle
            key={i}
            cx={c.x}
            cy={c.y}
            r="2.2"
            vectorEffect="non-scaling-stroke"
            strokeWidth="1.5"
            className="fill-blue-500 stroke-white dark:fill-blue-400 dark:stroke-neutral-950"
          />
        ))}
      </svg>
    </div>
  );
}
