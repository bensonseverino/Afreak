import { useRef } from 'react';
import Placeholder from '../ui/Placeholder';
import Icon from '../ui/Icon';

// Tablet: horizontal thumb strip. Desktop: vertical rail.
export default function ThumbStrip({ images = [], index, onSelect, layout = 'row' }) {
  const ref = useRef(null);
  const nudge = (dir) => {
    ref.current?.scrollBy({ left: dir * 160, behavior: 'smooth' });
  };

  const tiles = images.map((img, i) => (
    <button
      key={i}
      onClick={() => onSelect?.(i)}
      aria-label={`View image ${i + 1}`}
      aria-current={i === index}
      className={`w-[72px] h-[88px] border shrink-0 overflow-hidden transition-colors ${
        i === index ? 'border-ink' : 'border-line hover:border-graphite'
      }`}
      type="button"
    >
      <Placeholder ratio="h-full" label="" src={img} alt="" className="w-full h-full" />
    </button>
  ));

  if (layout === 'column') {
    return (
      <div className="hidden lg:flex flex-col gap-3 max-h-[560px] overflow-y-auto no-scrollbar">
        {tiles}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={() => nudge(-1)}
        aria-label="Previous thumbnails"
        className="w-9 h-9 border border-line flex items-center justify-center text-ink hover:bg-mist shrink-0"
        type="button"
      >
        <Icon name="chevronLeft" size={16} />
      </button>
      <div ref={ref} className="flex gap-3 overflow-x-auto no-scrollbar flex-1">
        {tiles}
      </div>
      <button
        onClick={() => nudge(1)}
        aria-label="Next thumbnails"
        className="w-9 h-9 border border-line flex items-center justify-center text-ink hover:bg-mist shrink-0"
        type="button"
      >
        <Icon name="chevronRight" size={16} />
      </button>
    </div>
  );
}
