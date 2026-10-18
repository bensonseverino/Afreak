import { useEffect } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import Button from '../components/ui/Button';
import Icon from '../components/ui/Icon';
import Placeholder from '../components/ui/Placeholder';
import ProductGrid from '../components/product/ProductGrid';
import { getFeaturedProducts, formatPrice } from '../data/products';
import { DELIVERY_METHODS } from '../utils/shipping';
import { useIsSignedIn } from '../hooks/useCustomer';

const STORAGE_KEY = 'afreak.lastOrder';

export default function OrderSuccess() {
  const location = useLocation();
  const navigate = useNavigate();
  const { signedIn } = useIsSignedIn();
  const stateOrder = location.state?.order;

  // Persist so a refresh doesn't dump the user back home.
  useEffect(() => {
    if (stateOrder) {
      try {
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(stateOrder));
      } catch {
        /* ignore */
      }
    }
  }, [stateOrder]);

  let order = stateOrder;
  if (!order) {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      order = raw ? JSON.parse(raw) : null;
    } catch {
      order = null;
    }
  }

  if (!order) return <Navigate to="/" replace />;

  const { items = [], totals = {}, address = {}, email } = order;
  const delivery = DELIVERY_METHODS.find((m) => m.id === order.deliveryMethod);
  const recommendations = getFeaturedProducts(4);

  return (
    <div className="min-h-screen bg-paper">
      <div className="max-w-wide mx-auto px-4 md:px-6 lg:px-8 py-12 lg:py-20">
        <div className="max-w-xl mx-auto text-center">
          <span className="inline-flex w-16 h-16 bg-ink items-center justify-center text-volt">
            <Icon name="check" size={32} />
          </span>
          <h1 className="font-display font-black uppercase text-[40px] md:text-[48px] leading-none text-ink mt-6">
            Thank you.
          </h1>
          <p className="font-sans font-semibold text-[15px] text-ink mt-4">
            Order {order.id} confirmed
          </p>
          <p className="text-[14px] text-graphite mt-2">
            A confirmation has been sent to {email}
          </p>

          <div className="flex flex-col sm:flex-row gap-3 mt-8">
            <Button
              variant="primary"
              onClick={() => navigate('/shop')}
              className="flex-1 h-14 text-[12px]"
            >
              Continue shopping
            </Button>
            <Button
              variant="outline"
              disabled
              className="flex-1 h-14 text-[12px]"
            >
              View order
            </Button>
          </div>
        </div>

        <div className="max-w-xl mx-auto mt-12">
          <div className="border border-line p-6 text-left">
            <h2 className="font-display font-extrabold uppercase text-[16px] text-ink mb-5">
              Order summary
            </h2>

            <ul className="space-y-4 pb-5 border-b border-line">
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
                  <span className="text-[13px] text-ink shrink-0">
                    {formatPrice(l.price * l.qty)}
                  </span>
                </li>
              ))}
            </ul>

            <dl className="mt-5 space-y-3 text-[14px]">
              <div className="flex justify-between">
                <dt className="text-graphite">Subtotal</dt>
                <dd className="text-ink">{formatPrice(totals.subtotal)}</dd>
              </div>
              {totals.discount > 0 && (
                <div className="flex justify-between">
                  <dt className="text-graphite">Discount</dt>
                  <dd className="text-ink">-{formatPrice(totals.discount)}</dd>
                </div>
              )}
              <div className="flex justify-between">
                <dt className="text-graphite">Shipping</dt>
                <dd className="text-ink">
                  {totals.shipping === 0 ? 'FREE' : formatPrice(totals.shipping)}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-graphite">Tax</dt>
                <dd className="text-ink">Included</dd>
              </div>
            </dl>

            <div className="mt-5 pt-5 border-t border-line flex items-end justify-between">
              <span className="font-sans font-bold uppercase text-[13px] tracking-label text-ink">Total</span>
              <span className="font-display font-extrabold text-[28px] leading-none text-ink">
                {formatPrice(totals.total)}
              </span>
            </div>

            <div className="mt-6 pt-6 border-t border-line grid sm:grid-cols-2 gap-5 text-[13px]">
              <div>
                <p className="font-sans font-bold uppercase text-[11px] tracking-label text-graphite mb-2">
                  Deliver to
                </p>
                <p className="text-ink">
                  {address.firstName} {address.lastName}
                  <br />
                  {address.address1}
                  {address.address2 ? <><br />{address.address2}</> : null}
                  <br />
                  {address.city} {address.postalCode}
                  <br />
                  {address.country}
                </p>
              </div>
              <div>
                <p className="font-sans font-bold uppercase text-[11px] tracking-label text-graphite mb-2">
                  Delivery method
                </p>
                <p className="text-ink">{delivery ? `${delivery.label} · ${delivery.note}` : 'Standard'}</p>
                <p className="font-sans font-bold uppercase text-[11px] tracking-label text-graphite mt-4 mb-2">
                  Payment
                </p>
                <p className="text-ink">Card · Paid</p>
              </div>
            </div>
          </div>
        </div>

        {!signedIn && (
          <div className="max-w-xl mx-auto mt-8 border border-line p-6 text-center">
            <p className="font-display font-extrabold uppercase text-[16px] text-ink">
              Request an account to track orders
            </p>
            <p className="text-[13px] text-graphite mt-2">
              Create an account and our team will approve it shortly. An admin can link this order
              once your account is active.
            </p>
            <div className="mt-5 flex flex-col sm:flex-row gap-3">
              <Button
                variant="primary"
                onClick={() => navigate('/account/sign-up')}
                className="flex-1 h-12 text-[12px]"
                type="button"
              >
                Request an account
              </Button>
            </div>
            <p className="mt-4 text-[13px] text-graphite">
              Already have an account?{' '}
              <Link to="/account/login" className="text-ink underline">
                Sign in
              </Link>
            </p>
          </div>
        )}

        {recommendations.length > 0 && (
          <section className="mt-16" aria-label="You may also like">
            <h2 className="font-sans font-bold uppercase text-[13px] tracking-label text-ink mb-6">
              You may also like
            </h2>
            <ProductGrid products={recommendations} columns={{ base: 2, md: 3, lg: 4 }} />
          </section>
        )}
      </div>
    </div>
  );
}
