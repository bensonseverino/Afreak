// Thin progress track — used for the free-shipping bar.
export default function ProgressBar({ value = 0, max = 100, label, className = '' }) {
  const pct = Math.max(0, Math.min(100, max ? (value / max) * 100 : 0));
  return (
    <div className={className}>
      {label && <p className="text-[12px] text-graphite mb-2">{label}</p>}
      <div
        className="h-1 w-full bg-line"
        role="progressbar"
        aria-valuenow={Math.round(pct)}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div className="h-full bg-ink transition-all duration-300" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
