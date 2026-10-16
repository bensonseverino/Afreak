import Field from '../ui/Field';
import RadioCard from '../ui/RadioCard';
import { useCart } from '../../context/CartContext';
import { DELIVERY_METHODS, FREE_SHIPPING_THRESHOLD } from '../../utils/shipping';
import { formatPrice } from '../../data/products';
import { COUNTRIES } from '../../utils/countries';

export default function DeliverySection({ form, errors, onChange }) {
  const { subtotal, shippingMethod, setShippingMethod } = useCart();

  return (
    <section className="border-b border-line py-8">
      <h2 className="font-display font-extrabold uppercase text-[18px] text-ink mb-5">Delivery</h2>

      <Field
        as="select"
        id="country"
        label="Country / region"
        autoComplete="country-name"
        required
        value={form.country}
        onChange={(e) => onChange('country', e.target.value)}
        error={errors.country}
      >
        <option value="">Select a country</option>
        {COUNTRIES.map((c) => (
          <option key={c} value={c}>
            {c}
          </option>
        ))}
      </Field>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <Field
          id="firstName"
          label="First name"
          autoComplete="given-name"
          enterKeyHint="next"
          required
          value={form.firstName}
          onChange={(e) => onChange('firstName', e.target.value)}
          error={errors.firstName}
        />
        <Field
          id="lastName"
          label="Last name"
          autoComplete="family-name"
          enterKeyHint="next"
          required
          value={form.lastName}
          onChange={(e) => onChange('lastName', e.target.value)}
          error={errors.lastName}
        />
      </div>

      <Field
        className="mt-4"
        id="address1"
        label="Address"
        autoComplete="address-line1"
        enterKeyHint="next"
        required
        value={form.address1}
        onChange={(e) => onChange('address1', e.target.value)}
        error={errors.address1}
      />

      <Field
        className="mt-4"
        id="address2"
        label="Apartment, suite (optional)"
        autoComplete="address-line2"
        enterKeyHint="next"
        value={form.address2}
        onChange={(e) => onChange('address2', e.target.value)}
      />

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <Field
          id="city"
          label="City"
          autoComplete="address-level2"
          enterKeyHint="next"
          required
          value={form.city}
          onChange={(e) => onChange('city', e.target.value)}
          error={errors.city}
        />
        <Field
          id="postalCode"
          label="Postal code"
          autoComplete="postal-code"
          enterKeyHint="next"
          required
          value={form.postalCode}
          onChange={(e) => onChange('postalCode', e.target.value)}
          error={errors.postalCode}
        />
      </div>

      <Field
        className="mt-4"
        id="phone"
        label="Phone"
        type="tel"
        inputMode="tel"
        autoComplete="tel"
        enterKeyHint="done"
        required
        value={form.phone}
        onChange={(e) => onChange('phone', e.target.value)}
        error={errors.phone}
      />

      <h3 className="font-sans font-bold uppercase text-[12px] tracking-label text-ink mt-8 mb-3">
        Delivery method
      </h3>
      <div className="space-y-2">
        {DELIVERY_METHODS.map((m) => (
          <RadioCard
            key={m.id}
            name="deliveryMethod"
            value={m.id}
            checked={shippingMethod === m.id}
            onChange={() => setShippingMethod(m.id)}
            title={m.label}
            note={m.note}
            price={
              m.id === 'standard' && subtotal >= FREE_SHIPPING_THRESHOLD
                ? 'FREE'
                : formatPrice(m.price)
            }
          />
        ))}
      </div>
    </section>
  );
}
