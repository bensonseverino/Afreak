import { colorHex, colorName } from '../../data/products';
import Icon from '../ui/Icon';

// 28px swatches with a 44px tap area. Selection ring 1px ink + 2px offset.
// Accepts either hex strings or { name, hex, swatchImageUrl, available } objects.
export default function ColorSwatches({ colors = [], selected, onSelect, className = '' }) {
  const getHex = (c) => (typeof c === 'string' ? c : c?.hex ?? '#000000');
  const getName = (c) => (typeof c === 'string' ? c : c?.name ?? '');
  const getImage = (c) => (typeof c === 'object' ? c?.swatchImageUrl : null);
  const isAvailable = (c) => (typeof c === 'object' ? c?.available !== false : true);

  return (
    <div className={`flex flex-wrap items-center -ml-2 ${className}`} role="radiogroup" aria-label="Color">
      {colors.map((c) => {
        const hex = getHex(c);
        const name = getName(c);
        const image = getImage(c);
        const active = name === selected || hex === selected;
        const available = isAvailable(c);
        return (
          <button
            key={name || hex}
            onClick={() => available && onSelect?.(name || hex)}
            role="radio"
            aria-checked={active}
            aria-label={name}
            aria-disabled={!available}
            className={`w-11 h-11 flex items-center justify-center shrink-0 relative ${!available ? 'opacity-40 cursor-not-allowed' : ''}`}
            type="button"
          >
            {image ? (
              <img
                src={image}
                alt=""
                className="w-7 h-7 rounded-full object-cover ring-1 ring-line"
                style={{ boxShadow: active ? '0 0 0 2px var(--color-ink)' : 'none' }}
              />
            ) : (
              <span
                className={`block w-7 h-7 rounded-full ring-1 ring-offset-2 ring-offset-paper transition-all ${
                  active ? 'ring-ink' : 'ring-transparent hover:ring-line'
                }`}
                style={{ backgroundColor: hex, boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.12)' }}
              />
            )}
            {!available && (
              <span
                className="absolute inset-0 flex items-center justify-center pointer-events-none"
                aria-hidden="true"
              >
                <svg viewBox="0 0 14 14" className="w-5 h-5 text-paper/80">
                  <line x1="2" y1="2" x2="12" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
