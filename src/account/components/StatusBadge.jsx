// Order/return status as a dot + label. Never colour-only: the label is always present.
const MAP = {
  pending: { label: 'PENDING', dot: 'bg-graphite' },
  paid: { label: 'PAID', dot: 'bg-ink' },
  in_production: { label: 'IN PRODUCTION', dot: 'bg-warn' },
  shipped: { label: 'SHIPPED', dot: 'bg-ink', filled: true },
  delivered: { label: 'DELIVERED', dot: 'bg-ok' },
  cancelled: { label: 'CANCELLED', dot: 'bg-danger' },
  refunded: { label: 'REFUNDED', dot: 'bg-graphite' },
  requested: { label: 'RETURN REQUESTED', dot: 'bg-warn' },
  approved: { label: 'RETURN APPROVED', dot: 'bg-ok' },
  rejected: { label: 'RETURN REJECTED', dot: 'bg-danger' },
  received: { label: 'RETURN RECEIVED', dot: 'bg-ok' },
};

export default function StatusBadge({ status, className = '' }) {
  const meta = MAP[status] || { label: String(status || '').toUpperCase(), dot: 'bg-graphite' };
  const base = 'inline-flex items-center gap-2 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-label rounded-none';
  const skin = meta.filled ? 'bg-ink text-paper' : 'border border-line text-ink';

  return (
    <span className={`${base} ${skin} ${className}`}>
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${meta.filled ? 'bg-volt' : meta.dot}`} aria-hidden="true" />
      {meta.label}
    </span>
  );
}
