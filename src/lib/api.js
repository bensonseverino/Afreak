/**
 * Fetch wrapper. Contract-shape identical to the checkout/backend specs:
 *   const { data, meta } = await api('/products?page=2')
 * Errors are thrown with `.status`, `.code`, `.message` and optional `.fields`.
 *
 * With no `VITE_API_BASE` configured the request is served by the in-browser
 * mock (`lib/mockBackend.js`), so the UI is fully functional without a Worker.
 * Point `VITE_API_BASE` at the Cloudflare Pages project and the exact same
 * call sites hit the real Hono API.
 */
import { handleMockRequest } from './mockBackend';

const BASE = import.meta.env?.VITE_API_BASE ?? '';
const USE_MOCK = !BASE;

function normalizeError(err) {
  if (err && typeof err.status === 'number') return err;
  const wrapped = new Error(err?.message || 'Something went wrong.');
  wrapped.status = 0;
  wrapped.code = 'NETWORK';
  return wrapped;
}

export async function api(path, { method = 'GET', body, signal } = {}) {
  if (USE_MOCK) {
    try {
      return await handleMockRequest(path, { method, body, signal });
    } catch (err) {
      throw normalizeError(err);
    }
  }

  const res = await fetch(`${BASE}/api${path}`, {
    method,
    signal,
    headers: body && !(body instanceof FormData) ? { 'Content-Type': 'application/json' } : undefined,
    body: body instanceof FormData ? body : body ? JSON.stringify(body) : undefined,
    credentials: 'same-origin',
  });

  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(json?.error?.message || 'Request failed');
    err.status = res.status;
    err.code = json?.error?.code;
    if (json?.error?.fields) err.fields = json.error.fields;
    throw err;
  }
  return json;
}

export default api;
