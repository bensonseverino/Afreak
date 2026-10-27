import { useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import { mapImage } from '../lib/catalog';
import { categories as staticCategories } from '../data/products';
import { DEFAULT_FOOTER, DEFAULT_STORE } from '../data/defaults';
import { FREE_SHIPPING_THRESHOLD_CENTS, MENU_FEATURE_FALLBACK } from '../config/nav';
import {
  EXPRESS_SHIPPING,
  FLAT_SHIPPING,
} from '../utils/shipping';

/**
 * Menu data (spec §6.6). Both endpoints are optional: the menu opens instantly
 * with static defaults and upgrades itself when the API answers, so it never
 * blocks on the network.
 *
 * CMS CONNECTION FIX §4.3: the public API speaks camelCase; the snake_case
 * keys are still read for one release so a storefront deployed ahead of the
 * API keeps working.
 */
export const CATEGORIES_KEY = ['menu', 'categories'];
export const PUBLIC_SETTINGS_KEY = ['menu', 'public-settings'];

const MENU_QUERY = {
  staleTime: 15 * 1000,
  gcTime: 30 * 60 * 1000,
  refetchOnWindowFocus: true,
  retry: 0,
};

// The public API speaks camelCase and calls the count `productCount`; menu
// components render `count`. Normalise once here so every consumer agrees.
function normalizeCategory(category) {
  return {
    slug: category.slug,
    name: category.name,
    count: Number(category.count ?? category.productCount ?? 0),
    image: category.image ?? null,
  };
}

// Static list mirrors GET /api/categories, minus the synthetic "all" bucket.
function staticShopCategories() {
  return staticCategories
    .filter((category) => category.slug !== 'all')
    .map(normalizeCategory);
}

export const DEFAULT_PUBLIC_SETTINGS = {
  shipping: {
    thresholdCents: FREE_SHIPPING_THRESHOLD_CENTS,
    flatCents: Math.round(FLAT_SHIPPING * 100),
    expressCents: Math.round(EXPRESS_SHIPPING * 100),
  },
  store: DEFAULT_STORE,
  footer: DEFAULT_FOOTER,
  promoBar: null,
  shippingBanner: null,
  menuFeature: MENU_FEATURE_FALLBACK,
};

const fetchCategories = async () => {
  const res = await api('/categories');
  const list = Array.isArray(res?.data) ? res.data.map(normalizeCategory) : [];
  return list.length > 0 ? list : staticShopCategories();
};

const fetchPublicSettings = async () => {
  const data = (await api('/settings/public')).data || {};
  const shipping = data.shipping || {};
  const store = data.store || {};
  const menuFeature = { ...MENU_FEATURE_FALLBACK, ...(data.menuFeature ?? data.menu_feature ?? {}) };
  return {
    shipping: {
      ...DEFAULT_PUBLIC_SETTINGS.shipping,
      thresholdCents:
        shipping.thresholdCents ?? shipping.threshold_cents ?? DEFAULT_PUBLIC_SETTINGS.shipping.thresholdCents,
      flatCents: shipping.flatCents ?? shipping.flat_cents ?? DEFAULT_PUBLIC_SETTINGS.shipping.flatCents,
      expressCents:
        shipping.expressCents ?? shipping.express_cents ?? DEFAULT_PUBLIC_SETTINGS.shipping.expressCents,
    },
    store: {
      name: store.name || DEFAULT_STORE.name,
      email: store.email ?? '',
      social: { ...DEFAULT_STORE.social, ...(store.social ?? {}) },
    },
    footer: { ...DEFAULT_FOOTER, ...(data.footer ?? {}) },
    promoBar: data.promoBar ?? null,
    shippingBanner: data.shippingBanner ?? data.shipping_banner ?? null,
    currency: data.currency ?? null,
    menuFeature: { ...menuFeature, image: mapImage(menuFeature.image) },
  };
};

export function useCategories() {
  const query = useQuery({
    queryKey: CATEGORIES_KEY,
    queryFn: fetchCategories,
    ...MENU_QUERY,
  });
  return { categories: query.data ?? staticShopCategories(), isPending: query.isPending };
}

export function usePublicSettings() {
  const query = useQuery({
    queryKey: PUBLIC_SETTINGS_KEY,
    queryFn: fetchPublicSettings,
    ...MENU_QUERY,
  });
  return { settings: query.data ?? DEFAULT_PUBLIC_SETTINGS };
}

/** Warms both queries from the hamburger's hover/press, or on first idle. */
export function prefetchMenuData(client) {
  client.prefetchQuery({ queryKey: CATEGORIES_KEY, queryFn: fetchCategories, ...MENU_QUERY });
  client.prefetchQuery({ queryKey: PUBLIC_SETTINGS_KEY, queryFn: fetchPublicSettings, ...MENU_QUERY });
}

/** Convenience wrapper for components that only need to warm the cache. */
export function usePrefetchMenuData() {
  const client = useQueryClient();
  return () => prefetchMenuData(client);
}

/**
 * Shipping rules from the CMS (`settings.shipping`, audit row 5). Values are
 * exposed in cents (authoritative API unit) and euros (display).
 * Checkout still re-quotes server-side, so these only drive the preview.
 */
export function useShippingRates() {
  const { settings } = usePublicSettings();
  const shipping = settings?.shipping ?? {};
  return useMemo(() => {
    const cents = (value, fallback) =>
      typeof value === 'number' && Number.isFinite(value) && value >= 0 ? value : fallback;
    const thresholdCents = cents(shipping.thresholdCents, FREE_SHIPPING_THRESHOLD_CENTS);
    const flatCents = cents(shipping.flatCents, Math.round(FLAT_SHIPPING * 100));
    const expressCents = cents(shipping.expressCents, Math.round(EXPRESS_SHIPPING * 100));
    return {
      thresholdCents,
      flatCents,
      expressCents,
      freeShippingThreshold: thresholdCents / 100,
      flat: flatCents / 100,
      express: expressCents / 100,
    };
  }, [shipping.thresholdCents, shipping.flatCents, shipping.expressCents]);
}

/** Free-shipping threshold in display euros, from the CMS (`settings.shipping`). */
export function useShippingThreshold() {
  return useShippingRates().freeShippingThreshold;
}
