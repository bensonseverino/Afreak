import Badge from '../../components/ui/Badge';

// One saved address (spec §8.5).
export default function AddressCard({ address, onEdit, onRemove, onSetDefault }) {
  return (
    <article className="border border-line bg-paper p-4 md:p-5 flex flex-col">
      <header className="flex items-start justify-between gap-3">
        <div>
          {address.label && (
            <p className="font-sans font-bold uppercase text-[11px] tracking-label text-graphite">
              {address.label}
            </p>
          )}
          <p className="font-sans font-semibold text-[14px] text-ink mt-0.5">
            {address.firstName} {address.lastName}
          </p>
        </div>
        <div className="flex flex-col items-end gap-1.5">
          {address.isDefaultShipping && <Badge variant="default">DEFAULT SHIPPING</Badge>}
          {address.isDefaultBilling && <Badge variant="default">DEFAULT BILLING</Badge>}
        </div>
      </header>

      <address className="not-italic text-[13px] text-graphite leading-relaxed mt-3 flex-1">
        {address.line1}
        {address.line2 ? <><br />{address.line2}</> : null}
        <br />
        {address.city}
        {address.region ? `, ${address.region}` : ''} {address.postalCode}
        <br />
        {address.country}
        {address.phone ? <><br />{address.phone}</> : null}
      </address>

      <footer className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2">
        <button
          type="button"
          onClick={() => onEdit?.(address)}
          className="text-[12px] font-semibold uppercase tracking-label text-ink underline underline-offset-2"
        >
          Edit
        </button>
        <button
          type="button"
          onClick={() => onRemove?.(address)}
          className="text-[12px] font-semibold uppercase tracking-label text-graphite underline underline-offset-2 hover:text-danger"
        >
          Remove
        </button>
        {!address.isDefaultShipping && (
          <button
            type="button"
            onClick={() => onSetDefault?.(address)}
            className="text-[12px] font-semibold uppercase tracking-label text-ink underline underline-offset-2"
          >
            Set default
          </button>
        )}
      </footer>
    </article>
  );
}
