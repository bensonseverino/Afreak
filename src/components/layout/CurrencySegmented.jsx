import RateNote from '../ui/RateNote';
import useCurrency from '../../hooks/useCurrency';

/**
 * Mobile/tablet currency control (spec §2) — the segmented equivalent of the
 * header dropdown, sized for a 320px menu. Same state, same persistence.
 */
export default function CurrencySegmented({ className = '' }) {
  const { currency, setCurrency, availableCurrencies } = useCurrency();

  return (
    <div className={className}>
      <p className="font-sans font-semibold uppercase text-[11px] tracking-label text-white/60">
        Currency
      </p>

      <div
        role="group"
        aria-label="Select currency"
        className="mt-3 grid gap-px bg-white/15 p-px"
        style={{
          gridTemplateColumns: `repeat(${availableCurrencies.length}, minmax(0, 1fr))`,
        }}
      >
        {availableCurrencies.map((option) => {
          const selected = option.code === currency;
          return (
            <button
              key={option.code}
              type="button"
              onClick={() => setCurrency(option.code)}
              aria-pressed={selected}
              className={`flex min-h-11 items-center justify-center gap-1 px-1 font-sans text-[11px] font-semibold uppercase tracking-label transition-colors ${
                selected ? 'bg-volt text-ink' : 'bg-ink text-white/70 hover:text-volt'
              }`}
            >
              <span aria-hidden="true" className="normal-case">{option.symbol}</span>
              <span>{option.code}</span>
            </button>
          );
        })}
      </div>

      <RateNote className="mt-3 font-sans text-[11px] text-white/40" />
    </div>
  );
}
