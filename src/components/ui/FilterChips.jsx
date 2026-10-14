import Icon from './Icon';

export default function FilterChips({ chips = [], onRemove, className = '' }) {
  if (chips.length === 0) return null;

  return (
    <div className={`flex flex-wrap gap-2 mb-6 ${className}`} role="group" aria-label="Active filters">
      {chips.map((chip, index) => (
        <span key={index} className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-label border border-ink bg-paper text-ink">
          {chip.label}
          <button
            onClick={() => onRemove?.(chip.key)}
            className="w-5 h-5 flex items-center justify-center hover:bg-mist transition-colors -mr-1"
            aria-label={`Remove ${chip.label} filter`}
            type="button"
          >
            <Icon name="close" size={12} />
          </button>
        </span>
      ))}
    </div>
  );
}