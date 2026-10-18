import { useState } from 'react';
import Field from '../../components/ui/Field';

/**
 * Password input with a show/hide toggle (spec §6.3). Wraps `Field` so the label,
 * error and hint styling stay identical to every other input.
 */
export default function PasswordField({
  id,
  label,
  value,
  onChange,
  error,
  hint,
  autoComplete = 'current-password',
  enterKeyHint = 'go',
  required = false,
  placeholder,
}) {
  const [show, setShow] = useState(false);

  return (
    <div className="relative">
      <Field
        id={id}
        label={label}
        type={show ? 'text' : 'password'}
        value={value}
        onChange={onChange}
        error={error}
        hint={hint}
        autoComplete={autoComplete}
        enterKeyHint={enterKeyHint}
        required={required}
        placeholder={placeholder}
        className="[&_input]:pr-16"
      />
      <button
        type="button"
        onClick={() => setShow((prev) => !prev)}
        aria-label={show ? 'Hide password' : 'Show password'}
        aria-pressed={show}
        className="absolute right-3 top-[30px] h-9 min-w-[44px] px-2 text-[11px] font-semibold uppercase tracking-label text-graphite hover:text-ink"
      >
        {show ? 'Hide' : 'Show'}
      </button>
    </div>
  );
}
