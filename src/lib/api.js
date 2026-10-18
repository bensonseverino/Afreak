/**
 * Fetch wrapper. Contract-shape identical to the checkout/backend specs:
 *   const { data, meta } = await api('/products?page=2')
 * Errors are thrown with `.status`, `.code`, `.message`, optional `.fields` and
 * (for 429s) `.retryAfter` in seconds.
 *
 * Auth is an HttpOnly session cookie, so every request is sent with
 * `credentials: 'include'` and no Authorization header.
 *
 * With no `VITE_API_BASE` configured the request is served by the in-browser
 * mock (`lib/mockBackend.js`), so the UI is fully functional without a Worker.
 * Point `VITE_API_BASE` at the Cloudflare Pages project and the exact same
 * call sites hit the real Hono API.
 *
 * The customer auth surface (`/account/auth/*`, `/account/me`,
 * `/account/change-password`, `/account/sessions`, `DELETE /account`) always
 * hits the real API — the in-browser mock never sees a password or a session.
 * The remaining `/account/*` commerce dashboards still use the mock here.
 */
import { handleMockRequest } from './mockBackend';
import { queryClient } from './queryClient';
import { appNavigate } from './authNav';

const BASE = import.meta.env?.VITE_API_BASE ?? '';
const USE_MOCK = !BASE;

const MOCK_PREFIXES = ['/account'];

// Real-endpoint paths that must never be answered by the mock.
const REAL_EXACT = new Set(['/account', '/account/me', '/account/change-password']);
function isRealAuthPath(path) {
  return (
    REAL_EXACT.has(path) ||
    path.startsWith('/account/auth/') ||
    path === '/account/sessions' ||
    path.startsWith('/account/sessions/')
  );
}

function routesToMock(path) {
  if (isRealAuthPath(path)) return false;
  if (USE_MOCK) return true;
  return MOCK_PREFIXES.some((prefix) => path === prefix || path.startsWith(`${prefix}/`));
}

function normalizeError(err) {
  if (err && typeof err.status === 'number') return err;
  const wrapped = new Error(err?.message || 'Something went wrong.');
  wrapped.status = 0;
  wrapped.code = 'NETWORK';
  return wrapped;
}

export async function api(path, { method = 'GET', body, headers, signal } = {}) {
  if (routesToMock(path)) {
    try {
      return await handleMockRequest(path, { method, body, signal });
    } catch (err) {
      throw normalizeError(err);
    }
  }

  const res = await fetch(`${BASE}/api${path}`, {
    method,
    signal,
    headers: {
      ...(body && !(body instanceof FormData) ? { 'Content-Type': 'application/json' } : null),
      ...headers,
    },
    body: body instanceof FormData ? body : body ? JSON.stringify(body) : undefined,
    credentials: 'include',
  });

  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(json?.error?.message || 'Request failed');
    err.status = res.status;
    err.code = json?.error?.code;
    if (json?.error?.fields) err.fields = json.error.fields;
    if (json?.error?.details) err.details = json.error.details;
    if (json?.error?.retryAfter != null) err.retryAfter = json.error.retryAfter;

    // A 401 means the session is gone: clear the cached `me` (without
    // destroying the observer, which would immediately re-fetch and loop) so
    // the UI falls back to the signed-out state on the next render.
    if (res.status === 401) queryClient.setQueryData(['me'], null);

    // The account is signed in but must set a new password before anything else.
    if (res.status === 403 && err.code === 'PASSWORD_CHANGE_REQUIRED') {
      appNavigate('/account/change-password', { replace: true });
    }

    throw err;
  }
  return json;
}

export default api;
