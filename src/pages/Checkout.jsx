import { useEffect, useMemo, useRef, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import CheckoutLayout from '../components/checkout/CheckoutLayout';
import CheckoutProgress from '../components/checkout/CheckoutProgress';
import ContactSection from '../components/checkout/ContactSection';
import DeliverySection from '../components/checkout/DeliverySection';
import PaymentSection from '../components/checkout/PaymentSection';
import SummaryToggle from '../components/checkout/SummaryToggle';
import OrderSummary from '../components/cart/OrderSummary';
import StickyCheckoutBar from '../components/cart/StickyCheckoutBar';
import Button from '../components/ui/Button';
import Icon from '../components/ui/Icon';
import { useCart } from '../context/CartContext';
import { api } from '../lib/api';
import { resolveVariantId } from '../lib/catalog';
import { TRACK_TYPES, track } from '../lib/analytics';
import useCurrency from '../hooks/useCurrency';
import useCartDisplayTotals from '../hooks/useCartDisplayTotals';
import { convertBetween, formatMoney } from '../lib/currency';
import { isCardNumber, isCvc, isEmail, isExpiry, isPhone, isPostal, required } from '../utils/validators';

const INITIAL = {
  email: '',
  marketingOptIn: true,
  country: '',
  firstName: '',
  lastName: '',
  address1: '',
  address2: '',
  city: '',
  postalCode: '',
  phone: '',
  paymentMethod: 'card',
  cardNumber: '',
  cardName: '',
  cardExpiry: '',
  cardCvc: '',
  billingSame: true,
};

const FIELD_ORDER = [
  'email',
  'country',
  'firstName',
  'lastName',
  'address1',
  'city',
  'postalCode',
  'phone',
  'cardNumber',
  'cardName',
  'cardExpiry',
  'cardCvc',
];

function validate(form) {
  const e = {};
  if (!isEmail(form.email)) e.email = 'Enter a valid email address.';
  if (!required(form.country)) e.country = 'Select a country.';
  if (!required(form.firstName)) e.firstName = 'Enter your first name.';
  if (!required(form.lastName)) e.lastName = 'Enter your last name.';
  if (!required(form.address1)) e.address1 = 'Enter your address.';
  if (!required(form.city)) e.city = 'Enter your city.';
  if (!isPostal(form.postalCode)) e.postalCode = 'Enter your postal code.';
  if (!isPhone(form.phone)) e.phone = 'Enter a valid phone number.';
  if (form.paymentMethod === 'card') {
    if (!isCardNumber(form.cardNumber)) e.cardNumber = 'Enter a valid card number.';
    if (!required(form.cardName)) e.cardName = 'Enter the name on the card.';
    if (!isExpiry(form.cardExpiry)) e.cardExpiry = 'Use the MM / YY format.';
    if (!isCvc(form.cardCvc)) e.cardCvc = 'Enter the 3–4 digit CVC.';
  }
  return e;
}

/** The API address has line1/line2 only, so the name rides on line1. */
function toApiAddress(form) {
  return {
    line1: `${form.firstName} ${form.lastName}`.trim(),
    line2: [form.address1, form.address2].filter(Boolean).join(', ') || undefined,
    city: form.city,
    postalCode: form.postalCode,
    country: form.country,
  };
}

function linePrint(line) {
  return line.print?.enabled
    ? { placement: line.print.placement ?? null, artworkKey: line.print.artworkKey ?? null }
    : null;
}

export default function Checkout() {
  const navigate = useNavigate();
  const {
    items,
    subtotal,
    discount,
    shipping,
    tax,
    total,
    clear,
    promoCode,
    shippingMethod,
    setServerTotals,
  } = useCart();
  const { displayTotal } = useCartDisplayTotals();
  const { formatValue, currency, chargeCurrency, rates, baseCurrency } = useCurrency();

  const [form, setForm] = useState(() => {
    try {
      const raw = sessionStorage.getItem('afreak.checkout.form');
      return raw ? { ...INITIAL, ...JSON.parse(raw) } : INITIAL;
    } catch {
      return INITIAL;
    }
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [quote, setQuote] = useState(null);
  const [keyboardOpen, setKeyboardOpen] = useState(false);
  const submittedRef = useRef(false);

  // Persist non-card fields so going back keeps the form (never store card data).
  useEffect(() => {
    try {
      const { cardNumber, cardName, cardExpiry, cardCvc, ...safe } = form;
      sessionStorage.setItem('afreak.checkout.form', JSON.stringify(safe));
    } catch {
      /* ignore */
    }
  }, [form]);

  // Funnel counter for the CMS dashboard (fire-and-forget).
  useEffect(() => {
    track(TRACK_TYPES.checkoutStart);
  }, []);

  // Hide the mobile pay bar while the on-screen keyboard is open.
  useEffect(() => {
    const vv = window.visualViewport;
    if (!vv) return;
    const onResize = () => setKeyboardOpen(vv.height < window.innerHeight - 150);
    vv.addEventListener('resize', onResize);
    return () => vv.removeEventListener('resize', onResize);
  }, []);

  // Server-authoritative totals — also surfaces out-of-stock lines.
  useEffect(() => {
    if (items.length === 0) return undefined;
    let cancelled = false;

    (async () => {
      try {
        const resolved = await Promise.all(
          items.map(async (line) => ({
            variantId: await resolveVariantId(line),
            qty: line.qty,
            print: linePrint(line),
          }))
        );
        const usable = resolved.filter((r) => r.variantId);
        if (!usable.length) return;

        const res = await api('/checkout/quote', {
          method: 'POST',
          body: { items: usable, deliveryMethod: shippingMethod, promoCode: promoCode || null },
        });
        if (cancelled) return;
        const data = res.data;
        setQuote(data);

        // Lines are priced in the EUR base the catalog uses, but
        // `shippingCents` comes from `settings.shipping`, which is stored in
        // the store currency (`data.currency`). Convert the shipping side
        // before adding it, otherwise a KSh 500 delivery is added to a EUR
        // subtotal as €500. Without rates we keep the local estimate.
        const quoteCurrency = data.currency || baseCurrency;
        if (quoteCurrency !== baseCurrency && !rates) return;

        const subtotalBase = data.subtotalCents / 100;
        const discountBase = data.discountCents / 100;
        const shippingBase =
          convertBetween(data.shippingCents, rates, quoteCurrency, baseCurrency) / 100;
        setServerTotals({
          subtotal: subtotalBase,
          discount: discountBase,
          shipping: shippingBase,
          tax: 0,
          total: subtotalBase - discountBase + shippingBase,
        });
      } catch {
        /* keep the local estimate if the quote call fails */
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [items, shippingMethod, promoCode, setServerTotals, rates, baseCurrency]);

  // Drop the server totals when leaving checkout.
  useEffect(() => () => setServerTotals(null), [setServerTotals]);

  const stockIssues = useMemo(
    () => (quote?.issues ?? []).filter((i) => i.code === 'OUT_OF_STOCK' || i.code === 'UNAVAILABLE'),
    [quote]
  );

  if (items.length === 0 && !submittedRef.current) {
    return <Navigate to="/cart" replace />;
  }

  const handleChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => (prev[key] ? { ...prev, [key]: undefined } : prev));
  };

  const blurValidate = (key) => {
    const errs = validate(form);
    setErrors((prev) => ({ ...prev, [key]: errs[key] }));
  };

  const handleSubmit = async () => {
    if (submitting || submittedRef.current) return;

    const errs = validate(form);
    setErrors(errs);
    const firstKey = FIELD_ORDER.find((k) => errs[k]);
    if (firstKey) {
      const el = document.getElementById(firstKey);
      el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      el?.focus({ preventScroll: true });
      return;
    }

    setSubmitError('');
    submittedRef.current = true;
    setSubmitting(true);

    try {
      const resolved = await Promise.all(
        items.map(async (line) => ({ ...line, variantId: await resolveVariantId(line) }))
      );
      if (resolved.some((l) => !l.variantId)) {
        throw new Error('Some items are no longer available. Please remove them and try again.');
      }

      const res = await api('/orders', {
        method: 'POST',
        headers: { 'X-Idempotency-Key': crypto.randomUUID() },
        body: {
          email: form.email,
          phone: form.phone || undefined,
          address: toApiAddress(form),
          items: resolved.map((l) => ({
            variantId: l.variantId,
            qty: l.qty,
            print: linePrint(l),
          })),
          deliveryMethod: shippingMethod,
          promoCode: promoCode || null,
          marketingOptIn: form.marketingOptIn,
        },
      });

      const order = {
        id: res.data.number,
        items: resolved,
        totals: { subtotal, discount, shipping, tax, total },
        email: form.email,
        address: {
          firstName: form.firstName,
          lastName: form.lastName,
          address1: form.address1,
          address2: form.address2,
          city: form.city,
          postalCode: form.postalCode,
          country: form.country,
          phone: form.phone,
        },
        deliveryMethod: shippingMethod,
        createdAt: new Date().toISOString(),
      };

      clear();
      setServerTotals(null);
      navigate('/checkout/success', { state: { order } });
    } catch (err) {
      submittedRef.current = false;
      setSubmitting(false);
      setSubmitError(err?.message || 'Payment failed. Please try again.');
    }
  };

  const payLabel = `Pay ${formatValue(displayTotal)}`;

  return (
    <CheckoutLayout progress={<CheckoutProgress current="payment" />}>
      <div className="lg:grid lg:grid-cols-[1fr_440px]">
        <div className="min-w-0">
          <SummaryToggle amount={displayTotal}>
            <OrderSummary variant="checkout" />
          </SummaryToggle>

          <div
            className="max-w-[640px] mx-auto lg:ml-auto lg:mr-0 px-4 md:px-6 lg:px-10 pt-2 pb-40 lg:pb-16"
            onBlurCapture={(e) => {
              const id = e.target.id;
              if (FIELD_ORDER.includes(id)) blurValidate(id);
            }}
          >
            <ContactSection form={form} errors={errors} onChange={handleChange} />
            <DeliverySection form={form} errors={errors} onChange={handleChange} />
            <PaymentSection form={form} errors={errors} onChange={handleChange} />

            {(stockIssues.length > 0 || submitError) && (
              <div className="mt-4 border border-danger/40 bg-danger/5 px-4 py-3" role="alert">
                {stockIssues.map((issue) => (
                  <p key={`${issue.lineId}-${issue.code}`} className="text-[13px] text-danger">
                    {issue.message}
                  </p>
                ))}
                {submitError && <p className="text-[13px] text-danger">{submitError}</p>}
              </div>
            )}

            <Button
              variant="primary"
              onClick={handleSubmit}
              disabled={submitting}
              className="hidden lg:flex w-full h-14 mt-2 text-[12px]"
            >
              {submitting ? (
                <span className="inline-flex items-center gap-2">
                  <Icon name="spinner" size={16} className="animate-spin" /> Processing…
                </span>
              ) : (
                payLabel
              )}
            </Button>

            {currency !== chargeCurrency && (
              <p className="mt-3 text-center text-[12px] leading-relaxed text-graphite lg:hidden">
                You will be charged {formatMoney(total, chargeCurrency)}. Your bank may apply its
                own exchange rate.
              </p>
            )}
          </div>
        </div>

        <aside className="hidden lg:block border-l border-line bg-mist sticky top-0 h-screen overflow-auto">
          <div className="px-10 pt-28 pb-10">
            <OrderSummary variant="checkout" />
          </div>
        </aside>
      </div>

      {!keyboardOpen && (
        <StickyCheckoutBar
          className="lg:hidden"
          amount={displayTotal}
          onAction={handleSubmit}
          label={payLabel}
          loading={submitting}
        />
      )}
    </CheckoutLayout>
  );
}
