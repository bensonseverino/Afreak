/**
 * First-run fallback content (CMS CONNECTION FIX §5.3).
 *
 * This is the ONLY place in the storefront allowed to carry hard-coded
 * hero / lookbook / showcase / settings content. Every component reads the API
 * first and falls back to these values only when the API answered with an empty
 * array (a brand-new store). When the API *errors*, sections show an error
 * state instead — a broken CMS must never look like working content.
 *
 * Fallbacks announce themselves on `?debug=1` and in development.
 */

export const DEFAULT_HERO_SLIDES = [
  {
    id: 'default-1',
    eyebrow: 'NEW COLLECTION SS26',
    title: 'DESIGNED FOR THE UNDEFINED.',
    subtitle: 'Minimal design. Maximum impact. Built for the present. Worn into the future.',
    ctaLabel: 'SHOP NOW',
    ctaUrl: '/shop',
    image: null,
  },
  {
    id: 'default-2',
    eyebrow: 'SPRING SUMMER 2026',
    title: 'CRAFTED FOR THE UNBOUND.',
    subtitle: 'Precision tailoring meets street sensibility. Every stitch tells a story.',
    ctaLabel: 'SHOP NOW',
    ctaUrl: '/shop',
    image: null,
  },
  {
    id: 'default-3',
    eyebrow: 'LIMITED EDITION DROP',
    title: 'DEFINED BY THE UNSEEN.',
    subtitle: 'Exclusive pieces for those who define their own path. Limited quantities.',
    ctaLabel: 'SHOP NOW',
    ctaUrl: '/shop',
    image: null,
  },
];

export const DEFAULT_LOOKBOOK = [
  { id: 'default-1', label: 'LOOKBOOK 01', linkUrl: '/lookbook', image: null },
  { id: 'default-2', label: 'LOOKBOOK 02', linkUrl: '/lookbook', image: null },
  { id: 'default-3', label: 'LOOKBOOK 03', linkUrl: '/lookbook', image: null },
  { id: 'default-4', label: 'LOOKBOOK 04', linkUrl: '/lookbook', image: null },
  { id: 'default-5', label: 'LOOKBOOK 05', linkUrl: '/lookbook', image: null },
  { id: 'default-6', label: 'LOOKBOOK 06', linkUrl: '/lookbook', image: null },
  { id: 'default-7', label: 'LOOKBOOK 07', linkUrl: '/lookbook', image: null },
  { id: 'default-8', label: 'LOOKBOOK 08', linkUrl: '/lookbook', image: null },
];

export const DEFAULT_SHOWCASE = {
  name: 'UTILITY HOODIE',
  slug: 'utility-hoodie',
  price: 17400,
  description:
    'The Utility Hoodie is engineered for daily performance. Water-resistant shell, multiple utility pockets, and adjustable hem for a customizable fit.',
  features: [
    { icon: 'drop', title: 'WATER RESISTANT' },
    { icon: 'pocket', title: 'MULTI POCKETS' },
    { icon: 'focusCorners', title: 'ADJUSTABLE FIT' },
  ],
  image: null,
};

export const DEFAULT_SHIPPING_BANNER = {
  title: 'FREE SHIPPING WORLDWIDE',
  subtitle: 'On all orders over KSh 15,000',
  ctaLabel: 'SHOP NOW',
  ctaUrl: '/shop',
};

export const DEFAULT_PROMO_BAR = {
  active: true,
  text: 'FREE SHIPPING WORLDWIDE ON ORDERS OVER KSH 15,000',
};

export const DEFAULT_FOOTER = {
  blurb:
    'AFREAK is a custom-print streetwear brand focused on bold graphics, quality blanks and future-ready essentials.',
  social: { instagram: '', tiktok: '', x: '', youtube: '', pinterest: '' },
};

export const DEFAULT_MENU_FEATURE = {
  eyebrow: 'New collection SS26',
  title: 'Shop the drop',
  url: '/shop?new=1',
  image: null,
};

export const DEFAULT_STORE = {
  name: 'AFREAK',
  email: '',
  social: { instagram: '', tiktok: '', x: '', youtube: '', pinterest: '' },
};

export const DEFAULT_SHIPPING_RULES = {
  thresholdCents: 1500000,
  flatCents: 50000,
  expressCents: 150000,
};
