import Stars from '../ui/Stars';
import Icon from '../ui/Icon';
import { formatCount } from '../../utils/format';

// Square rating + feature list card.
export default function HighlightsPanel({ rating = 0, reviewCount = 0, features = [], className = '' }) {
  return (
    <section className={`border border-line p-6 ${className}`} aria-label="Ratings and highlights">
      <div className="pb-5 border-b border-line">
        <p className="font-sans font-bold uppercase text-[11px] tracking-label text-graphite mb-2">Rating</p>
        <div className="flex items-end gap-3">
          <span className="font-display font-extrabold text-[48px] leading-none text-ink">{rating}</span>
          <div className="pb-1">
            <Stars value={rating} size={16} />
            <a href="#reviews" className="block text-[12px] text-graphite underline mt-1">
              ({formatCount(reviewCount)} reviews)
            </a>
          </div>
        </div>
      </div>

      <ul className="pt-5 flex gap-6 overflow-x-auto no-scrollbar md:flex-col md:gap-4 md:overflow-visible">
        {features.slice(0, 3).map((f, i) => (
          <li key={i} className="flex items-start gap-3 shrink-0 w-[72%] md:w-auto">
            <span className="w-6 h-6 flex items-center justify-center text-ink shrink-0 mt-0.5">
              <Icon name={f.icon} size={22} />
            </span>
            <span className="min-w-0">
              <span className="block font-sans font-semibold text-[14px] text-ink">{f.title}</span>
              <span className="block text-[12px] text-graphite">{f.sub}</span>
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
