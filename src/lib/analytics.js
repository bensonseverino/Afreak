/**
 * Funnel counters for the CMS dashboard (POST /track).
 *
 * These are fire-and-forget: they never block a render, never surface an
 * error, and the API discards anything from a bot user-agent. In mock mode
 * there is no server to report to, so the calls are skipped entirely.
 */
const BASE = import.meta.env?.VITE_API_BASE ?? '';

export const TRACK_TYPES = {
  productView: 'product_view',
  addToCart: 'add_to_cart',
  checkoutStart: 'checkout_start',
};

export function track(type, productId) {
  if (!BASE) return;

  try {
    const url = `${BASE}/api/track`;
    const body = JSON.stringify(productId ? { type, productId } : { type });

    // sendBeacon survives page unloads (checkout_start fires as we navigate).
    if (typeof navigator !== 'undefined' && navigator.sendBeacon) {
      navigator.sendBeacon(url, new Blob([body], { type: 'application/json' }));
      return;
    }

    fetch(url, {
      method: 'POST',
      keepalive: true,
      credentials: 'same-origin',
      headers: { 'Content-Type': 'application/json' },
      body,
    }).catch(() => {});
  } catch {
    /* analytics must never break the shopping flow */
  }
}
