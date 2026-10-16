import { colorHex, colorName } from '../../data/products';

// 28px swatches with a 44px tap area. Selection ring 1px ink + 2px offset.
export default function ColorSwatches({ colors = [], selected, onSelect, className = '' }) {
  return (
    <div className={`flex flex-wrap items-center -ml-2 ${className}`} role="radiogroup" aria-label="Color">
      {colors.map((c) => {
        const hex = colorHex(c);
        const active = hex === selected;
        return (
          <button
            key={hex}
            onClick={() => onSelect?.(hex)}
            role="radio"
            aria-checked={active}
            aria-label={colorName(c)}
            className="w-11 h-11 flex items-center justify-center shrink-0"
            type="button"
          >
            <span
              className={`block w-7 h-7 rounded-full ring-1 ring-offset-2 ring-offset-paper transition-all ${
                active ? 'ring-ink' : 'ring-transparent hover:ring-line'
              }`}
              style={{ backgroundColor: hex, boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.12)' }}
            />
          </button>
        );
      })}
    </div>
  );
}
