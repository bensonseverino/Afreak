import Field from '../../components/ui/Field';
import Segmented from './Segmented';
import { PHONE_COUNTRIES } from '../../utils/countries';

const PHONE_CONTROL =
  'w-full min-h-[52px] px-3 bg-paper text-base text-ink border border-line outline-none transition-colors placeholder:text-stone focus:border-ink focus:ring-2 focus:ring-ink';

/**
 * `EMAIL | PHONE` segmented control + the matching identifier input, shared by
 * the sign-in, sign-up and forgot-password pages (spec §6.3–6.5). Phone is a
 * country-code select plus a national number; the backend normalises the pair.
 */
export default function IdentifierField({
  id,
  channel,
  onChannelChange,
  email,
  onEmailChange,
  phone,
  onPhoneChange,
  dialCode,
  onDialChange,
  error,
  emailAutoComplete = 'username',
  phoneAutoComplete = 'tel-national',
}) {
  const isPhone = channel === 'phone';

  return (
    <div className="space-y-4">
      <Segmented
        label="How should we reach you?"
        value={channel}
        onChange={onChannelChange}
        options={[
          { value: 'email', label: 'Email' },
          { value: 'phone', label: 'Phone' },
        ]}
      />

      {isPhone ? (
        <div>
          <label htmlFor={`${id}-number`} className="block font-sans text-[13px] font-medium text-ink mb-2">
            Phone number
          </label>
          <div className="grid grid-cols-[minmax(96px,110px)_1fr] gap-2">
            <select
              id={`${id}-country`}
              aria-label="Country code"
              value={dialCode}
              onChange={(e) => onDialChange(e.target.value)}
              className={PHONE_CONTROL}
            >
              {PHONE_COUNTRIES.map((country) => (
                <option key={`${country.code}-${country.dial}`} value={country.dial}>
                  {country.code} {country.dial}
                </option>
              ))}
            </select>
            <input
              id={`${id}-number`}
              type="tel"
              inputMode="tel"
              autoComplete={phoneAutoComplete}
              enterKeyHint="go"
              placeholder="712 345 678"
              value={phone}
              onChange={(e) => onPhoneChange(e.target.value)}
              aria-invalid={error ? true : undefined}
              aria-describedby={error ? `${id}-error` : undefined}
              className={`${PHONE_CONTROL} px-4 ${error ? 'border-danger focus:border-danger focus:ring-danger' : ''}`}
            />
          </div>
          {error && (
            <p id={`${id}-error`} className="mt-1.5 text-[12px] text-danger" aria-live="polite">
              {error}
            </p>
          )}
        </div>
      ) : (
        <Field
          id={id}
          label="Email address"
          type="email"
          inputMode="email"
          autoComplete={emailAutoComplete}
          enterKeyHint="go"
          placeholder="you@email.com"
          value={email}
          onChange={(e) => onEmailChange(e.target.value)}
          error={error}
        />
      )}
    </div>
  );
}
