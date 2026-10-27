import { useId, useState } from 'react';
import Icon from '../ui/Icon';
import { api } from '../../lib/api';

/**
 * Newsletter signup (audit row 20).
 *
 * Every newsletter form on the storefront posts to `POST /api/forms/newsletter`
 * so the address lands in the admin Subscribers list. The form is intentionally
 * tiny: one email field, one button, inline success/error feedback.
 */
export default function NewsletterForm({
  source = 'footer',
  className = '',
  formClassName = '',
  inputClassName = '',
  buttonClassName = '',
  messageClassName = '',
  placeholder = 'Enter your email',
}) {
  const id = useId();
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle');
  const [message, setMessage] = useState('');

  const submit = async (event) => {
    event.preventDefault();
    if (status === 'loading') return;
    const value = email.trim();
    if (!value) return;

    setStatus('loading');
    setMessage('');
    try {
      await api('/forms/newsletter', {
        method: 'POST',
        body: { email: value, source },
      });
      setStatus('success');
      setMessage("You're on the list. Watch your inbox.");
      setEmail('');
    } catch (err) {
      setStatus('error');
      setMessage(err?.message || 'Could not subscribe. Please try again.');
    }
  };

  return (
    <div className={className}>
      <form
        className={`${formClassName || 'flex flex-col sm:flex-row gap-2'}`}
        onSubmit={submit}
        aria-label="Newsletter signup"
      >
        <label htmlFor={id} className="sr-only">
          Email address
        </label>
        <input
          id={id}
          name="email"
          type="email"
          autoComplete="email"
          placeholder={placeholder}
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
          disabled={status === 'loading'}
          className={inputClassName}
        />
        <button
          type="submit"
          disabled={status === 'loading'}
          aria-label={status === 'loading' ? 'Subscribing' : 'Subscribe'}
          className={`${buttonClassName} disabled:opacity-60`}
        >
          {status === 'loading' ? (
            <span className="text-[10px] font-semibold uppercase">…</span>
          ) : (
            <Icon name="arrowRight" size={20} />
          )}
        </button>
      </form>
      {message && (
        <p
          role="status"
          aria-live="polite"
          className={`${messageClassName} ${status === 'error' ? 'text-danger' : ''}`}
        >
          {message}
        </p>
      )}
    </div>
  );
}
