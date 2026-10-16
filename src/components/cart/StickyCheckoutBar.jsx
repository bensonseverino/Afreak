import Button from '../ui/Button';
import Icon from '../ui/Icon';
import { formatPrice } from '../../data/products';

// Fixed bottom action bar (mobile). Reused by cart and checkout.
export default function StickyCheckoutBar({
  total,
  onAction,
  label = 'Checkout →',
  loading = false,
  disabled = false,
  className = 'sm:hidden',
}) {
  return (
    <div
      className={`fixed bottom-0 inset-x-0 z-40 bg-paper border-t border-line pb-[env(safe-area-inset-bottom)] px-4 py-3 flex items-center gap-4 ${className}`}
    >
      <div className="shrink-0">
        <p className="font-sans font-bold uppercase text-[11px] tracking-label text-graphite">Total</p>
        <p className="font-display font-extrabold text-[18px] leading-none text-ink">{formatPrice(total)}</p>
      </div>
      <Button
        variant="primary"
        onClick={onAction}
        disabled={disabled || loading}
        className="flex-1 h-[52px] text-[12px]"
      >
        {loading ? (
          <span className="inline-flex items-center gap-2">
            <Icon name="spinner" size={16} className="animate-spin" /> Processing…
          </span>
        ) : (
          label
        )}
      </Button>
    </div>
  );
}
