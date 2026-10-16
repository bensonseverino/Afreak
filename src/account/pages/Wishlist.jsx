import { useState } from 'react';
import { Link } from 'react-router-dom';
import ProductCard from '../../components/product/ProductCard';
import SizeSheet from '../../components/pdp/SizeSheet';
import Icon from '../../components/ui/Icon';
import Skeleton from '../../components/ui/Skeleton';
import EmptyState from '../components/EmptyState';
import { useWishlist } from '../../hooks/useWishlist';

const isSoldOut = (product) => !(product?.sizes || []).some((s) => s.stock > 0);

export default function Wishlist() {
  const { list, toggle, loading } = useWishlist();
  const [quickAdd, setQuickAdd] = useState(null);

  if (loading) {
    return (
      <div>
        <Skeleton className="h-8 w-1/2 mb-5" />
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="aspect-[5/6]" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="font-display font-extrabold uppercase text-2xl md:text-3xl text-ink">Wishlist</h1>

      {list.length === 0 ? (
        <EmptyState
          icon="heart"
          title="Your wishlist is empty"
          action={
            <Link
              to="/shop"
              className="inline-flex items-center justify-center h-12 px-6 bg-ink text-paper font-sans font-semibold uppercase tracking-label text-[12px] hover:bg-graphite"
            >
              Explore new arrivals
            </Link>
          }
        >
          Tap the heart on any piece to save it here.
        </EmptyState>
      ) : (
        <div className="mt-5 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {list.map((product) => {
            const soldOut = isSoldOut(product);
            return (
              <div key={product.id} className="flex flex-col">
                <div className="relative">
                  <ProductCard product={product} />
                  {soldOut && (
                    <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-center pointer-events-none">
                      <span className="bg-ink text-paper font-sans font-semibold uppercase text-[11px] tracking-label px-3 py-1.5">
                        Unavailable
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 mt-3">
                  <button
                    type="button"
                    disabled={soldOut}
                    onClick={() => setQuickAdd(product)}
                    className="flex-1 inline-flex items-center justify-center h-10 border border-ink text-ink font-sans font-semibold uppercase text-[11px] tracking-label hover:bg-ink hover:text-paper transition-colors disabled:border-stone disabled:text-stone disabled:hover:bg-transparent"
                  >
                    Add to bag
                  </button>
                  <button
                    type="button"
                    onClick={() => toggle(product)}
                    aria-label={`Remove ${product.name} from wishlist`}
                    className="w-10 h-10 flex items-center justify-center border border-line text-ink hover:border-danger hover:text-danger transition-colors shrink-0"
                  >
                    <Icon name="trash" size={16} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <SizeSheet open={Boolean(quickAdd)} product={quickAdd} onClose={() => setQuickAdd(null)} />
    </div>
  );
}
