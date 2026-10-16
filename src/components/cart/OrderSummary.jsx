import { useState } from 'react';
import { Link } from 'react-router-dom';
import Placeholder from '../ui/Placeholder';
import Button from '../ui/Button';
import Icon from '../ui/Icon';
import { useCart } from '../../context/CartContext';
import { formatPrice } from '../../data/products';

const PAY_ICONS = ['Visa', 'Mastercard', 'PayPal', 'Apple Pay'];

/**
 * variant='cart'     → bordered card with CTA + trust block (cart page sidebar)
 * variant='checkout' → line list + totals only (checkout summary panel)
 */
export default function OrderSummary({ variant = 'cart', onCheckout, checkoutLabel, children, className = '', flush = false }) {
  const { items, subtotal, discount, shipping, tax, total, promoCode, applyPromo, clearPromo } = useCart();
  const [code, setCode] = useState('');
  const [promoError, setPromoError] = useState('');

  const handleApply = () => {
    if (applyPromo(code)) {
      setPromoError('');
      setCode('');
    } else {
      setPromoError('That code is not valid.');
    }
  };

  const isCheckout = variant === 'checkout';

  return (
    <div className={`${isCheckout || flush ? '' : 'border border-line p-6'} ${className}`}>
      <h2 className="font-display font-extrabold uppercase text-[18px] text-ink">Order summary</h2>

      {isCheckout && items.length > 0 && (
        <ul className="mt-5 mb-5 pb-5 border-b border-line space-y-4">
          {items.map((l) => (
            <li key={l.lineId} className="flex gap-3">
              <div className="relative w-16 h-20 bg-card shrink-0">
                <Placeholder ratio="h-full" label="" src={l.image} alt={l.name} className="w-full h-full" />
                <span className="absolute -top-2 -right-2 min-w-[20px] h-5 px-1 bg-ink text-paper text-[11px] font-semibold flex items-center justify-center">
                  {l.qty}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-semibold uppercase text-ink truncate">{l.name}</p>
                <p className="text-[12px] text-graphite mt-0.5">
                  {[l.color, l.size].filter(Boolean).join(' / ')}
                </p>
                {l.print?.enabled && (
                  <p className="text-[12px] text-graphite">Custom print · {l.print.placement}</p>
                )}
              </div>
              <span className="text-[13px] text-ink shrink-0">{formatPrice(l.price * l.qty)}</span>
            </li>
          ))}
        </ul>
      )}

      <dl className={`space-y-3 text-[14px] ${isCheckout ? '' : 'mt-5'}`}>
        <div className="flex justify-between">
          <dt className="text-graphite">Subtotal</dt>
          <dd className="text-ink">{formatPrice(subtotal)}</dd>
        </div>
        {discount > 0 && (
          <div className="flex justify-between">
            <dt className="text-graphite">Discount ({promoCode})</dt>
            <dd className="text-ink">-{formatPrice(discount)}</dd>
          </div>
        )}
        <div className="flex justify-between">
          <dt className="text-graphite">Shipping</dt>
          <dd className={shipping === 0 ? 'font-semibold text-ink' : 'text-ink'}>
            {shipping === 0 ? 'FREE' : formatPrice(shipping)}
          </dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-graphite">{isCheckout ? 'Tax' : 'Estimated tax'}</dt>
          <dd className="text-ink">{isCheckout ? 'Included' : formatPrice(tax)}</dd>
        </div>
      </dl>

      <div className="mt-4">
        {promoCode ? (
          <div className="flex items-center justify-between border border-line px-3 py-2">
            <span className="text-[13px] text-ink">{promoCode} applied</span>
            <button type="button" onClick={clearPromo} className="text-[12px] text-graphite underline">
              Remove
            </button>
          </div>
        ) : (
          <div className="flex gap-2">
            <input
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Promo code"
              aria-label="Promo code"
              className="flex-1 min-h-[44px] px-3 border border-line text-base focus:outline-none focus:border-ink focus:ring-2 focus:ring-ink"
            />
            <button
              type="button"
              onClick={handleApply}
              className="px-4 h-11 bg-ink text-paper font-sans font-semibold uppercase text-[11px] tracking-label hover:bg-graphite"
            >
              Apply
            </button>
          </div>
        )}
        {promoError && (
          <p className="mt-1.5 text-[12px] text-danger" aria-live="polite">
            {promoError}
          </p>
        )}
      </div>

      <div className="mt-5 pt-5 border-t border-line flex items-end justify-between">
        <span className="font-sans font-bold uppercase text-[13px] tracking-label text-ink">Total</span>
        <span
          className={`font-display font-extrabold text-ink leading-none ${
            isCheckout ? 'text-[32px]' : 'text-[40px]'
          }`}
        >
          {formatPrice(total)}
        </span>
      </div>

      {discount > 0 && (
        <p className="mt-2 text-right font-sans font-semibold text-[13px] text-ink">
          You save {formatPrice(discount)}
        </p>
      )}

      {!isCheckout && (
        <>
          <Button
            variant="primary"
            onClick={onCheckout}
            className="w-full h-14 mt-5 text-[12px]"
          >
            {checkoutLabel || 'Proceed to checkout →'}
          </Button>
          <Link to="/shop" className="block text-center mt-4 text-[13px] text-ink underline">
            Continue shopping
          </Link>

          <div className="mt-6 border border-line p-4 flex items-start gap-3">
            <span className="w-10 h-10 bg-mist flex items-center justify-center shrink-0">
              <Icon name="lock" size={18} />
            </span>
            <div>
              <p className="font-sans font-semibold text-[13px] text-ink">SSL Secure Checkout</p>
              <p className="text-[12px] text-graphite mt-0.5">
                Your transaction details are encrypted and fully private.
              </p>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {PAY_ICONS.map((p) => (
              <span key={p} className="px-2.5 py-1 border border-line text-[11px] text-graphite">
                {p}
              </span>
            ))}
          </div>
        </>
      )}

      {children}
    </div>
  );
}
