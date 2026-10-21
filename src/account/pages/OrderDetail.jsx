import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Button from '../../components/ui/Button';
import Field from '../../components/ui/Field';
import Icon from '../../components/ui/Icon';
import Modal from '../../components/ui/Modal';
import QuantityStepper from '../../components/ui/QuantityStepper';
import Skeleton from '../../components/ui/Skeleton';
import EmptyState from '../components/EmptyState';
import StatusBadge from '../components/StatusBadge';
import OrderTracker from '../components/OrderTracker';
import OrderItemRow from '../components/OrderItemRow';
import { useOrder, useReorder, useRequestReturn } from '../../hooks/useOrders';
import { useCart } from '../../context/CartContext';
import { DELIVERY_METHODS } from '../../utils/shipping';
import Price from '../../components/ui/Price';
import { formatDate } from '../../utils/format';

const REASONS = ['Wrong size', 'Defective', 'Not as described', 'Changed mind', 'Other'];

function InfoBlock({ title, children }) {
  return (
    <div>
      <h3 className="font-sans font-bold uppercase text-[11px] tracking-label text-graphite mb-2">{title}</h3>
      <div className="text-[13px] text-ink leading-relaxed">{children}</div>
    </div>
  );
}

export default function OrderDetail() {
  const { number } = useParams();
  const { data: order, isLoading, error } = useOrder(number);
  const { addItem, openDrawer } = useCart();
  const reorder = useReorder();
  const requestReturn = useRequestReturn();

  const [copied, setCopied] = useState(false);
  const [returnOpen, setReturnOpen] = useState(false);
  const [returnQty, setReturnQty] = useState({});
  const [returnReason, setReturnReason] = useState(REASONS[0]);
  const [returnNote, setReturnNote] = useState('');
  const [notice, setNotice] = useState('');

  if (isLoading) {
    return (
      <div className="space-y-5">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-9 w-2/3" />
        <Skeleton className="h-28 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <EmptyState
        icon="box"
        title="Order not found"
        action={
          <Link
            to="/account/orders"
            className="inline-flex items-center justify-center h-12 px-6 bg-ink text-paper font-sans font-semibold uppercase tracking-label text-[12px] hover:bg-graphite"
          >
            Back to orders
          </Link>
        }
      >
        We couldn&apos;t find that order in your account.
      </EmptyState>
    );
  }

  const delivery = DELIVERY_METHODS.find((m) => m.id === order.deliveryMethod);
  const address = order.address || {};

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(order.trackingNumber);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard unavailable */
    }
  };

  const handleReorder = () => {
    reorder.mutate(order.number, {
      onSuccess: (result) => {
        (result.added || []).forEach((line) => addItem(line, { open: false }));
        openDrawer();
      },
      onError: () => setNotice('We could not reorder those items.'),
    });
  };

  const openReturn = () => {
    const initial = {};
    order.items.forEach((item) => {
      initial[item.id] = 0;
    });
    setReturnQty(initial);
    setReturnReason(REASONS[0]);
    setReturnNote('');
    setReturnOpen(true);
  };

  const submitReturn = () => {
    const items = Object.entries(returnQty)
      .filter(([, qty]) => qty > 0)
      .map(([orderItemId, qty]) => ({
        orderItemId: Number(orderItemId),
        qty,
        reason: returnReason,
      }));
    if (items.length === 0) {
      setNotice('Select at least one item to return.');
      return;
    }
    requestReturn.mutate(
      { number: order.number, items, reason: returnReason, note: returnNote },
      {
        onSuccess: () => {
          setReturnOpen(false);
          setNotice('Return requested — we will email you next steps.');
        },
        onError: (err) => setNotice(err?.message || 'We could not submit that request.'),
      }
    );
  };

  return (
    <div className="space-y-6">
      <Link to="/account/orders" className="inline-flex items-center gap-2 text-[12px] font-semibold uppercase tracking-label text-graphite hover:text-ink">
        <Icon name="arrowLeft" size={16} /> Orders
      </Link>

      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-display font-extrabold uppercase text-2xl md:text-3xl text-ink">
            Order {order.number}
          </h1>
          <p className="text-[13px] text-graphite mt-1">Placed {formatDate(order.createdAt)}</p>
        </div>
        <StatusBadge status={order.status} />
      </header>

      <section className="border border-line bg-paper p-4 md:p-6">
        <OrderTracker timeline={order.timeline} status={order.status} />

        {order.trackingNumber && (
          <div className="mt-6 pt-5 border-t border-line flex flex-wrap items-center gap-x-5 gap-y-2">
            <span className="text-[13px] text-ink">
              Tracking number: <span className="font-semibold">{order.trackingNumber}</span>
            </span>
            <button
              type="button"
              onClick={handleCopy}
              className="inline-flex items-center gap-1.5 text-[12px] font-semibold uppercase tracking-label text-ink underline"
            >
              <Icon name="copy" size={14} /> {copied ? 'Copied' : 'Copy'}
            </button>
            <a
              href="#"
              onClick={(e) => e.preventDefault()}
              className="inline-flex items-center gap-1.5 text-[12px] font-semibold uppercase tracking-label text-ink underline"
            >
              <Icon name="externalLink" size={14} /> Track package
            </a>
          </div>
        )}

        {order.returnRequest && (
          <p className="mt-5 text-[13px] text-graphite">
            Return <StatusBadge status={order.returnRequest.status} className="ml-1" />
          </p>
        )}
      </section>

      {/* Items */}
      <section className="border border-line bg-paper p-4 md:p-6">
        <h2 className="font-sans font-bold uppercase text-[12px] tracking-label text-ink mb-2">Items</h2>
        <ul>
          {order.items.map((item) => (
            <OrderItemRow key={item.id} item={item} />
          ))}
        </ul>
      </section>

      {/* Info + totals */}
      <div className="grid gap-4 md:grid-cols-2">
        <section className="border border-line bg-paper p-4 md:p-5 space-y-5">
          <InfoBlock title="Shipping address">
            {address.firstName} {address.lastName}
            <br />
            {address.line1}
            {address.line2 ? <><br />{address.line2}</> : null}
            <br />
            {address.city} {address.postalCode}
            <br />
            {address.country}
          </InfoBlock>
          <InfoBlock title="Billing address">
            {address.firstName} {address.lastName}
            <br />
            {address.city} {address.country}
          </InfoBlock>
        </section>

        <section className="border border-line bg-paper p-4 md:p-5 space-y-5">
          <InfoBlock title="Delivery method">
            {delivery ? `${delivery.label} · ${delivery.note}` : 'Standard'}
          </InfoBlock>
          <InfoBlock title="Payment">
            {order.paymentSummary || (order.paymentStatus === 'paid' ? 'Paid' : 'Unpaid')}
          </InfoBlock>

          <dl className="space-y-2.5 text-[13px] pt-1 border-t border-line">
            <div className="flex justify-between">
              <dt className="text-graphite">Subtotal</dt>
              <dd className="text-ink"><Price amount={order.totals.subtotalCents / 100} /></dd>
            </div>
            {order.totals.discountCents > 0 && (
              <div className="flex justify-between">
                <dt className="text-graphite">Discount {order.promoCode ? `(${order.promoCode})` : ''}</dt>
                <dd className="text-ink">-<Price amount={order.totals.discountCents / 100} /></dd>
              </div>
            )}
            <div className="flex justify-between">
              <dt className="text-graphite">Shipping</dt>
              <dd className="text-ink">
                {order.totals.shippingCents === 0 ? 'FREE' : <Price amount={order.totals.shippingCents / 100} />}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-graphite">Tax</dt>
              <dd className="text-ink">Included</dd>
            </div>
            <div className="flex items-end justify-between pt-3 border-t border-line">
              <dt className="font-sans font-bold uppercase text-[12px] tracking-label text-ink">Total</dt>
              <dd className="font-display font-extrabold text-[24px] leading-none text-ink">
                <Price amount={order.totals.totalCents / 100} />
              </dd>
            </div>
          </dl>
        </section>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row flex-wrap gap-3">
        {order.canReorder && (
          <Button variant="primary" onClick={handleReorder} disabled={reorder.isPending} className="flex-1 sm:flex-none h-12 px-6 text-[12px]">
            {reorder.isPending ? 'Adding…' : 'Reorder'}
          </Button>
        )}
        <Link
          to={`/account/orders/${order.number}/invoice`}
          className="inline-flex items-center justify-center h-12 px-6 border border-ink text-ink font-sans font-semibold uppercase tracking-label text-[12px] hover:bg-ink hover:text-paper transition-colors flex-1 sm:flex-none"
        >
          Download invoice
        </Link>
        <Link
          to={`/contact?order=${order.number}`}
          className="inline-flex items-center justify-center h-12 px-6 border border-line text-ink font-sans font-semibold uppercase tracking-label text-[12px] hover:border-ink transition-colors flex-1 sm:flex-none"
        >
          Need help?
        </Link>
        {order.canReturn && (
          <Button variant="outline" onClick={openReturn} className="flex-1 sm:flex-none h-12 px-6 text-[12px]">
            Request return
          </Button>
        )}
      </div>

      <div aria-live="polite">
        {notice && <p className="text-[13px] text-ink border border-line bg-mist p-3">{notice}</p>}
      </div>

      {/* Return request modal */}
      <Modal
        open={returnOpen}
        onClose={() => setReturnOpen(false)}
        title="Request a return"
        size="md"
        footer={
          <div className="p-5">
            <Button variant="primary" onClick={submitReturn} disabled={requestReturn.isPending} className="w-full h-12 text-[12px]">
              {requestReturn.isPending ? 'Submitting…' : 'Submit request'}
            </Button>
          </div>
        }
      >
        <p className="text-[13px] text-graphite">
          Select the items you want to return. Returns are accepted within 14 days of delivery.
        </p>

        <ul className="mt-4 border-t border-line">
          {order.items.map((item) => (
            <li key={item.id} className="flex items-center gap-3 py-3 border-b border-line">
              <div className="flex-1 min-w-0">
                <p className="font-sans font-semibold text-[13px] text-ink uppercase">{item.name}</p>
                <p className="text-[12px] text-graphite">
                  {[item.color, item.size].filter(Boolean).join(' / ')} · Qty {item.qty}
                </p>
              </div>
              <QuantityStepper
                size="sm"
                min={0}
                max={item.qty}
                value={returnQty[item.id] || 0}
                onChange={(q) => setReturnQty((prev) => ({ ...prev, [item.id]: q }))}
              />
            </li>
          ))}
        </ul>

        <Field
          as="select"
          id="return-reason"
          label="Reason"
          className="mt-4"
          value={returnReason}
          onChange={(e) => setReturnReason(e.target.value)}
        >
          {REASONS.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </Field>

        <Field
          as="textarea"
          id="return-note"
          label="Note (optional)"
          rows={3}
          className="mt-4"
          value={returnNote}
          onChange={(e) => setReturnNote(e.target.value)}
        />
      </Modal>
    </div>
  );
}
