/**
 * Bridge between Clerk (the identity provider) and the in-browser mock account
 * API (`lib/mockBackend.js`).
 *
 * `AccountProvider` publishes the signed-in Clerk user here — synchronously,
 * before any account query runs — so `resolveCustomer` can map the Clerk user to
 * its customer row without the mock API ever handling credentials. A real Hono
 * backend would instead read the Clerk session token from the request.
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
