import { useRef } from 'react';
import Icon from './Icon';

// Native scroll-snap row with optional desktop arrow controls.
export default function Carousel({
  items = [],
  renderItem,
  itemClass = '',
  title,
  action,
  showArrows = true,
  subtitle,
  className = '',
}) {
  const ref = useRef(null);

  const scroll = (dir) => {
    const el = ref.current;
    if (!el) return;
    el.scrollBy({ left: dir * el.clientWidth * 0.8, behavior: 'smooth' });
  };

  return (
    <section className={className}>
      {(title || showArrows) && (
        <div className="flex items-end justify-between mb-5 gap-4">
          <div>
            {title && (
              <h2 className="font-sans font-bold uppercase text-[13px] tracking-label text-ink">{title}</h2>
            )}
            {subtitle && <p className="text-[12px] text-graphite mt-1">{subtitle}</p>}
          </div>
          <div className="flex items-center gap-3">
            {action}
            {showArrows && (
              <div className="hidden md:flex items-center gap-2">
                <button
                  onClick={() => scroll(-1)}
                  aria-label="Previous"
                  className="w-11 h-11 border border-line flex items-center justify-center text-ink hover:bg-mist transition-colors"
                  type="button"
                >
                  <Icon name="chevronLeft" size={18} />
                </button>
                <button
                  onClick={() => scroll(1)}
                  aria-label="Next"
                  className="w-11 h-11 border border-line flex items-center justify-center text-ink hover:bg-mist transition-colors"
                  type="button"
                >
                  <Icon name="chevronRight" size={18} />
                </button>
              </div>
            )}
          </div>
        </div>
      )}
      <div
        ref={ref}
        className="flex gap-4 overflow-x-auto snap-x snap-mandatory no-scrollbar scroll-smooth pb-1"
      >
        {items.map((item, i) => (
          <div key={i} className={`snap-start shrink-0 ${itemClass}`}>
            {renderItem(item, i)}
          </div>
        ))}
      </div>
    </section>
  );
}
