import { Link, useParams } from 'react-router-dom';
import Button from '../../components/ui/Button';
import Icon from '../../components/ui/Icon';
import Skeleton from '../../components/ui/Skeleton';
import EmptyState from '../components/EmptyState';
import { useOrder } from '../../hooks/useOrders';
import useNoIndex from '../../hooks/useNoIndex';
import { formatCents, formatDate } from '../../utils/format';

// Print-friendly invoice (spec §8.3). The toolbar is hidden when printing.
export default function Invoice() {
  const { number } = useParams();
  const { data: order, isLoading, error } = useOrder(number);

  useNoIndex();

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-12">
        <Skeleton className="h-8 w-48 mb-6" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-12">
        <EmptyState
          icon="box"
          title="Invoice unavailable"
          action={
            <Link to="/account/orders" className="text-[13px] text-ink underline">
              Back to orders
            </Link>
          }
        >
          We couldn&apos;t find that order.
        </EmptyState>
      </div>
    );
  }

  const address = order.address || {};

  return (
    <div className="min-h-[100dvh] bg-paper">
      <div className="no-print border-b border-line">
        <div className="max-w-3xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to={`/account/orders/${order.number}`} className="inline-flex items-center gap-2 text-[12px] font-semibold uppercase tracking-label text-graphite hover:text-ink">
            <Icon name="arrowLeft" size={16} /> Back to order
          </Link>
          <Button variant="primary" onClick={() => window.print()} className="h-10 px-5 text-[11px]">
            Print invoice
          </Button>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-10">
        <header className="flex items-start justify-between">
          <div>
            <p className="font-display font-extrabold uppercase text-2xl tracking-tight text-ink">AFREAK</p>
            <p className="text-[12px] text-graphite mt-1">hello@afreak.com · afreak.com</p>
          </div>
          <div className="text-right">
            <p className="font-sans font-bold uppercase text-[12px] tracking-label text-graphite">Invoice</p>
            <p className="font-display font-extrabold text-[18px] text-ink">{order.number}</p>
            <p className="text-[12px] text-graphite">{formatDate(order.createdAt)}</p>
          </div>
        </header>

        <div className="mt-10 grid grid-cols-2 gap-8">
          <div>
            <p className="font-sans font-bold uppercase text-[11px] tracking-label text-graphite mb-2">Billed to</p>
            <p className="text-[13px] text-ink leading-relaxed">
              {address.firstName} {address.lastName}
              <br />
              {address.line1}
              {address.line2 ? <><br />{address.line2}</> : null}
              <br />
              {address.city} {address.postalCode}
              <br />
              {address.country}
            </p>
          </div>
          <div>
            <p className="font-sans font-bold uppercase text-[11px] tracking-label text-graphite mb-2">Payment</p>
            <p className="text-[13px] text-ink">{order.paymentSummary || 'Card'}</p>
            <p className="text-[13px] text-graphite mt-1 uppercase">{order.paymentStatus}</p>
          </div>
        </div>

        <table className="mt-10 w-full text-left">
          <thead>
            <tr className="border-b border-ink">
              <th className="py-2 font-sans font-bold uppercase text-[11px] tracking-label text-ink">Item</th>
              <th className="py-2 font-sans font-bold uppercase text-[11px] tracking-label text-ink text-center">Qty</th>
              <th className="py-2 font-sans font-bold uppercase text-[11px] tracking-label text-ink text-right">Price</th>
              <th className="py-2 font-sans font-bold uppercase text-[11px] tracking-label text-ink text-right">Amount</th>
            </tr>
          </thead>
          <tbody>
            {order.items.map((item) => (
              <tr key={item.id} className="border-b border-line align-top">
                <td className="py-3 text-[13px] text-ink">
                  {item.name}
                  <span className="block text-[12px] text-graphite">
                    {[item.color, item.size].filter(Boolean).join(' / ')}
                    {item.print ? ' · Custom print' : ''}
                  </span>
                </td>
                <td className="py-3 text-[13px] text-ink text-center">{item.qty}</td>
                <td className="py-3 text-[13px] text-ink text-right">{formatCents(item.unitPriceCents)}</td>
                <td className="py-3 text-[13px] text-ink text-right">
                  {formatCents(item.unitPriceCents * item.qty)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <dl className="mt-6 ml-auto w-full max-w-xs space-y-2.5 text-[13px]">
          <div className="flex justify-between">
            <dt className="text-graphite">Subtotal</dt>
            <dd className="text-ink">{formatCents(order.totals.subtotalCents)}</dd>
          </div>
          {order.totals.discountCents > 0 && (
            <div className="flex justify-between">
              <dt className="text-graphite">Discount {order.promoCode ? `(${order.promoCode})` : ''}</dt>
              <dd className="text-ink">-{formatCents(order.totals.discountCents)}</dd>
            </div>
          )}
          <div className="flex justify-between">
            <dt className="text-graphite">Shipping</dt>
            <dd className="text-ink">
              {order.totals.shippingCents === 0 ? 'FREE' : formatCents(order.totals.shippingCents)}
            </dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-graphite">Tax</dt>
            <dd className="text-ink">Included</dd>
          </div>
          <div className="flex items-end justify-between pt-3 border-t border-ink">
            <dt className="font-sans font-bold uppercase text-[12px] tracking-label text-ink">Total</dt>
            <dd className="font-display font-extrabold text-[22px] text-ink">
              {formatCents(order.totals.totalCents)}
            </dd>
          </div>
        </dl>

        <p className="mt-12 text-[12px] text-graphite">
          Thank you for shopping with AFREAK. Questions about this invoice? Email hello@afreak.com.
        </p>
      </div>
    </div>
  );
}
