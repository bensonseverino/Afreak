/**
 * Single source of truth for storefront path templates.
 *
 * Keeps product links consistent across cards, cart, showcase, pair-it-with,
 * and the PDP route. When a route ever changes (e.g. /product/:slug ->
 * /shop/:slug), change it here and the e2e CMS-connection check in
 * scripts/e2e-cms-check.mjs catches any mismatch.
 */
export const paths = {
  product: (slug) => `/product/${slug}`,
};
