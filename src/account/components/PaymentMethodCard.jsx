import Badge from '../../components/ui/Badge';

const pad = (n) => String(n).padStart(2, '0');

export default function PaymentMethodCard({ method, onSetDefault, onRemove }) {
  const expiry = `${pad(method.expMonth)}/${String(method.expYear).slice(-2)}`;

  return (
    <article className="border border-line bg-paper p-4 flex items-center gap-4">
      <span
        className="w-12 h-8 bg-card flex items-center justify-center font-sans font-bold uppercase text-[10px] tracking-label text-ink shrink-0"
        aria-hidden="true"
      >
        {method.brand?.slice(0, 4) || 'CARD'}
      </span>

      <div className="flex-1 min-w-0">
        <p className="font-sans font-semibold text-[14px] text-ink">
          {method.brand} •••• {method.last4}
        </p>
        <p className="text-[12px] text-graphite mt-0.5">
          Expires {expiry}
          {method.billingName ? ` · ${method.billingName}` : ''}
        </p>
        {method.expired && <p className="text-[12px] text-danger mt-1">Expired — remove or replace</p>}
        {!method.expired && method.expiringSoon && (
          <p className="text-[12px] text-warn mt-1">Expiring soon</p>
        )}
      </div>

      <div className="flex flex-col items-end gap-2 shrink-0">
        {method.isDefault ? (
          <Badge variant="default">DEFAULT</Badge>
        ) : (
          <button
            type="button"
            onClick={() => onSetDefault?.(method)}
            className="text-[12px] font-semibold uppercase tracking-label text-ink underline underline-offset-2"
          >
            Set as default
          </button>
        )}
        <button
          type="button"
          onClick={() => onRemove?.(method)}
          className="text-[12px] font-semibold uppercase tracking-label text-graphite underline underline-offset-2 hover:text-danger"
        >
          Remove
        </button>
      </div>
    </article>
  );
}
