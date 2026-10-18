import { createContext, useContext, useMemo } from 'react';
import { setIdentity } from '../lib/identity';
import { useMe } from '../hooks/useCustomer';

const AccountContext = createContext({ ready: false, signedIn: false, me: null, customer: null });

/**
 * Publishes the session resolved from `GET /api/account/me` to
 * `lib/identity.js` so the in-browser mock API can resolve the matching customer
 * row. This happens during render — before any child query runs — which keeps it
 * race-free.
 */
export function AccountProvider({ children }) {
  const { data, isPending } = useMe();
  const customer = data?.customer || null;

  setIdentity(
    customer
      ? {
          id: customer.id,
          email: customer.email || '',
          phone: customer.phone || '',
          firstName: customer.firstName || '',
          lastName: customer.lastName || '',
        }
      : null
  );

  const value = useMemo(
    () => ({ ready: !isPending, signedIn: Boolean(customer), me: data ?? null, customer }),
    [isPending, customer, data]
  );

  return <AccountContext.Provider value={value}>{children}</AccountContext.Provider>;
}

export function useAccount() {
  return useContext(AccountContext);
}
