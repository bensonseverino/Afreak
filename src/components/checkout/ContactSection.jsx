import Field from '../ui/Field';
import Icon from '../ui/Icon';

// Square checkbox with a peer-driven check mark.
export function Checkbox({ id, checked, onChange, children, className = '' }) {
  return (
    <label htmlFor={id} className={`flex items-start gap-3 text-[13px] text-ink cursor-pointer ${className}`}>
      <input id={id} type="checkbox" checked={checked} onChange={onChange} className="peer sr-only" />
      <span className="mt-0.5 w-5 h-5 border border-stone flex items-center justify-center shrink-0 peer-checked:bg-ink peer-checked:border-ink peer-checked:[&_svg]:opacity-100">
        <Icon name="check" size={12} className="text-paper opacity-0" />
      </span>
      <span>{children}</span>
    </label>
  );
}

export default function ContactSection({ form, errors, onChange }) {
  return (
    <section className="border-b border-line py-8">
      <div className="flex items-baseline justify-between mb-5">
        <h2 className="font-display font-extrabold uppercase text-[18px] text-ink">Contact</h2>
        <button type="button" className="text-[13px] text-ink underline">
          Log in
        </button>
      </div>

      <Field
        id="email"
        label="Email"
        type="email"
        inputMode="email"
        autoComplete="email"
        enterKeyHint="next"
        placeholder="you@email.com"
        required
        value={form.email}
        onChange={(e) => onChange('email', e.target.value)}
        error={errors.email}
      />

      <Checkbox
        id="marketingOptIn"
        checked={form.marketingOptIn}
        onChange={(e) => onChange('marketingOptIn', e.target.checked)}
        className="mt-4"
      >
        Email me about new drops
      </Checkbox>
    </section>
  );
}
