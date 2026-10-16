import Stars from '../ui/Stars';
import Button from '../ui/Button';
import { formatCount } from '../../utils/format';

const DISTRIBUTION = [
  { stars: 5, pct: 78 },
  { stars: 4, pct: 15 },
  { stars: 3, pct: 5 },
  { stars: 2, pct: 1 },
  { stars: 1, pct: 1 },
];

const REVIEWS = [
  { name: 'Amina K.', rating: 5, date: '12 Mar 2026', text: 'Exactly as described — heavyweight, structured and the fit is spot on. Sizing runs true.' },
  { name: 'Jonas M.', rating: 4, date: '02 Mar 2026', text: 'Great quality for the price. Took a star off because I wish the sleeves were slightly longer.' },
  { name: 'Priya S.', rating: 5, date: '24 Feb 2026', text: 'Wore it every day for a week. Holds its shape after washing and the colour has not faded.' },
];

// Placeholder reviews block. `id="reviews"` is the scroll target from the rating link.
export default function ReviewsPreview({ rating = 0, reviewCount = 0, className = '' }) {
  return (
    <section id="reviews" className={`scroll-mt-24 ${className}`} aria-label="Customer reviews">
      <h2 className="font-sans font-bold uppercase text-[13px] tracking-label text-ink mb-6">Reviews</h2>

      <div className="grid gap-8 md:grid-cols-[240px_1fr] mb-10">
        <div>
          <p className="font-display font-extrabold text-[56px] leading-none text-ink">{rating}</p>
          <Stars value={rating} size={16} className="mt-2" />
          <p className="text-[12px] text-graphite mt-2">Based on {formatCount(reviewCount)} reviews</p>
        </div>

        <ul className="space-y-2">
          {DISTRIBUTION.map((d) => (
            <li key={d.stars} className="flex items-center gap-3">
              <span className="w-10 text-[12px] text-graphite shrink-0">{d.stars} star</span>
              <span className="flex-1 h-1.5 bg-line">
                <span className="block h-full bg-ink" style={{ width: `${d.pct}%` }} />
              </span>
              <span className="w-10 text-right text-[12px] text-graphite shrink-0">{d.pct}%</span>
            </li>
          ))}
        </ul>
      </div>

      <ul className="grid gap-4 md:grid-cols-3 mb-8">
        {REVIEWS.map((r) => (
          <li key={r.name} className="border border-line p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="font-sans font-semibold text-[13px] text-ink">{r.name}</span>
              <span className="text-[12px] text-graphite">{r.date}</span>
            </div>
            <Stars value={r.rating} size={13} />
            <p className="text-[13px] text-graphite mt-3 leading-relaxed">{r.text}</p>
          </li>
        ))}
      </ul>

      <Button variant="outline" size="md">Write a review</Button>
    </section>
  );
}
