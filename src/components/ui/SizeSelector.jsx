export default function SizeSelector({ sizes = [], selectedSize, onSelect, disabledSizes = [], className = '', required = false }) {
  return (
    <div className={className} role="group" aria-label="Size selection" aria-required={required}>
      <div className="flex gap-0" role="radiogroup" aria-label="Sizes">
        {sizes.map((size, index) => (
          <button
            key={size}
            onClick={() => !disabledSizes.includes(size) && onSelect?.(size)}
            disabled={disabledSizes.includes(size)}
            className={`relative flex-1 min-w-0 py-3 px-2 text-center font-sans font-medium text-[13px] border border-line transition-all duration-200 ${
              selectedSize === size
                ? 'bg-ink text-paper z-10'
                : 'bg-paper text-ink hover:bg-mist'
            } ${disabledSizes.includes(size) ? 'text-stone cursor-not-allowed relative' : ''} ${
              index > 0 ? '-ml-px' : ''
            }`}
            aria-pressed={selectedSize === size}
            aria-disabled={disabledSizes.includes(size)}
            role="radio"
            type="button"
          >
            {size}
            {disabledSizes.includes(size) && (
              <span className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-6 h-6 mx-auto">
                  <line x1="4" y1="4" x2="20" y2="20" />
                </svg>
              </span>
            )}
          </button>
        ))}
      </div>
      {required && !selectedSize && (
        <p className="mt-2 text-[12px] text-volt font-medium">Select a size</p>
      )}
    </div>
  );
}