import Field from '../ui/Field';
import RadioCard from '../ui/RadioCard';
import Icon from '../ui/Icon';
import { formatCardNumber, formatExpiry } from '../../utils/validators';
import { Checkbox } from './ContactSection';

// TODO: replace with Stripe Elements / payment provider. Never store card data.
export default function PaymentSection({ form, errors, onChange }) {
  const isCard = form.paymentMethod === 'card';

  return (
    <section className="py-8">
      <h2 className="font-display font-extrabold uppercase text-[18px] text-ink mb-2">Payment</h2>
      <p className="text-[12px] text-graphite mb-5">All transactions are secure and encrypted.</p>

      <div className="space-y-2 mb-5">
        <RadioCard
          name="paymentMethod"
          value="card"
          checked={isCard}
          onChange={() => onChange('paymentMethod', 'card')}
          title="Card"
          note="Visa, Mastercard, American Express"
        />
        <RadioCard
          name="paymentMethod"
          value="paypal"
          checked={form.paymentMethod === 'paypal'}
          onChange={() => onChange('paymentMethod', 'paypal')}
          title="PayPal"
          note="You'll be redirected — placeholder"
        />
        <RadioCard
          name="paymentMethod"
          value="wallet"
          checked={form.paymentMethod === 'wallet'}
          onChange={() => onChange('paymentMethod', 'wallet')}
          title="Apple Pay / Google Pay"
          note="Placeholder — no provider wired"
        />
      </div>

      {isCard && (
        <div className="space-y-4">
          <Field
            id="cardNumber"
            label="Card number"
            inputMode="numeric"
            autoComplete="cc-number"
            enterKeyHint="next"
            placeholder="1234 5678 9012 3456"
            required
            value={form.cardNumber}
            onChange={(e) => onChange('cardNumber', formatCardNumber(e.target.value))}
            error={errors.cardNumber}
          />
          <Field
            id="cardName"
            label="Name on card"
            autoComplete="cc-name"
            enterKeyHint="next"
            required
            value={form.cardName}
            onChange={(e) => onChange('cardName', e.target.value)}
            error={errors.cardName}
          />
          <div className="grid grid-cols-2 gap-4">
            <Field
              id="cardExpiry"
              label="Expiry (MM / YY)"
              inputMode="numeric"
              autoComplete="cc-exp"
              enterKeyHint="next"
              placeholder="MM / YY"
              required
              value={form.cardExpiry}
              onChange={(e) => onChange('cardExpiry', formatExpiry(e.target.value))}
              error={errors.cardExpiry}
            />
            <Field
              id="cardCvc"
              label="CVC"
              inputMode="numeric"
              autoComplete="cc-csc"
              enterKeyHint="done"
              placeholder="123"
              required
              value={form.cardCvc}
              onChange={(e) => onChange('cardCvc', e.target.value.replace(/\D/g, '').slice(0, 4))}
              error={errors.cardCvc}
            />
          </div>
        </div>
      )}

      <Checkbox
        id="billingSame"
        checked={form.billingSame}
        onChange={(e) => onChange('billingSame', e.target.checked)}
        className="mt-5"
      >
        Billing address same as delivery
      </Checkbox>

      <div className="mt-5 border border-line p-4 flex items-center gap-3">
        <Icon name="lock" size={18} className="text-graphite shrink-0" />
        <p className="text-[12px] text-graphite">
          Your transaction details are encrypted and fully private.
        </p>
      </div>
    </section>
  );
}
