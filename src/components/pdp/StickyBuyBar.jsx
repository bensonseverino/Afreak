import Button from '../ui/Button';
import Price from '../ui/Price';

// Fixed purchase bar, <1024px only. Rendered only after the main CTA scrolls away.
export default function StickyBuyBar({ visible, product, onAction, added = false }) {
  if (!visible) return null;

  return (
    <div className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-paper border-t border-line pb-[env(safe-area-inset-bottom)] px-4 py-3 flex items-center gap-4">
      <div className="shrink-0">
        <p className="font-display font-extrabold text-[18px] leading-none text-ink"><Price amount={product.price} /></p>
        {product.oldPrice && (
          <p className="text-[11px] text-graphite line-through mt-1"><Price amount={product.oldPrice} /></p>
        )}
      </div>
      <Button variant="primary" onClick={onAction} className="flex-1 h-[52px] text-[12px]">
        {added ? 'Added ✓' : 'Add to bag'}
      </Button>
    </div>
  );
}
