export default function QuantityStepper({
  value = 1,
  min = 1,
  max = 99,
  onChange,
  className = '',
  disabled = false,
  size = 'md',
}) {
  const handleChange = (newValue) => {
    if (disabled) return;
    const clamped = Math.min(Math.max(newValue, min), max);
    onChange?.(clamped);
  };

  const dims =
    size === 'sm'
      ? { btn: 'w-9 h-9', sym: 'text-[16px]', input: 'w-10 h-9 text-[12px]' }
      : { btn: 'w-11 h-11', sym: 'text-[18px]', input: 'w-16 h-11 text-[13px]' };

  return (
    <div className={`inline-flex items-center border border-line ${className}`} role="group" aria-label="Quantity">
      <button
        onClick={() => handleChange(value - 1)}
        disabled={value <= min || disabled}
        className={`${dims.btn} flex items-center justify-center border-r border-line bg-paper text-ink hover:bg-mist disabled:opacity-40 disabled:cursor-not-allowed transition-colors`}
        aria-label="Decrease quantity"
        type="button"
      >
        <span className={`${dims.sym} font-medium leading-none`}>−</span>
      </button>
      <input
        type="text"
        value={String(value).padStart(2, '0')}
        readOnly
        className={`${dims.input} text-center font-sans font-medium bg-paper border-none focus:outline-none text-ink`}
        aria-live="polite"
        aria-label="Quantity"
      />
      <button
        onClick={() => handleChange(value + 1)}
        disabled={value >= max || disabled}
        className={`${dims.btn} flex items-center justify-center border-l border-line bg-paper text-ink hover:bg-mist disabled:opacity-40 disabled:cursor-not-allowed transition-colors`}
        aria-label="Increase quantity"
        type="button"
      >
        <span className={`${dims.sym} font-medium leading-none`}>+</span>
      </button>
    </div>
  );
}
