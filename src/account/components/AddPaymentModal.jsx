import { useState } from 'react';
import Modal from '../../components/ui/Modal';
import Field from '../../components/ui/Field';
import Button from '../../components/ui/Button';
import { Checkbox } from '../../components/checkout/ContactSection';
import { required } from '../../utils/validators';

const BRANDS = ['Visa', 'Mastercard', 'Amex'];
const YEARS = Array.from({ length: 10 }, (_, i) => new Date().getFullYear() + i);

/**
 * Demo-mode add payment method (spec §8.4).
 * Collects only brand + last 4 + expiry — never a full PAN or CVC.
 * TODO: mount the provider's secure card element (Stripe Elements) in live mode.
 */
export default function AddPaymentModal({ open, onClose, onSubmit, loading = false }) {
  const [brand, setBrand] = useState('Visa');
  const [last4, setLast4] = useState('');
  const [expMonth, setExpMonth] = useState('');
  const [expYear, setExpYear] = useState(String(new Date().getFullYear() + 3));
  const [billingName, setBillingName] = useState('');
  const [isDefault, setIsDefault] = useState(false);
  const [errors, setErrors] = useState({});

  const reset = () => {
    setBrand('Visa');
    setLast4('');
    setExpMonth('');
    setExpYear(String(new Date().getFullYear() + 3));
    setBillingName('');
    setIsDefault(false);
    setErrors({});
  };

  const handleClose = () => {
    reset();
    onClose?.();
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const e = {};
    if (!/^\d{4}$/.test(last4)) e.last4 = 'Enter the last 4 digits.';
    if (!required(expMonth)) e.expMonth = 'Select a month.';
    if (!required(billingName)) e.billingName = 'Enter the name on the card.';
    setErrors(e);
    if (Object.keys(e).length > 0) return;

    onSubmit({
      brand,
      last4,
      expMonth: Number(expMonth),
      expYear: Number(expYear),
      billingName: billingName.trim(),
      isDefault,
    });
    reset();
  };

  return (
    <Modal open={open} onClose={handleClose} title="Add payment method" size="md">
      <div className="border border-line bg-mist p-3 mb-5 flex items-start gap-3">
        <span className="font-sans font-bold uppercase text-[10px] tracking-label text-ink shrink-0 mt-0.5">
          DEMO MODE
        </span>
        <p className="text-[12px] text-graphite">
          No real card data is collected or stored. Only the brand, last 4 digits and expiry are kept —
          exactly what the live provider would return.
        </p>
      </div>

      <form onSubmit={handleSubmit} noValidate>
        <Field
          as="select"
          id="pm-brand"
          label="Card brand"
          value={brand}
          onChange={(e) => setBrand(e.target.value)}
        >
          {BRANDS.map((b) => (
            <option key={b} value={b}>
              {b}
            </option>
          ))}
        </Field>

        <Field
          className="mt-4"
          id="pm-last4"
          label="Last 4 digits"
          inputMode="numeric"
          autoComplete="off"
          placeholder="4242"
          required
          value={last4}
          onChange={(e) => setLast4(e.target.value.replace(/\D/g, '').slice(0, 4))}
          error={errors.last4}
        />

        <div className="mt-4 grid grid-cols-2 gap-4">
          <Field
            as="select"
            id="pm-month"
            label="Expiry month"
            required
            value={expMonth}
            onChange={(e) => setExpMonth(e.target.value)}
            error={errors.expMonth}
          >
            <option value="">MM</option>
            {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
              <option key={m} value={m}>
                {String(m).padStart(2, '0')}
              </option>
            ))}
          </Field>
          <Field as="select" id="pm-year" label="Expiry year" value={expYear} onChange={(e) => setExpYear(e.target.value)}>
            {YEARS.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </Field>
        </div>

        <Field
          className="mt-4"
          id="pm-name"
          label="Name on card"
          autoComplete="cc-name"
          required
          value={billingName}
          onChange={(e) => setBillingName(e.target.value)}
          error={errors.billingName}
        />

        <Checkbox id="pm-default" checked={isDefault} onChange={(e) => setIsDefault(e.target.checked)} className="mt-5">
          Set as default payment method
        </Checkbox>

        <Button variant="primary" type="submit" disabled={loading} className="w-full h-12 mt-6 text-[12px]">
          {loading ? 'Saving…' : 'Save card'}
        </Button>
      </form>
    </Modal>
  );
}
