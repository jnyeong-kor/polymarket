type ProgressBarProps = {
  label: string;
  value: number;
};

export function ProgressBar({ label, value }: ProgressBarProps) {
  const pct = Math.round(value * 100);
  return (
    <div className="progressWrap">
      <div className="progressTop">
        <span>{label}</span>
        <span>{pct}%</span>
      </div>
      <div className="progressTrack">
        <div className="progressFill" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
