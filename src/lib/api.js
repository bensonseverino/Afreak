/**
 * Fetch wrapper. Contract-shape identical to the checkout/backend specs:
 *   const { data, meta } = await api('/products?page=2')
 * Errors are thrown with `.status`, `.code`, `.message` and optional `.fields`.
 *
 * With no `VITE_API_BASE` configured the request is served by the in-browser
 * mock (`lib/mockBackend.js`), so the UI is fully functional without a Worker.
 * Point `VITE_API_BASE` at the Cloudflare Pages project and the exact same
 * call sites hit the real Hono API.
 *
 * Customer accounts (`/account/*`) are not part of the backend yet, so those
 * routes keep using the in-browser mock even when the real API is configured.
 */
import { handleMockRequest } from './mockBackend';

const BASE = import.meta.env?.VITE_API_BASE ?? '';
const USE_MOCK = !BASE;

const MOCK_PREFIXES = ['/account'];

function routesToMock(path) {
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
    credentials: 'same-origin',
  });

  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(json?.error?.message || 'Request failed');
    err.status = res.status;
    err.code = json?.error?.code;
    if (json?.error?.fields) err.fields = json.error.fields;
    if (json?.error?.details) err.details = json.error.details;
    throw err;
  }
  return json;
}

export default api;
