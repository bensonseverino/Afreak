// Swatch row for product cards & quick pickers.
// Accepts either hex strings or { name, hex } objects.
const hexOf = (c) => (typeof c === 'string' ? c : c?.hex || '#000000');
const nameOf = (c) => (typeof c === 'string' ? c : c?.name || 'Color');

export default function ColorDots({ colors = [], selectedColor, onSelect, className = '', size = 10 }) {
  return (
    <div className={`flex items-center gap-2 ${className}`} role="group" aria-label="Color options">
      {colors.map((color, index) => {
        const hex = hexOf(color);
        const selected = selectedColor != null && hex === selectedColor;
        return (
          <button
            key={`${hex}-${index}`}
            onClick={(e) => {
              if (onSelect) {
                e.preventDefault();
                onSelect(hex);
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
            aria-label={`Color: ${nameOf(color)}`}
            aria-pressed={selected}
            tabIndex={onSelect ? 0 : -1}
            type="button"
          />
        );
      })}
    </div>
  );
}
