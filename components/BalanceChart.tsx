type BalanceChartProps = {
  points: number[];
};

export function BalanceChart({ points }: BalanceChartProps) {
  const width = 760;
  const height = 220;
  const min = Math.min(...points);
  const max = Math.max(...points);
  const range = max - min || 1;

  const path = points
    .map((p, i) => {
      const x = (i / (points.length - 1)) * width;
      const y = height - ((p - min) / range) * height;
      return `${i === 0 ? 'M' : 'L'} ${x.toFixed(2)} ${y.toFixed(2)}`;
    })
    .join(' ');

  return (
    <div className="card">
      <h3>Compound Growth Curve</h3>
      <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label="balance history">
        <path d={path} fill="none" stroke="url(#grad)" strokeWidth="4" strokeLinecap="round" />
        <defs>
          <linearGradient id="grad" x1="0" x2="1" y1="0" y2="0">
            <stop offset="0%" stopColor="#22d3ee" />
            <stop offset="100%" stopColor="#6366f1" />
          </linearGradient>
        </defs>
      </svg>
      <p className="small">Real-time equity path with compounding effects.</p>
    </div>
  );
}
