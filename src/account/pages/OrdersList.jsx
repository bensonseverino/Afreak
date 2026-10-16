import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import Button from '../../components/ui/Button';
import Icon from '../../components/ui/Icon';
import Skeleton from '../../components/ui/Skeleton';
import Pagination from '../../components/ui/Pagination';
import Toast from '../../components/ui/Toast';
import OrderCard from '../components/OrderCard';
import EmptyState from '../components/EmptyState';
import { useReorder, useOrders } from '../../hooks/useOrders';
import { useCart } from '../../context/CartContext';

const TABS = [
  { id: 'all', label: 'All' },
  { id: 'active', label: 'In progress' },
  { id: 'delivered', label: 'Delivered' },
  { id: 'cancelled', label: 'Cancelled' },
];

const LIMIT = 6;

export default function OrdersList() {
  const [params, setParams] = useSearchParams();
  const { addItem, openDrawer } = useCart();
  const reorder = useReorder();

  const status = params.get('status') || 'all';
  const q = params.get('q') || '';
  const page = Math.max(1, Number(params.get('page')) || 1);

  const [searchInput, setSearchInput] = useState(q);
  const [orders, setOrders] = useState([]);
  const [toast, setToast] = useState(null);
  const timerRef = useRef(null);

  const { data, isLoading, isFetching } = useOrders({ status, q, page, limit: LIMIT });

  useEffect(() => () => clearTimeout(timerRef.current), []);

  // Reset accumulated pages when the filters change.
  useEffect(() => {
    setOrders([]);
  }, [status, q]);

  useEffect(() => {
    if (!data) return;
    setOrders((prev) => (page === 1 ? data.data : [...prev, ...data.data]));
  }, [data, page]);

  // Debounce the search box into the URL (300ms, spec §8.2).
  useEffect(() => {
    const t = setTimeout(() => {
      if (searchInput === q) return;
      setParams((prev) => {
        const next = new URLSearchParams(prev);
        if (searchInput) next.set('q', searchInput);
        else next.delete('q');
        next.delete('page');
        return next;
      });
    }, 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchInput]);

  useEffect(() => {
    setSearchInput(q);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  const setTab = (id) =>
    setParams((prev) => {
      const next = new URLSearchParams(prev);
      if (id === 'all') next.delete('status');
      else next.set('status', id);
      next.delete('page');
      return next;
    });

  const loadMore = () =>
    setParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set('page', String(page + 1));
      return next;
    });

  const meta = data?.meta || { total: 0, page: 1, pages: 1 };
  const totalPages = meta.pages || 1;

  const queryString = useMemo(
    () => new URLSearchParams({ ...(status !== 'all' ? { status } : {}), ...(q ? { q } : {}) }).toString(),
    [status, q]
  );

  const handleReorder = (order) => {
    reorder.mutate(order.number, {
      onSuccess: (result) => {
        (result.added || []).forEach((line) => addItem(line, { open: false }));
        const unavailable = result.unavailable || [];
        setToast({
          message: unavailable.length
            ? `${result.added.length} item(s) added · ${unavailable.length} unavailable`
            : `${result.added.length} item(s) added to your bag`,
        });
        clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => setToast(null), 6000);
      },
      onError: () => {
        setToast({ message: 'We could not reorder those items.' });
        clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => setToast(null), 6000);
      },
    });
  };

  const showSkeleton = isLoading && orders.length === 0;

  return (
    <div>
      <h1 className="font-display font-extrabold uppercase text-2xl md:text-3xl text-ink">Orders</h1>

      {/* Filters */}
      <div className="mt-5 border-b border-line">
        <div className="flex overflow-x-auto no-scrollbar -mb-px" role="tablist" aria-label="Order status">
          {TABS.map((tab) => {
            const active = status === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setTab(tab.id)}
                className={`shrink-0 px-4 h-11 font-sans font-semibold uppercase text-[12px] tracking-label border-b-2 transition-colors ${
                  active ? 'border-ink text-ink' : 'border-transparent text-graphite hover:text-ink'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-5 relative">
        <Icon
          name="search"
          size={18}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-graphite pointer-events-none"
        />
        <input
          type="search"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="Search order number"
          aria-label="Search order number"
          className="w-full min-h-[48px] pl-10 pr-4 bg-paper border border-line text-base text-ink outline-none placeholder:text-stone focus:border-ink focus:ring-2 focus:ring-ink"
        />
      </div>

      <div className="mt-6">
        {showSkeleton ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-44 w-full" />
            ))}
          </div>
        ) : orders.length === 0 ? (
          <EmptyState
            icon="box"
            title={q ? 'No matching orders' : 'No orders yet'}
            action={
              q ? (
                <Button variant="outline" onClick={() => setSearchInput('')} className="h-12 px-6 text-[12px]">
                  Clear search
                </Button>
              ) : (
                <Link
                  to="/shop"
                  className="inline-flex items-center justify-center h-12 px-6 bg-ink text-paper font-sans font-semibold uppercase tracking-label text-[12px] hover:bg-graphite"
                >
                  Start shopping
                </Link>
              )
            }
          >
            {q
              ? 'Try a different order number.'
              : 'When you place an order it will show up here with live tracking.'}
          </EmptyState>
        ) : (
          <>
            <div className="space-y-4">
              {orders.map((order) => (
                <OrderCard
                  key={order.number}
                  order={order}
                  onReorder={handleReorder}
                  reordering={reorder.isPending && reorder.variables === order.number}
                />
              ))}
            </div>

            {/* Mobile: LOAD MORE */}
            <div className="md:hidden mt-6">
              {page < totalPages ? (
                <Button
                  variant="outline"
                  onClick={loadMore}
                  disabled={isFetching}
                  className="w-full h-12 text-[12px]"
                >
                  {isFetching ? 'Loading…' : 'Load more'}
                </Button>
              ) : (
                <p className="text-center text-[12px] text-graphite">{meta.total} orders</p>
              )}
            </div>

            {/* Desktop: shared pagination */}
            <div className="hidden md:block mt-8">
              <Pagination
                currentPage={page}
                totalPages={totalPages}
                baseUrl="/account/orders"
                query={queryString}
              />
            </div>
          </>
        )}
      </div>

      <Toast
        open={Boolean(toast)}
        message={toast?.message || ''}
        actionLabel={toast && /added/.test(toast.message) ? 'View bag' : undefined}
        onAction={openDrawer}
        onClose={() => setToast(null)}
      />
    </div>
  );
}
