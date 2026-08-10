interface WeightPoint {
  date: string;
  weightKg: number;
}

function formatShortDate(iso: string, locale: 'ko' | 'en'): string {
  const d = new Date(iso);
  return locale === 'ko' ? `${d.getMonth() + 1}/${d.getDate()}` : `${d.getMonth() + 1}/${d.getDate()}`;
}

export function WeightChart({ points, locale = 'ko' }: { points: WeightPoint[]; locale?: 'ko' | 'en' }) {
  const weights = points.map((p) => p.weightKg);
  const minW = Math.min(...weights);
  const maxW = Math.max(...weights);
  const range = maxW - minW || 1;

  const width = 320;
  const height = 130;
  const padX = 28;
  const padTop = 22;
  const padBottom = 20;
  const chartHeight = height - padTop - padBottom;

  const stepX = points.length > 1 ? (width - padX * 2) / (points.length - 1) : 0;
  const coords = points.map((p, i) => ({
    x: padX + (points.length > 1 ? i * stepX : (width - padX * 2) / 2),
    y: padTop + (1 - (p.weightKg - minW) / range) * chartHeight,
    weightKg: p.weightKg,
    date: p.date
  }));

  const linePoints = coords.map((c) => `${c.x.toFixed(1)},${c.y.toFixed(1)}`).join(' ');
  const baseline = height - padBottom;
  const areaPath =
    `M ${coords[0].x.toFixed(1)},${baseline} ` +
    coords.map((c) => `L ${c.x.toFixed(1)},${c.y.toFixed(1)}`).join(' ') +
    ` L ${coords[coords.length - 1].x.toFixed(1)},${baseline} Z`;

  // 포인트가 많으면 라벨이 겹치므로 최대 6~7개만 솎아서 표시(마지막 포인트는 항상 표시)
  const labelStep = Math.max(1, Math.ceil(coords.length / 6));
  const showLabel = (i: number) => i % labelStep === 0 || i === coords.length - 1;

  return (
    <div className="mx-auto w-full max-w-full">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full text-blue-500 dark:text-blue-400" style={{ height: `${height}px` }}>
        <path d={areaPath} fill="currentColor" className="opacity-[0.08]" />
        <polyline
          points={linePoints}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {coords.map((c, i) => (
          <g key={i}>
            <circle cx={c.x} cy={c.y} r="2.4" strokeWidth="1.3" className="fill-blue-500 stroke-white dark:fill-blue-400 dark:stroke-neutral-950" />
            {showLabel(i) && (
              <>
                <text
                  x={c.x}
                  y={c.y - 7}
                  textAnchor="middle"
                  fontSize="9"
                  className="fill-neutral-600 font-medium dark:fill-neutral-300"
                >
                  {c.weightKg}kg
                </text>
                <text x={c.x} y={height - 5} textAnchor="middle" fontSize="8" className="fill-neutral-400 dark:fill-neutral-500">
                  {formatShortDate(c.date, locale)}
                </text>
              </>
            )}
          </g>
        ))}
      </svg>
    </div>
  );
}
