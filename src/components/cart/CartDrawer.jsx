import { Link, useNavigate } from 'react-router-dom';
import Drawer from '../ui/Drawer';
import Button from '../ui/Button';
import Placeholder from '../ui/Placeholder';
import QuantityStepper from '../ui/QuantityStepper';
import ProgressBar from '../ui/ProgressBar';
import { useCart } from '../../context/CartContext';
import { amountToFreeShipping, FREE_SHIPPING_THRESHOLD } from '../../utils/shipping';
import { formatPrice } from '../../data/products';

// Mini-cart: right drawer on ≥768px, bottom sheet on mobile.
export default function CartDrawer() {
  const { isOpen, closeDrawer, items, count, subtotal, removeItem, updateQty } = useCart();
  const navigate = useNavigate();
  const away = amountToFreeShipping(subtotal);

  const go = (path) => {
    closeDrawer();
    navigate(path);
  };

  return (
    <Drawer
      open={isOpen}
      onClose={closeDrawer}
      title={`Your bag (${count})`}
      footer={
        <div className="p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-sans font-bold uppercase text-[12px] tracking-label text-ink">Subtotal</span>
            <span className="font-display font-bold text-[20px] text-ink">{formatPrice(subtotal)}</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              onClick={() => go('/cart')}
              disabled={items.length === 0}
              className="h-12 text-[11px]"
            >
              View bag
            </Button>
            <Button
              variant="primary"
              onClick={() => go('/checkout')}
              disabled={items.length === 0}
              className="h-12 text-[11px]"
            >
              Checkout
            </Button>
          </div>
        </div>
      }
    >
      <div className="p-4">
        <ProgressBar
          value={Math.min(subtotal, FREE_SHIPPING_THRESHOLD)}
          max={FREE_SHIPPING_THRESHOLD}
        />
        <p className="mt-2 text-[12px] text-graphite">
          {away > 0
            ? `${formatPrice(away)} away from free shipping`
            : 'You qualify for free shipping'}
        </p>

        {items.length === 0 ? (
          <p className="py-12 text-center text-[13px] text-graphite">Your bag is empty.</p>
        ) : (
          <ul className="mt-2 divide-y divide-line">
            {items.map((l) => (
              <li key={l.lineId} className="py-4 flex gap-3">
                {l.slug ? (
                  <Link
                    to={`/product/${l.slug}`}
                    onClick={closeDrawer}
                    className="w-[72px] h-[90px] bg-card shrink-0 overflow-hidden"
                  >
                    <Placeholder ratio="h-full" label="" src={l.image} alt={l.name} className="w-full h-full" />
                  </Link>
                ) : (
                  <span className="w-[72px] h-[90px] bg-card shrink-0 overflow-hidden">
                    <Placeholder ratio="h-full" label="" src={l.image} alt={l.name} className="w-full h-full" />
                  </span>
                )}

                <div className="flex-1 min-w-0">
                  <div className="flex justify-between gap-2">
                    {l.slug ? (
                      <Link
                        to={`/product/${l.slug}`}
                        onClick={closeDrawer}
                        className="text-[13px] font-semibold uppercase text-ink truncate hover:text-graphite"
                      >
                        {l.name}
                      </Link>
                    ) : (
                      <span className="text-[13px] font-semibold uppercase text-ink truncate">
                        {l.name}
                      </span>
                    )}
                    <span className="text-[13px] text-ink shrink-0">
                      {formatPrice(l.price * l.qty)}
                    </span>
                  </div>
                  <p className="text-[12px] text-graphite mt-0.5">
                    {[l.color, l.size].filter(Boolean).join(' / ')}
                  </p>
                  <div className="mt-2 flex items-center justify-between gap-2">
                    <QuantityStepper
                      size="sm"
                      value={l.qty}
                      max={l.maxQty ?? 10}
                      onChange={(q) => updateQty(l.lineId, q)}
                    />
                    <button
                      type="button"
                      onClick={() => removeItem(l.lineId)}
                      className="text-[12px] text-graphite underline hover:text-danger"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </Drawer>
  );
}
