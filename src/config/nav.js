/**
 * Single source of truth for site navigation.
 * Used by the desktop nav, the mobile/tablet menu and the menu footer, so the
 * storefront can never drift between them.
 * Spec: `AFREAK_HAMBURGER_MENU_SPEC.md` §6.2.
 */

export const primaryNav = [
  { label: 'Shop', to: '/shop', children: 'categories' }, // children come from GET /api/categories
  { label: 'Lookbook', to: '/lookbook' },
  { label: 'Custom print', to: '/shop?customizable=1' },
  { label: 'About', to: '/about' },
  { label: 'Journal', to: '/journal' },
  { label: 'Contact', to: '/contact' },
];

// Always shown at the top of the SHOP accordion.
export const staticShopLinks = [
  { label: 'All products', to: '/shop' },
  { label: 'New arrivals', to: '/shop?new=1' },
];

export const secondaryNav = [
  { label: 'Wishlist', to: '/account/wishlist' },
  { label: 'Orders', to: '/account/orders' },
  { label: 'Size guide', to: '/size-guide' },
  { label: 'Shipping & returns', to: '/shipping-returns' },
  { label: 'FAQ', to: '/faq' },
];

export const menuSocials = [
  { name: 'instagram', label: 'Instagram', href: '#' },
  { name: 'x', label: 'X', href: '#' },
  { name: 'youtube', label: 'YouTube', href: '#' },
  { name: 'pinterest', label: 'Pinterest', href: '#' },
];

// Fallbacks — the menu must open instantly and never block on the network (§6.6).
export const MENU_FEATURE_FALLBACK = {
  eyebrow: 'New collection SS26',
  title: 'Shop the drop',
  url: '/shop?new=1',
  mediaId: null,
};

export const FREE_SHIPPING_THRESHOLD_CENTS = 15000;

export function shippingNote(cents) {
  const value = Number(cents) || FREE_SHIPPING_THRESHOLD_CENTS;
  const euros = Math.round(value / 100);
  return `Free shipping worldwide over €${euros}`;
}

/**
 * Active-link test that understands query-string targets such as
 * `/shop?customizable=1` and nested routes such as `/account/orders/123`.
 */
export function isNavActive(to, { pathname, search }) {
  const [toPath, toSearch] = String(to).split('?');
  if (toSearch) {
    return pathname === toPath && String(search || '').includes(toSearch);
  }
  if (pathname === toPath) return true;
  return toPath !== '/' && pathname.startsWith(`${toPath}/`);
}
