type MetricCardProps = {
  label: string;
  value: string;
  highlight?: 'positive' | 'negative';
};

export function MetricCard({ label, value, highlight }: MetricCardProps) {
  return (
    <div className="metric">
      <span>{label}</span>
      <strong className={highlight ? `value-${highlight}` : ''}>{value}</strong>
    </div>
  );
}
