/**
 * Bridge between the real account session and the in-browser mock API
 * (`lib/mockBackend.js`).
 *
 * `AccountProvider` publishes the signed-in customer (resolved from
 * `GET /api/account/me`) here — synchronously, before any mock query runs — so
 * the mock's `resolveCustomer` can map the session to its local customer row
 * without ever handling credentials. The real backend reads the session cookie
 * from the request instead.
 */
let current = null;

export function setIdentity(identity) {
  current = identity
    ? {
        id: identity.id,
        email: identity.email || '',
        phone: identity.phone || '',
        firstName: identity.firstName || '',
        lastName: identity.lastName || '',
      }
    : null;
}

export function getIdentity() {
  return current;
}

export function clearIdentity() {
  current = null;
}
