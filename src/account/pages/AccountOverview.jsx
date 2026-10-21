import { Link, useNavigate } from 'react-router-dom';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Icon from '../../components/ui/Icon';
import Placeholder from '../../components/ui/Placeholder';
import Skeleton from '../../components/ui/Skeleton';
import ProductCard from '../../components/product/ProductCard';
import StatusBadge from '../components/StatusBadge';
import OrderTracker from '../components/OrderTracker';
import StatTile from '../components/StatTile';
import AccountMenuList from '../components/AccountMenuList';
import { ACCOUNT_NAV } from '../AccountLayout';
import { useMe, useLogout } from '../../hooks/useCustomer';
import { useOverview } from '../../hooks/useOrders';
import Price from '../../components/ui/Price';
import { formatDate, formatMonthYear } from '../../utils/format';

export default function AccountOverview() {
  const navigate = useNavigate();
  const { data: me } = useMe();
  const { data: overview, isLoading } = useOverview();
  const { mutate: logout } = useLogout();

  const customer = me?.customer;
  const counts = overview?.counts || me?.counts || {};
  const latest = overview?.latestOrder;

  if (isLoading && !overview) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-2/3" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
        <Skeleton className="h-52" />
      </div>
    );
  }

  const greeting = customer?.firstName ? `Hello, ${customer.firstName}.` : 'Welcome back.';
  const contactLine = [formatMonthYear(customer?.createdAt) && `Member since ${formatMonthYear(customer.createdAt)}`, customer?.email || customer?.phone]
    .filter(Boolean)
    .join(' · ');

  const menuItems = ACCOUNT_NAV.filter((i) => !i.exact).map((i) => {
    const badge =
      i.to === '/account/orders'
        ? counts.orders
        : i.to === '/account/wishlist'
          ? counts.wishlist
          : i.to === '/account/addresses'
            ? counts.addresses
            : i.to === '/account/payment-methods'
              ? counts.paymentMethods
              : null;
    return { ...i, badge };
  });

  return (
    <div className="space-y-6 lg:space-y-8">
      {/* Header band */}
      <header>
        <h1 className="font-display font-black uppercase text-[30px] md:text-5xl leading-none text-ink">
          {greeting}
        </h1>
        <p className="mt-2 text-[13px] md:text-[14px] text-graphite">{contactLine}</p>
      </header>

      {/* Stat tiles */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatTile label="Active orders" value={counts.activeOrders ?? 0} to="/account/orders" />
        <StatTile label="Total orders" value={counts.orders ?? 0} to="/account/orders" />
        <StatTile label="Wishlist" value={counts.wishlist ?? 0} to="/account/wishlist" />
        <StatTile label="Saved addresses" value={counts.addresses ?? 0} to="/account/addresses" />
      </div>

      {/* Mobile drill-down menu (spec §7, <640) */}
      <div className="md:hidden">
        <AccountMenuList items={menuItems} onSignOut={() => logout(undefined, { onSuccess: () => navigate('/') })} />
      </div>

      {/* Latest order */}
      {latest ? (
        <section className="border border-line bg-paper p-4 md:p-6" aria-labelledby="latest-order">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 id="latest-order" className="font-display font-bold uppercase text-[16px] text-ink">
                Order {latest.number}
              </h2>
              <p className="text-[12px] text-graphite mt-0.5">{formatDate(latest.createdAt)}</p>
            </div>
            <StatusBadge status={latest.status} />
          </div>

          <div className="mt-5">
            <OrderTracker timeline={latest.timeline} status={latest.status} />
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-3">
            {latest.items.slice(0, 4).map((item) => (
              <div key={item.id} className="w-14 h-[70px]">
                <Placeholder ratio="h-full" label="" src={item.image} alt={item.name} className="w-full h-full" />
              </div>
            ))}
            <span className="font-display font-bold text-[20px] text-ink ml-auto">
              <Price amount={latest.totals.totalCents / 100} />
            </span>
          </div>

          <div className="mt-5 flex flex-col sm:flex-row gap-3">
            <Button
              variant="primary"
              onClick={() => navigate(`/account/orders/${latest.number}`)}
              className="flex-1 sm:flex-none h-12 px-6 text-[12px]"
            >
              View order
            </Button>
            {latest.trackingNumber && (
              <Button
                variant="outline"
                onClick={() => navigate(`/account/orders/${latest.number}`)}
                className="flex-1 sm:flex-none h-12 px-6 text-[12px]"
                leftIcon="truck"
              >
                Track
              </Button>
            )}
          </div>
        </section>
      ) : (
        <section className="border border-line bg-paper p-6 text-center">
          <p className="font-display font-bold uppercase text-[16px] text-ink">No orders yet</p>
          <p className="text-[13px] text-graphite mt-2">Your first drop is waiting.</p>
          <Button variant="primary" onClick={() => navigate('/shop')} className="mt-4 h-12 px-6 text-[12px]">
            Start shopping
          </Button>
        </section>
      )}

      {/* Default address + payment */}
      <div className="grid gap-4 md:grid-cols-2">
        <section className="border border-line bg-paper p-4 md:p-5 flex flex-col">
          <h2 className="font-sans font-bold uppercase text-[12px] tracking-label text-graphite">
            Default address
          </h2>
          {overview?.defaultAddress ? (
            <>
              <address className="not-italic text-[13px] text-ink leading-relaxed mt-3 flex-1">
                {overview.defaultAddress.firstName} {overview.defaultAddress.lastName}
                <br />
                {overview.defaultAddress.line1}
                <br />
                {overview.defaultAddress.city} {overview.defaultAddress.postalCode}
                <br />
                {overview.defaultAddress.country}
              </address>
              <Link to="/account/addresses" className="mt-4 text-[12px] font-semibold uppercase tracking-label text-ink underline">
                Manage
              </Link>
            </>
          ) : (
            <>
              <p className="text-[13px] text-graphite mt-3 flex-1">No saved address yet.</p>
              <Link to="/account/addresses" className="mt-4 text-[12px] font-semibold uppercase tracking-label text-ink underline">
                Add address
              </Link>
            </>
          )}
        </section>

        <section className="border border-line bg-paper p-4 md:p-5 flex flex-col">
          <h2 className="font-sans font-bold uppercase text-[12px] tracking-label text-graphite">
            Default payment method
          </h2>
          {overview?.defaultPaymentMethod ? (
            <>
              <div className="mt-3 flex-1">
                <p className="font-sans font-semibold text-[14px] text-ink">
                  {overview.defaultPaymentMethod.brand} •••• {overview.defaultPaymentMethod.last4}
                </p>
                <p className="text-[12px] text-graphite mt-0.5">
                  Expires {String(overview.defaultPaymentMethod.expMonth).padStart(2, '0')}/
                  {String(overview.defaultPaymentMethod.expYear).slice(-2)}
                </p>
                {overview.defaultPaymentMethod.isDefault && (
                  <Badge variant="default" className="mt-3">DEFAULT</Badge>
                )}
              </div>
              <Link to="/account/payment-methods" className="mt-4 text-[12px] font-semibold uppercase tracking-label text-ink underline">
                Manage
              </Link>
            </>
          ) : (
            <>
              <p className="text-[13px] text-graphite mt-3 flex-1">No saved payment method.</p>
              <Link to="/account/payment-methods" className="mt-4 text-[12px] font-semibold uppercase tracking-label text-ink underline">
                Add payment method
              </Link>
            </>
          )}
        </section>
      </div>

      {/* Wishlist preview */}
      {overview?.wishlistPreview?.length > 0 && (
        <section aria-labelledby="wishlist-preview">
          <div className="flex items-center justify-between mb-4">
            <h2 id="wishlist-preview" className="font-sans font-bold uppercase text-[12px] tracking-label text-ink">
              Wishlist
            </h2>
            <Link to="/account/wishlist" className="text-[12px] text-ink underline">
              View all
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {overview.wishlistPreview.slice(0, 4).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}

      {/* Help strip */}
      <section className="border border-line bg-paper p-4 md:p-5 flex items-center gap-4">
        <Icon name="info" size={22} className="text-graphite shrink-0" />
        <p className="flex-1 font-sans font-semibold text-[13px] text-ink">
          Need help with an order?
        </p>
        <Link
          to="/contact"
          className="text-[12px] font-semibold uppercase tracking-label text-ink underline shrink-0"
        >
          Get in touch
        </Link>
      </section>
    </div>
  );
}
