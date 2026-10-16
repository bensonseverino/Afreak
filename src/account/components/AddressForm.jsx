import { useState } from 'react';
import Field from '../../components/ui/Field';
import Button from '../../components/ui/Button';
import { Checkbox } from '../../components/checkout/ContactSection';
import { COUNTRIES } from '../../utils/countries';
import { isPhone, isPostal, required } from '../../utils/validators';

const EMPTY = {
  label: '',
  firstName: '',
  lastName: '',
  line1: '',
  line2: '',
  city: '',
  region: '',
  postalCode: '',
  country: '',
  phone: '',
  isDefaultShipping: false,
};

// Same field set + autocomplete attributes as checkout (spec §8.5).
export default function AddressForm({ initial, onSubmit, onCancel, loading = false, submitLabel = 'Save address' }) {
  const [form, setForm] = useState({ ...EMPTY, ...initial });
  const [errors, setErrors] = useState({});

  const set = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => (prev[key] ? { ...prev, [key]: undefined } : prev));
  };

  const validate = () => {
    const e = {};
    if (!required(form.firstName)) e.firstName = 'Enter a first name.';
    if (!required(form.lastName)) e.lastName = 'Enter a last name.';
    if (!required(form.line1)) e.line1 = 'Enter an address.';
    if (!required(form.city)) e.city = 'Enter a city.';
    if (!isPostal(form.postalCode)) e.postalCode = 'Enter a postal code.';
    if (!required(form.country)) e.country = 'Select a country.';
    if (form.phone && !isPhone(form.phone)) e.phone = 'Enter a valid phone number.';
    return e;
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length > 0) return;
    onSubmit(form);
  };

  return (
    <form onSubmit={handleSubmit} noValidate>
      <Field
        id="addr-label"
        label="Label (optional)"
        placeholder="Home, Work…"
        value={form.label}
        onChange={(e) => set('label', e.target.value)}
      />

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <Field
          id="addr-first"
          label="First name"
          autoComplete="given-name"
          enterKeyHint="next"
          required
          value={form.firstName}
          onChange={(e) => set('firstName', e.target.value)}
          error={errors.firstName}
        />
        <Field
          id="addr-last"
          label="Last name"
          autoComplete="family-name"
          enterKeyHint="next"
          required
          value={form.lastName}
          onChange={(e) => set('lastName', e.target.value)}
          error={errors.lastName}
        />
      </div>

      <Field
        className="mt-4"
        id="addr-line1"
        label="Address"
        autoComplete="address-line1"
        enterKeyHint="next"
        required
        value={form.line1}
        onChange={(e) => set('line1', e.target.value)}
        error={errors.line1}
      />

      <Field
        className="mt-4"
        id="addr-line2"
        label="Apartment, suite (optional)"
        autoComplete="address-line2"
        enterKeyHint="next"
        value={form.line2}
        onChange={(e) => set('line2', e.target.value)}
      />

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <Field
          id="addr-city"
          label="City"
          autoComplete="address-level2"
          enterKeyHint="next"
          required
          value={form.city}
          onChange={(e) => set('city', e.target.value)}
          error={errors.city}
        />
        <Field
          id="addr-region"
          label="County / region (optional)"
          autoComplete="address-level1"
          enterKeyHint="next"
          value={form.region}
          onChange={(e) => set('region', e.target.value)}
        />
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <Field
          id="addr-postal"
          label="Postal code"
          autoComplete="postal-code"
          enterKeyHint="next"
          required
          value={form.postalCode}
          onChange={(e) => set('postalCode', e.target.value)}
          error={errors.postalCode}
        />
        <Field
          as="select"
          id="addr-country"
          label="Country / region"
          autoComplete="country-name"
          required
          value={form.country}
          onChange={(e) => set('country', e.target.value)}
          error={errors.country}
        >
          <option value="">Select a country</option>
          {COUNTRIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </Field>
      </div>

      <Field
        className="mt-4"
        id="addr-phone"
        label="Phone (optional)"
        type="tel"
        inputMode="tel"
        autoComplete="tel"
        enterKeyHint="done"
        value={form.phone}
        onChange={(e) => set('phone', e.target.value)}
        error={errors.phone}
      />

      <Checkbox
        id="addr-default"
        checked={form.isDefaultShipping}
        onChange={(e) => set('isDefaultShipping', e.target.checked)}
        className="mt-5"
      >
        Set as my default address
      </Checkbox>

      <div className="mt-6 flex flex-col-reverse sm:flex-row gap-3">
        {onCancel && (
          <Button variant="outline" type="button" onClick={onCancel} className="flex-1 h-12 text-[12px]">
            Cancel
          </Button>
        )}
        <Button variant="primary" type="submit" disabled={loading} className="flex-1 h-12 text-[12px]">
          {loading ? 'Saving…' : submitLabel}
        </Button>
      </div>
    </form>
  );
}
