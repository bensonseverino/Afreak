import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import AuthShell from '../components/AuthShell';
import AuthNotice from '../components/AuthNotice';
import Button from '../../components/ui/Button';
import Field from '../../components/ui/Field';
import Icon from '../../components/ui/Icon';
import IdentifierField from '../components/IdentifierField';
import PasswordField from '../components/PasswordField';
import Turnstile from '../components/Turnstile';
import { Checkbox } from '../../components/checkout/ContactSection';
import { api } from '../../lib/api';
import { DEFAULT_PHONE_COUNTRY } from '../../utils/countries';

const EMPTY = {
  channel: 'email',
  email: '',
  dialCode: DEFAULT_PHONE_COUNTRY.dial,
  phone: '',
  firstName: '',
  lastName: '',
  password: '',
  confirm: '',
  marketingOptIn: true,
  website: '',
};

function phoneIdentifier(dialCode, national) {
  return `${dialCode}${String(national).replace(/[^\d]/g, '')}`;
}

export default function AccountSignUp() {
  const navigate = useNavigate();
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [identifierTaken, setIdentifierTaken] = useState(false);
  const [notice, setNotice] = useState(null);
  const [turnstileToken, setTurnstileToken] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const set = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => (prev[key] ? { ...prev, [key]: undefined } : prev));
  };

  const signup = useMutation({
    mutationFn: (body) => api('/account/auth/signup', { method: 'POST', body }),
    onSuccess: () => {
      setSubmitted(true);
      setForm(EMPTY);
      setErrors({});
      setNotice(null);
      // Replace the entry so Back never re-submits the form.
      navigate('/account/sign-up', { replace: true });
    },
    onError: (err) => {
      if (err?.status === 400 && err.fields) {
        setErrors((prev) => ({ ...prev, ...err.fields }));
        setNotice({ tone: 'danger', title: 'Please check the form', body: err.message });
      } else if (err?.code === 'IDENTIFIER_TAKEN') {
        setIdentifierTaken(true);
        setErrors((prev) => ({ ...prev, identifier: err.message }));
      } else if (err?.status === 429) {
        setNotice({ tone: 'danger', title: 'Too many requests', body: err.message || 'Please try again later.' });
      } else {
        setNotice({ tone: 'danger', title: 'Something went wrong', body: err?.message || 'Please try again.' });
      }
    },
  });

  const handleSubmit = (event) => {
    event.preventDefault();
    if (signup.isPending) return;
    setNotice(null);
    setIdentifierTaken(false);

    const next = {};
    const identifier = form.channel === 'phone' ? phoneIdentifier(form.dialCode, form.phone) : form.email.trim();
    if (!identifier || (form.channel === 'phone' && !form.phone.replace(/\D/g, ''))) {
      next.identifier = 'Enter your email or phone number.';
    }
    if (!form.firstName.trim()) next.firstName = 'Enter your first name.';
    if (form.password.length < 8) next.password = 'Use at least 8 characters.';
    if (form.confirm !== form.password) next.confirm = 'Passwords do not match.';
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    signup.mutate({
      channel: form.channel,
      identifier,
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim() || undefined,
      password: form.password,
      marketingOptIn: form.marketingOptIn,
      website: form.website,
      turnstileToken: turnstileToken || undefined,
    });
  };

  if (submitted) {
    return (
      <AuthShell>
        <span className="inline-flex w-16 h-16 bg-ink items-center justify-center text-volt">
          <Icon name="check" size={30} />
        </span>
        <h1 className="mt-6 font-display font-extrabold uppercase text-[28px] leading-none text-ink">
          Request received
        </h1>
        <p className="mt-3 text-[14px] text-graphite leading-relaxed">
          Your account is pending approval. You&apos;ll be able to sign in as soon as it&apos;s approved.
        </p>
        <div className="mt-6 flex flex-col sm:flex-row gap-3">
          <Button variant="primary" onClick={() => navigate('/shop')} className="flex-1 h-14 text-[12px]" type="button">
            Back to shop
          </Button>
          <Button
            variant="outline"
            onClick={() => navigate('/account/login')}
            className="flex-1 h-14 text-[12px]"
            type="button"
          >
            Sign in
          </Button>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell>
      <h1 className="font-display font-extrabold uppercase text-[28px] leading-none text-ink">Create account</h1>
      <p className="mt-3 text-[14px] text-graphite leading-relaxed">
        Request an account with your email or phone number. We review every request and approve it shortly.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-5" noValidate>
        <div className="space-y-2">
          <IdentifierField
            id="signup-identifier"
            channel={form.channel}
            onChannelChange={(value) => set('channel', value)}
            email={form.email}
            onEmailChange={(value) => set('email', value)}
            phone={form.phone}
            onPhoneChange={(value) => set('phone', value)}
            dialCode={form.dialCode}
            onDialChange={(value) => set('dialCode', value)}
            error={errors.identifier}
            emailAutoComplete="email"
          />
          {identifierTaken && (
            <p className="text-[12px] text-ink">
              Already registered?{' '}
              <Link to="/account/login" className="font-semibold uppercase tracking-label underline">
                Sign in
              </Link>
            </p>
          )}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            id="signup-first"
            label="First name"
            autoComplete="given-name"
            enterKeyHint="next"
            value={form.firstName}
            onChange={(e) => set('firstName', e.target.value)}
            error={errors.firstName}
            required
          />
          <Field
            id="signup-last"
            label="Last name"
            autoComplete="family-name"
            enterKeyHint="next"
            value={form.lastName}
            onChange={(e) => set('lastName', e.target.value)}
            error={errors.lastName}
          />
        </div>

        <PasswordField
          id="signup-password"
          label="Password"
          value={form.password}
          onChange={(e) => set('password', e.target.value)}
          error={errors.password}
          hint="At least 8 characters."
          autoComplete="new-password"
          enterKeyHint="next"
          required
        />

        <PasswordField
          id="signup-confirm"
          label="Confirm password"
          value={form.confirm}
          onChange={(e) => set('confirm', e.target.value)}
          error={errors.confirm}
          autoComplete="new-password"
          enterKeyHint="go"
          required
        />

        <Checkbox
          id="signup-marketing"
          checked={form.marketingOptIn}
          onChange={(e) => set('marketingOptIn', e.target.checked)}
        >
          Email/SMS me about new drops
        </Checkbox>

        {/* Honeypot — hidden from people, filled by bots. */}
        <div className="sr-only" aria-hidden="true">
          <label htmlFor="signup-website">Website</label>
          <input
            id="signup-website"
            name="website"
            type="text"
            tabIndex={-1}
            autoComplete="off"
            value={form.website}
            onChange={(e) => set('website', e.target.value)}
          />
        </div>

        <Turnstile onToken={setTurnstileToken} />

        {notice && (
          <AuthNotice tone={notice.tone} title={notice.title}>
            {notice.body}
          </AuthNotice>
        )}

        <Button
          variant="primary"
          type="submit"
          disabled={signup.isPending}
          className="w-full h-14 text-[12px]"
        >
          {signup.isPending ? (
            <span className="inline-flex items-center gap-2">
              <Icon name="spinner" size={16} className="animate-spin" /> Sending…
            </span>
          ) : (
            'Request account'
          )}
        </Button>

        <p className="text-[12px] text-graphite leading-relaxed">
          By continuing you agree to our{' '}
          <Link to="/about" className="underline">
            Terms
          </Link>{' '}
          and{' '}
          <Link to="/about" className="underline">
            Privacy Policy
          </Link>
          .
        </p>

        <p className="text-[13px] text-graphite">
          Already approved?{' '}
          <Link to="/account/login" className="font-semibold uppercase tracking-label text-ink underline">
            Sign in
          </Link>
        </p>
      </form>
    </AuthShell>
  );
}
