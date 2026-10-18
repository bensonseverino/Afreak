import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import AuthShell from '../components/AuthShell';
import AuthNotice from '../components/AuthNotice';
import Button from '../../components/ui/Button';
import Icon from '../../components/ui/Icon';
import IdentifierField from '../components/IdentifierField';
import { api } from '../../lib/api';
import { DEFAULT_PHONE_COUNTRY } from '../../utils/countries';

function phoneIdentifier(dialCode, national) {
  return `${dialCode}${String(national).replace(/[^\d]/g, '')}`;
}

export default function ForgotPassword() {
  const [channel, setChannel] = useState('email');
  const [email, setEmail] = useState('');
  const [dialCode, setDialCode] = useState(DEFAULT_PHONE_COUNTRY.dial);
  const [phone, setPhone] = useState('');
  const [website, setWebsite] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const request = useMutation({
    mutationFn: (body) => api('/account/auth/forgot-password', { method: 'POST', body }),
    // The response is always generic; failures are still safe to show.
    onSuccess: () => setSent(true),
    onError: (err) => setError(err?.message || 'Please try again in a moment.'),
  });

  const handleSubmit = (event) => {
    event.preventDefault();
    if (request.isPending) return;
    setError('');
    const identifier = channel === 'phone' ? phoneIdentifier(dialCode, phone) : email.trim();
    if (!identifier || (channel === 'phone' && !phone.replace(/\D/g, ''))) {
      setError('Enter your email or phone number.');
      return;
    }
    request.mutate({ channel, identifier, website });
  };

  return (
    <AuthShell>
      <h1 className="font-display font-extrabold uppercase text-[28px] leading-none text-ink">Forgot password</h1>
      <p className="mt-3 text-[14px] text-graphite leading-relaxed">
        Enter your email or phone number. Our team will reset your password and contact you.
      </p>

      {sent ? (
        <div className="mt-6 space-y-5">
          <AuthNotice tone="info" icon="checkCircle" title="Request received">
            If an account exists, our team has been notified and will be in touch.
          </AuthNotice>
          <p className="text-[13px] text-graphite">
            <Link to="/account/login" className="font-semibold uppercase tracking-label text-ink underline">
              Back to sign in
            </Link>
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="mt-6 space-y-5" noValidate>
          <IdentifierField
            id="forgot-identifier"
            channel={channel}
            onChannelChange={(value) => {
              setChannel(value);
              setError('');
            }}
            email={email}
            onEmailChange={setEmail}
            phone={phone}
            onPhoneChange={setPhone}
            dialCode={dialCode}
            onDialChange={setDialCode}
          />

          {/* Honeypot — hidden from people, filled by bots. */}
          <div className="sr-only" aria-hidden="true">
            <label htmlFor="forgot-website">Website</label>
            <input
              id="forgot-website"
              name="website"
              type="text"
              tabIndex={-1}
              autoComplete="off"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
            />
          </div>

          {error && <AuthNotice tone="danger" title="Please check the form">{error}</AuthNotice>}

          <Button variant="primary" type="submit" disabled={request.isPending} className="w-full h-14 text-[12px]">
            {request.isPending ? (
              <span className="inline-flex items-center gap-2">
                <Icon name="spinner" size={16} className="animate-spin" /> Sending…
              </span>
            ) : (
              'Send request'
            )}
          </Button>

          <p className="text-[13px] text-graphite">
            <Link to="/account/login" className="text-ink underline">
              Back to sign in
            </Link>
          </p>
        </form>
      )}
    </AuthShell>
  );
}
