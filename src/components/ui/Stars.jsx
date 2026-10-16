import Icon from './Icon';

// Black stars with half-star support. `value` may be fractional (e.g. 4.8).
export default function Stars({ value = 0, size = 14, className = '' }) {
  return (
    <span
      className={`inline-flex items-center gap-[2px] ${className}`}
      role="img"
      aria-label={`Rated ${value} out of 5`}
    >
      {[0, 1, 2, 3, 4].map((i) => {
        const fill = Math.max(0, Math.min(1, value - i));
        return (
          <span key={i} className="relative inline-block" style={{ width: size, height: size }}>
            <Icon name="starEmpty" size={size} className="absolute inset-0 text-stone" />
            {fill > 0 && (
              <span className="absolute inset-y-0 left-0 overflow-hidden" style={{ width: `${fill * 100}%` }}>
                <Icon name="star" size={size} className="text-ink" />
              </span>
            )}
          </span>
        );
      })}
    </span>
  );
}
