import { Link } from 'react-router-dom';
import Placeholder from '../../components/ui/Placeholder';
import Icon from '../../components/ui/Icon';
import StatusBadge from './StatusBadge';
import { formatCents, formatDate } from '../../utils/format';

// Order card for the orders list (spec §8.2).
export default function OrderCard({ order, onReorder, reordering = false }) {
  const extra = Math.max(0, order.itemCount - order.thumbs.length);
  const names = order.names || [];

  return (
    <article className="border border-line bg-paper">
      <header className="flex items-start justify-between gap-3 p-4 border-b border-line">
        <div className="min-w-0">
          <h3 className="font-display font-bold uppercase text-[15px] text-ink">Order {order.number}</h3>
          <p className="text-[12px] text-graphite mt-0.5">{formatDate(order.createdAt)}</p>
        </div>
        <StatusBadge status={order.status} />
      </header>

      <div className="p-4">
        <div className="flex gap-3">
          {order.thumbs.map((thumb, index) => (
            <div key={index} className="w-14 h-[70px] shrink-0">
              <Placeholder ratio="h-full" label="" src={thumb} alt="" className="w-full h-full" />
            </div>
          ))}
          {extra > 0 && (
            <div className="w-14 h-[70px] shrink-0 bg-card flex items-center justify-center text-[12px] font-semibold text-graphite">
              +{extra}
            </div>
          )}

          <div className="flex-1 min-w-0 pl-1">
            {names.length > 0 && (
              <p className="text-[13px] text-graphite line-clamp-2">{names.join(', ')}</p>
            )}
            <p className="font-display font-bold text-[18px] text-ink mt-1.5">
              {formatCents(order.totalCents)}
            </p>
          </div>
        </div>
      </div>

      <footer className="flex flex-wrap items-center gap-x-5 gap-y-2 px-4 pb-4">
        <Link
          to={`/account/orders/${order.number}`}
          className="inline-flex items-center justify-center h-10 px-4 border border-ink text-ink font-sans font-semibold uppercase text-[11px] tracking-label hover:bg-ink hover:text-paper transition-colors"
        >
          View details
        </Link>
        {order.trackingNumber && (
          <a
            href="#"
            onClick={(e) => e.preventDefault()}
            className="inline-flex items-center gap-1.5 text-[12px] font-semibold uppercase tracking-label text-ink"
          >
            <Icon name="truck" size={16} /> Track
          </a>
        )}
        <button
          type="button"
          onClick={() => onReorder?.(order)}
          disabled={reordering}
          className="text-[12px] font-semibold uppercase tracking-label text-ink underline underline-offset-2 disabled:opacity-50"
        >
          {reordering ? 'Adding…' : 'Reorder'}
        </button>
      </footer>
    </article>
  );
}
