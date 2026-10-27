/**
 * Debug affordances (CMS CONNECTION FIX §5.3).
 *
 * Fallback content and CMS diagnostics are noisy in development and on
 * `?debug=1`, and silent in production — a broken CMS should be visible to
 * whoever is looking for it, not to shoppers.
 */
export function isDebugMode() {
  if (import.meta.env?.DEV) return true;
  if (typeof window === 'undefined') return false;
  try {
    return new URLSearchParams(window.location.search).get('debug') === '1';
  } catch {
    return false;
  }
}

/** One-line CMS summary for the browser console (used with `?debug=1`). */
export function logCmsInfo(payload) {
  if (!isDebugMode()) return;
  console.info('[cms]', payload);
}
