// Swatch row for product cards & quick pickers.
// Accepts either hex strings or { name, hex } objects.
export default function ColorDots({ colors = [], selectedColor, onSelect, className = '', size = 10, maxVisible }) {
  const hexOf = (c) => (typeof c === 'string' ? c : c?.hex || '#000000');
  const nameOf = (c) => (typeof c === 'string' ? c : c?.name || 'Color');
  const visibleColors = maxVisible ? colors.slice(0, maxVisible) : colors;
  const extraCount = maxVisible && colors.length > maxVisible ? colors.length - maxVisible : 0;

  return (
    <div className={`flex items-center gap-2 ${className}`} role="group" aria-label="Color options">
      {visibleColors.map((color, index) => {
        const hex = hexOf(color);
        const name = nameOf(color);
        const selected = selectedColor != null && name === selectedColor;
        return (
          <button
            key={`${name}-${index}`}
            onClick={(e) => {
              if (onSelect) {
                e.preventDefault();
                onSelect(name);
              }
            }}
            className={`relative flex-shrink-0 rounded-full transition-all duration-200 ${
              selected ? 'border-ink' : 'border-transparent hover:border-stone'
            }`}
            style={{
              width: size,
              height: size,
              backgroundColor: hex,
              borderWidth: 1,
              boxShadow: selected ? '0 0 0 1px #fff, 0 0 0 2px #000' : '0 0 0 1px rgba(0,0,0,0.12)',
            }}
            aria-label={`Color: ${name}`}
            aria-pressed={selected}
            tabIndex={onSelect ? 0 : -1}
            type="button"
          />
        );
      })}
      {extraCount > 0 && (
        <span className="flex-shrink-0 rounded-full border border-line text-[10px] font-medium text-graphite px-1.5">
          +{extraCount}
        </span>
      )}
    </div>
  );
}
