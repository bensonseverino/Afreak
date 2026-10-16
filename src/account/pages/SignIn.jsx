import { useSearchParams } from 'react-router-dom';
import { SignIn as ClerkSignIn } from '@clerk/react';
import AuthShell from '../components/AuthShell';

/**
 * Clerk-hosted sign-in, themed to the storefront (replaces the mock OTP flow).
 * `?next=` carries the account page the visitor was heading for; Clerk redirects
 * there after a successful sign-in. Clerk itself redirects an already-signed-in
 * visitor, so this component never navigates on its own.
 */
export default function SignIn() {
  const [params] = useSearchParams();
  const raw = params.get('next') || '/account';
  const next = raw.startsWith('/') && !raw.startsWith('//') ? raw : '/account';
  const signUpUrl = next === '/account' ? '/sign-up' : `/sign-up?next=${encodeURIComponent(next)}`;

  return (
    <AuthShell>
      <h1 className="font-display font-extrabold uppercase text-[28px] leading-none text-ink">
        Sign in
      </h1>
      <p className="mt-3 text-[14px] text-graphite leading-relaxed">
        Welcome back. Sign in to see your orders, saved details and wishlist.
      </p>
      <div className="mt-6">
        <ClerkSignIn
          routing="path"
          path="/sign-in"
          signUpUrl={signUpUrl}
          fallbackRedirectUrl={next}
        />
      </div>
    </AuthShell>
  );
}
