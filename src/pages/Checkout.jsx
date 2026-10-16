import { useEffect, useRef, useState } from 'react';
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
import { formatPrice } from '../data/products';
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

export default function Checkout() {
  const navigate = useNavigate();
  const { items, subtotal, discount, shipping, tax, total, clear, shippingMethod } = useCart();
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

  // Hide the mobile pay bar while the on-screen keyboard is open.
  useEffect(() => {
    const vv = window.visualViewport;
    if (!vv) return;
    const onResize = () => setKeyboardOpen(vv.height < window.innerHeight - 150);
    vv.addEventListener('resize', onResize);
    return () => vv.removeEventListener('resize', onResize);
  }, []);

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

  const handleSubmit = () => {
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

    submittedRef.current = true;
    setSubmitting(true);

    const order = {
      id: `AF-${Math.floor(100000 + Math.random() * 900000)}`,
      items,
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

    setTimeout(() => {
      clear();
      navigate('/checkout/success', { state: { order } });
    }, 1200);
  };

  const payLabel = `Pay ${formatPrice(total)}`;

  return (
    <CheckoutLayout progress={<CheckoutProgress current="payment" />}>
      <div className="lg:grid lg:grid-cols-[1fr_440px]">
        <div className="min-w-0">
          <SummaryToggle total={total}>
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
          total={total}
          onAction={handleSubmit}
          label={payLabel}
          loading={submitting}
        />
      )}
    </CheckoutLayout>
  );
}
