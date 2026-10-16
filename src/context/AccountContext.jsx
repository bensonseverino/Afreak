import { createContext, useContext, useEffect, useMemo, useRef } from 'react';
import { useAuth, useUser } from '@clerk/react';
import { useQueryClient } from '@tanstack/react-query';
import { setIdentity } from '../lib/identity';

const AccountContext = createContext({ ready: false, signedIn: false, userId: null, user: null });

/**
 * Adapts the Clerk session into the app's account layer.
 *
 *  1. Publishes the signed-in Clerk user to `lib/identity.js` so the in-browser
 *     mock API can resolve the matching customer row. This happens during
 *     render — before any child query runs — which keeps it race-free.
 *  2. Clears cached account data whenever the signed-in user changes.
 */
export function AccountProvider({ children }) {
  const { isLoaded, isSignedIn, userId } = useAuth();
  const { user } = useUser();
  const client = useQueryClient();

  setIdentity(
    isLoaded && isSignedIn && user
      ? {
          id: user.id,
          email: user.primaryEmailAddress?.emailAddress || '',
          phone: user.primaryPhoneNumber?.phoneNumber || '',
          firstName: user.firstName || '',
          lastName: user.lastName || '',
        }
      : null
  );

  const lastUserId = useRef(userId);
  useEffect(() => {
    if (lastUserId.current === userId) return;
    // Clear cached account data when the session ends or the user changes. The
    // initial anonymous → signed-in transition is skipped: account queries get
    // enabled at exactly that moment, so clearing would cancel their first fetch.
    if (lastUserId.current) client.clear();
    lastUserId.current = userId;
  }, [userId, client]);

  const value = useMemo(
    () => ({
      ready: isLoaded,
      signedIn: Boolean(isSignedIn),
      userId: userId || null,
      user: user || null,
    }),
    [isLoaded, isSignedIn, userId, user]
  );

  return <AccountContext.Provider value={value}>{children}</AccountContext.Provider>;
}

export function useAccount() {
  return useContext(AccountContext);
}
