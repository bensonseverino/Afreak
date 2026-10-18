import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import AuthShell from '../components/AuthShell';
import AuthNotice from '../components/AuthNotice';
import Button from '../../components/ui/Button';
import Icon from '../../components/ui/Icon';
import IdentifierField from '../components/IdentifierField';
import PasswordField from '../components/PasswordField';
import { api } from '../../lib/api';
import { ME_KEY } from '../../hooks/useCustomer';
import { DEFAULT_PHONE_COUNTRY } from '../../utils/countries';

function safeNext(raw) {
  return raw && raw.startsWith('/') && !raw.startsWith('//') ? raw : '/account';
}

function formatCountdown(seconds) {
  const m = String(Math.floor(seconds / 60)).padStart(2, '0');
  const s = String(seconds % 60).padStart(2, '0');
  return `${m}:${s}`;
}

function phoneIdentifier(dialCode, national) {
  const digits = String(national).replace(/[^\d]/g, '');
  return `${dialCode}${digits}`;
}

export default function AccountLogin() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const next = safeNext(params.get('next'));

  const [channel, setChannel] = useState('email');
  const [email, setEmail] = useState('');
  const [dialCode, setDialCode] = useState(DEFAULT_PHONE_COUNTRY.dial);
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [notice, setNotice] = useState(null);
  const [retryAt, setRetryAt] = useState(0);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!retryAt) return undefined;
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, [retryAt]);

  const remaining = retryAt ? Math.max(0, Math.ceil((retryAt - now) / 1000)) : 0;
  const locked = remaining > 0;

  const login = useMutation({
    mutationFn: (body) => api('/account/auth/login', { method: 'POST', body }),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ME_KEY });
      if (res?.data?.mustChangePassword) navigate('/account/change-password', { replace: true });
      else navigate(next, { replace: true });
    },
    onError: (err) => {
      if (err?.status === 401) {
        setNotice({ tone: 'danger', title: 'Sign-in failed', body: 'Incorrect email/phone or password. Please try again.' });
      } else if (err?.code === 'ACCOUNT_PENDING') {
        setNotice({
          tone: 'info',
          icon: 'clock',
          title: 'Your account is awaiting approval',
          body: "We'll activate it shortly. You can sign in as soon as it's approved.",
        });
      } else if (err?.code === 'ACCOUNT_REJECTED') {
        setNotice({
          tone: 'info',
          icon: 'alert',
          title: 'Request not approved',
          body: "Your account request wasn't approved. Contact us if you think this is a mistake.",
        });
      } else if (err?.code === 'ACCOUNT_SUSPENDED') {
        setNotice({ tone: 'info', icon: 'alert', title: 'Account suspended', body: 'This account is currently suspended. Contact support.' });
      } else if (err?.status === 429) {
        const seconds = Number(err.retryAfter) || 60;
        setRetryAt(Date.now() + seconds * 1000);
        setNotice({ tone: 'danger', title: 'Too many attempts', body: `Try again in ${formatCountdown(seconds)}.` });
      } else {
        setNotice({ tone: 'danger', title: 'Something went wrong', body: err?.message || 'Please try again.' });
      }
    },
  });

  const handleSubmit = (event) => {
    event.preventDefault();
    if (locked || login.isPending) return;
    setNotice(null);

    const identifier = channel === 'phone' ? phoneIdentifier(dialCode, phone) : email.trim();
    if (!identifier || (channel === 'phone' && !phone.replace(/\D/g, ''))) {
      setNotice({ tone: 'danger', title: 'Missing detail', body: 'Enter your email or phone number.' });
      return;
    }
    if (!password) {
      setNotice({ tone: 'danger', title: 'Missing detail', body: 'Enter your password.' });
      return;
    }
    login.mutate({ channel, identifier, password });
  };

  return (
    <AuthShell>
      <h1 className="font-display font-extrabold uppercase text-[28px] leading-none text-ink">Sign in</h1>
      <p className="mt-3 text-[14px] text-graphite leading-relaxed">
        Enter your email or phone number and your password.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-5" noValidate>
        <IdentifierField
          id="login-identifier"
          channel={channel}
          onChannelChange={(value) => {
            setChannel(value);
            setNotice(null);
          }}
          email={email}
          onEmailChange={setEmail}
          phone={phone}
          onPhoneChange={setPhone}
          dialCode={dialCode}
          onDialChange={setDialCode}
        />

        <div>
          <PasswordField
            id="login-password"
            label="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            enterKeyHint="go"
            required
          />
          <div className="mt-2 text-right">
            <Link to="/account/forgot-password" className="text-[12px] text-ink underline">
              Forgot password?
            </Link>
          </div>
        </div>

        {notice && (
          <AuthNotice tone={notice.tone} icon={notice.icon} title={notice.title}>
            {notice.body}
          </AuthNotice>
        )}

        <Button
          variant="primary"
          type="submit"
          disabled={login.isPending || locked}
          className="w-full h-14 text-[12px]"
        >
          {login.isPending ? (
            <span className="inline-flex items-center gap-2">
              <Icon name="spinner" size={16} className="animate-spin" /> Signing in…
            </span>
          ) : locked ? (
            `Try again in ${formatCountdown(remaining)}`
          ) : (
            'Sign in'
          )}
        </Button>
      </form>

      <div className="mt-6 space-y-3 text-[13px] text-graphite">
        <p>
          New here?{' '}
          <Link to="/account/sign-up" className="font-semibold uppercase tracking-label text-ink underline">
            Request an account
          </Link>
        </p>
        <p>
          <Link to="/" className="text-ink underline">
            Continue as guest →
          </Link>
        </p>
      </div>
    </AuthShell>
  );
}
