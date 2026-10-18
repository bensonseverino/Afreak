/**
 * Two-or-more way segmented control (spec §6.2): 48px tall, shared 1px borders,
 * the selected segment is solid ink. Square corners, no radius.
 */
export default function Segmented({ value, onChange, options, label, className = '' }) {
  return (
    <div
      role="group"
      aria-label={label}
      className={`grid ${className}`}
      style={{ gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))` }}
    >
      {options.map((option, index) => {
        const selected = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={selected}
            onClick={() => onChange(option.value)}
            className={`h-12 font-sans font-semibold uppercase text-[12px] tracking-label border border-line transition-colors ${
              index > 0 ? '-ml-px' : ''
            } ${
              selected
                ? 'relative z-10 bg-ink text-paper border-ink'
                : 'bg-paper text-ink hover:bg-mist'
            }`}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
