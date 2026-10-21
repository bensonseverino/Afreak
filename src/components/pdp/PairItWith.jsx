import { useState } from 'react';
import { Link } from 'react-router-dom';
import Placeholder from '../ui/Placeholder';
import Icon from '../ui/Icon';
import Carousel from '../ui/Carousel';
import SizeSheet from './SizeSheet';
import Price from '../ui/Price';

// Scroll-snap product row; "Add to bag" opens the quick-add size sheet.
export default function PairItWith({ products = [], className = '', onAdd }) {
  const [sheetProduct, setSheetProduct] = useState(null);

  if (!products.length) return null;

  return (
    <section className={className} aria-label="Pair it with">
      <Carousel
        title="PAIR IT WITH"
        items={products}
        itemClass="w-[44%] md:w-[calc((100%-2rem)/3)] lg:w-[calc((100%-3rem)/4)]"
        renderItem={(p) => (
          <div>
            <Link to={`/product/${p.slug}`} className="block group">
              <div className="aspect-[3/4] bg-card mb-3 overflow-hidden">
                <Placeholder ratio="h-full" label="" src={p.images?.[0]} alt={p.name} className="w-full h-full" />
              </div>
              <p className="font-sans font-semibold uppercase text-[12px] text-ink truncate group-hover:text-graphite transition-colors">
                {p.name}
              </p>
              <p className="text-[13px] text-graphite mt-1"><Price amount={p.price} /></p>
            </Link>
            <button
              onClick={() => setSheetProduct(p)}
              className="mt-3 inline-flex items-center gap-2 font-sans font-semibold uppercase text-[11px] tracking-label text-ink hover:text-graphite transition-colors"
              type="button"
            >
              <Icon name="bag" size={14} /> Add to bag
            </button>
          </div>
        )}
      />

      <SizeSheet
        open={Boolean(sheetProduct)}
        product={sheetProduct}
        onClose={() => setSheetProduct(null)}
        onAdded={() => onAdd?.(sheetProduct)}
      />
    </section>
  );
}
