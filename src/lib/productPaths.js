/**
 * Single source of truth for storefront path templates.
 *
 * Keeps product links consistent across cards, cart, showcase, pair-it-with,
 * wishlist, cart/order lines, search results, emails and sitemap. When a route
 * ever changes (e.g. /product/:slug -> /shop/:slug), change it here and the
e2e CMS-connection check in scripts/e2e-cms-check.mjs catches any mismatch.
 *
 * A product without a slug never produces a link — render the card without one
 * and console.warn so it can never become /product/undefined.
 */
export const paths = {
  product: (slug) => {
    if (!slug) {
      console.warn('paths.product called with a missing slug — card rendered without a link');
      return null;
    }
    return `/product/${encodeURIComponent(slug)}`;
  },
};
