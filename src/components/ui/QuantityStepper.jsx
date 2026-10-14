export default function QuantityStepper({ value = 1, min = 1, max = 99, onChange, className = '', disabled = false }) {
  const handleChange = (newValue) => {
    const clamped = Math.min(Math.max(newValue, min), max);
    onChange?.(clamped);
  };

  return (
    <div className={`inline-flex items-center border border-line ${className}`} role="group" aria-label="Quantity">
      <button
        onClick={() => handleChange(value - 1)}
        disabled={value <= min || disabled}
        className="w-11 h-11 flex items-center justify-center border-r border-line bg-paper text-ink hover:bg-mist disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        aria-label="Decrease quantity"
        type="button"
      >
        <span className="text-[18px] font-medium">−</span>
      </button>
      <input
        type="text"
        value={String(value).padStart(2, '0')}
        readOnly
        className="w-16 h-11 text-center font-sans font-medium text-[13px] bg-paper border-none focus:outline-none text-ink"
        aria-live="polite"
      />
      <button
        onClick={() => handleChange(value + 1)}
        disabled={value >= max || disabled}
        className="w-11 h-11 flex items-center justify-center border-l border-line bg-paper text-ink hover:bg-mist disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        aria-label="Increase quantity"
        type="button"
      >
        <span className="text-[18px] font-medium">+</span>
      </button>
    </div>
  );
}