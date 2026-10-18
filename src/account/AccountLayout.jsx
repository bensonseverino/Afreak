import { Link, Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom';
import Icon from '../components/ui/Icon';
import Skeleton from '../components/ui/Skeleton';
import useNoIndex from '../hooks/useNoIndex';
import { useLogout, useMe } from '../hooks/useCustomer';

export const ACCOUNT_NAV = [
  { label: 'Overview', to: '/account', icon: 'home', exact: true },
  { label: 'Orders', to: '/account/orders', icon: 'bag' },
  { label: 'Payment methods', to: '/account/payment-methods', icon: 'creditCard' },
  { label: 'Addresses', to: '/account/addresses', icon: 'pin' },
  { label: 'Wishlist', to: '/account/wishlist', icon: 'heart' },
  { label: 'Profile', to: '/account/profile', icon: 'user' },
  { label: 'Security', to: '/account/security', icon: 'shield' },
];

function pageTitle(pathname) {
  if (pathname.startsWith('/account/orders/') && pathname !== '/account/orders') return 'Order';
  if (pathname.startsWith('/account/orders')) return 'Orders';
  const match = ACCOUNT_NAV.find((item) => !item.exact && pathname.startsWith(item.to));
  if (pathname === '/account') return 'Account';
  return match?.label || 'Account';
}

/**
 * Account chrome (spec §7):
 *  ≥1024  grid with sticky sidebar
 *  640–1023  horizontally scrollable tab bar
 *  <640   sticky back bar on sub-pages; Overview renders its own menu list
 */
export default function AccountLayout() {
  const { data, isLoading } = useMe();
  const { mutate: logout, isPending } = useLogout();
  const location = useLocation();
  const navigate = useNavigate();

  useNoIndex();

  const customer = data?.customer;
  if (!isLoading && !customer) {
    const next = encodeURIComponent(location.pathname);
    return <Navigate to={`/sign-in?next=${next}`} replace />;
  }

  const onSignOut = () =>
    logout(undefined, { onSuccess: () => navigate('/', { replace: true }) });

  const isActive = (item) => (item.exact ? location.pathname === item.to : location.pathname.startsWith(item.to));
  const isIndex = location.pathname === '/account';

  const initial = (customer?.firstName?.[0] || customer?.email?.[0] || 'A').toUpperCase();

  return (
    <div className="bg-paper md:bg-mist min-h-screen">
      <div className="max-w-wide mx-auto px-4 md:px-6 lg:px-8 py-6 lg:py-10">
        <div className="lg:grid lg:grid-cols-[260px_1fr] lg:gap-10">
          {/* Sidebar — desktop */}
          <aside className="hidden lg:block">
            <div className="sticky top-24">
              <div className="border border-line bg-paper p-4">
                <div className="flex items-center gap-3">
                  <span className="w-12 h-12 bg-ink text-paper flex items-center justify-center font-display font-extrabold text-[18px]">
                    {initial}
                  </span>
                  <div className="min-w-0">
                    {isLoading ? (
                      <>
                        <Skeleton className="h-4 w-28" />
                        <Skeleton className="h-3 w-36 mt-2" />
                      </>
                    ) : (
                      <>
                        <p className="font-sans font-semibold text-[14px] text-ink truncate">
                          {customer?.firstName ? `${customer.firstName} ${customer.lastName || ''}`.trim() : 'Your account'}
                        </p>
                        <p className="text-[12px] text-graphite truncate">
                          {customer?.email || customer?.phone}
                        </p>
                      </>
                    )}
                  </div>
                </div>

                <nav className="mt-5" aria-label="Account">
                  <ul>
                    {ACCOUNT_NAV.map((item) => {
                      const active = isActive(item);
                      return (
                        <li key={item.to}>
                          <Link
                            to={item.to}
                            aria-current={active ? 'page' : undefined}
                            className={`flex items-center gap-3 px-3 h-11 font-sans font-semibold uppercase text-[13px] tracking-label transition-colors ${
                              active ? 'bg-ink text-paper' : 'text-ink hover:bg-mist'
                            }`}
                          >
                            <Icon name={item.icon} size={18} />
                            {item.label}
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </nav>

                <button
                  type="button"
                  onClick={onSignOut}
                  disabled={isPending}
                  className="mt-4 w-full flex items-center gap-3 px-3 h-11 font-sans font-semibold uppercase text-[13px] tracking-label text-graphite hover:text-ink border-t border-line pt-4 disabled:opacity-50"
                >
                  <Icon name="logout" size={18} />
                  {isPending ? 'Signing out…' : 'Sign out'}
                </button>
              </div>
            </div>
          </aside>

          {/* Content */}
          <div className="min-w-0 max-w-3xl lg:max-w-none">
            {/* Mobile back bar — sub-pages only */}
            {!isIndex && (
              <div className="md:hidden sticky top-16 z-20 -mx-4 px-4 h-14 bg-paper border-b border-line flex items-center gap-3 mb-5">
                <Link to="/account" aria-label="Back to account" className="w-10 h-10 -ml-2 flex items-center justify-center text-ink">
                  <Icon name="arrowLeft" size={20} />
                </Link>
                <h1 className="font-display font-extrabold uppercase text-[15px] text-ink">
                  {pageTitle(location.pathname)}
                </h1>
              </div>
            )}

            {/* Tablet tab bar */}
            <nav
              className="hidden md:flex lg:hidden overflow-x-auto no-scrollbar border-b border-line mb-6"
              aria-label="Account sections"
            >
              {ACCOUNT_NAV.map((item) => {
                const active = isActive(item);
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    aria-current={active ? 'page' : undefined}
                    className={`shrink-0 px-4 h-12 inline-flex items-center font-sans font-semibold uppercase text-[12px] tracking-label border-b-2 transition-colors ${
                      active ? 'border-ink text-ink' : 'border-transparent text-graphite hover:text-ink'
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
}
