import { useSearchParams } from 'react-router-dom';
import { SignUp as ClerkSignUp } from '@clerk/react';
import AuthShell from '../components/AuthShell';

// Clerk-hosted sign-up, themed to the storefront. Like SignIn, Clerk handles the
// redirect for an already-signed-in visitor.
export default function SignUp() {
  const [params] = useSearchParams();
  const raw = params.get('next') || '/account';
  const next = raw.startsWith('/') && !raw.startsWith('//') ? raw : '/account';
  const signInUrl = next === '/account' ? '/sign-in' : `/sign-in?next=${encodeURIComponent(next)}`;

  return (
    <AuthShell>
      <h1 className="font-display font-extrabold uppercase text-[28px] leading-none text-ink">
        Create account
      </h1>
      <p className="mt-3 text-[14px] text-graphite leading-relaxed">
        One account for your orders, wishlist and returns.
      </p>
      <div className="mt-6">
        <ClerkSignUp
          routing="path"
          path="/sign-up"
          signInUrl={signInUrl}
          fallbackRedirectUrl={next}
        />
      </div>
    </AuthShell>
  );
}
