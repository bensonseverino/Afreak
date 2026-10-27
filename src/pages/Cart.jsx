import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import CartLine from '../components/cart/CartLine';
import OrderSummary from '../components/cart/OrderSummary';
import EmptyCart from '../components/cart/EmptyCart';
import StickyCheckoutBar from '../components/cart/StickyCheckoutBar';
import AccessoryCard from '../components/pdp/AccessoryCard';
import ProgressBar from '../components/ui/ProgressBar';
import Toast from '../components/ui/Toast';
import Price from '../components/ui/Price';
import { useCart } from '../context/CartContext';
import useCartDisplayTotals from '../hooks/useCartDisplayTotals';
import { useProducts } from '../lib/catalog';
import { useShippingThreshold } from '../hooks/useMenuData';

export default function Cart() {
  const { items, count, subtotal, removeItem, updateQty, addItem } = useCart();
  const { displayTotal } = useCartDisplayTotals();
  const freeShippingThreshold = useShippingThreshold();
  const navigate = useNavigate();
  const [toast, setToast] = useState(null);
  const timerRef = useRef(null);

  // Real accessory products, so anything added here can actually be ordered.
  const { products: accessories } = useProducts({ category: 'accessories', limit: 8 });

  useEffect(() => () => clearTimeout(timerRef.current), []);

  const handleRemove = (line) => {
    removeItem(line.lineId);
    setToast(line);
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setToast(null), 5000);
  };

  const handleUndo = () => {
    if (toast) addItem(toast, { open: false });
    setToast(null);
    clearTimeout(timerRef.current);
  };

  const away = Math.max(0, freeShippingThreshold - subtotal);

  const inCart = new Set(items.map((l) => l.productId));
  const recommended = accessories.filter((a) => !inCart.has(a.id)).slice(0, 4);

  const addAccessory = (accessory) =>
    addItem({
      productId: accessory.id,
      slug: accessory.slug ?? null,
      name: accessory.name,
      price: accessory.price,
      color: '',
      size: '',
      qty: 1,
      image: accessory.images?.[0] || null,
      print: { enabled: false, placement: null, fileName: null },
      maxQty: 10,
      kind: 'accessory',
    });

  return (
    <div className="min-h-screen bg-paper">
      <div className="max-w-wide mx-auto px-4 md:px-6 lg:px-8 py-8 lg:py-12 pb-32 sm:pb-12">
        {items.length === 0 ? (
          <EmptyCart />
        ) : (
          <div className="lg:grid lg:grid-cols-[1fr_400px] lg:gap-10">
            <div className="max-w-2xl mx-auto lg:mx-0 lg:max-w-none w-full">
              <div className="flex items-end justify-between mb-6">
                <h1 className="font-display font-extrabold uppercase text-[28px] sm:text-[32px] text-ink leading-none">
                  <span className="sm:hidden">Your bag</span>
                  <span className="hidden sm:inline">Shopping cart</span>
                </h1>
                <div className="flex items-center gap-4">
                  <span className="font-sans text-[13px] text-graphite">
                    {count} {count === 1 ? 'item' : 'items'}
                  </span>
                  <Link to="/shop" className="sm:hidden text-[13px] text-ink underline">
                    Continue shopping
                  </Link>
                </div>
              </div>

              <div className="sm:hidden mb-6">
                <ProgressBar value={Math.min(subtotal, freeShippingThreshold)} max={freeShippingThreshold} />
                <p className="mt-2 text-[12px] text-graphite">
                  {away > 0
                    ? <><Price amount={away} /> away from free shipping</>
                    : 'You qualify for free shipping'}
                </p>
              </div>

              <div className="sm:space-y-4">
                {items.map((line) => (
                  <CartLine
                    key={line.lineId}
                    line={line}
                    isNew={Boolean(line.isNew)}
                    onQtyChange={updateQty}
                    onRemove={handleRemove}
                  />
                ))}
              </div>

              {recommended.length > 0 && (
                <section className="mt-10" aria-label="Recommended accessories">
                  <h2 className="font-sans font-bold uppercase text-[12px] tracking-label text-ink mb-4">
                    Recommended accessories
                  </h2>
                  <div className="flex gap-3 overflow-x-auto snap-x snap-mandatory no-scrollbar pb-1 sm:grid sm:grid-cols-2 sm:gap-3 sm:overflow-visible">
                    {recommended.map((a) => (
                      <div key={a.id} className="w-[70%] shrink-0 snap-start sm:w-auto">
                        <AccessoryCard
                          accessory={{ ...a, image: a.images?.[0] || null }}
                          onAdd={addAccessory}
                          className="h-full"
                        />
                      </div>
                    ))}
                  </div>
                </section>
              )}

              <div className="mt-10 lg:hidden">
                <OrderSummary
                  flush
                  onCheckout={() => navigate('/checkout')}
                  checkoutLabel="Proceed to checkout →"
                />
              </div>
            </div>

            <div className="hidden lg:block">
              <div className="sticky top-24">
                <OrderSummary onCheckout={() => navigate('/checkout')} />
              </div>
            </div>
          </div>
        )}
      </div>

      {items.length > 0 && (
        <StickyCheckoutBar amount={displayTotal} onAction={() => navigate('/checkout')} />
      )}

      <Toast
        open={Boolean(toast)}
        message={toast ? `Removed ${toast.name}` : ''}
        actionLabel="Undo"
        onAction={handleUndo}
        onClose={() => setToast(null)}
      />
    </div>
  );
}
