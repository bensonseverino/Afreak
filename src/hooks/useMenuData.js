import { useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import { categories as staticCategories } from '../data/products';
import { FREE_SHIPPING_THRESHOLD_CENTS, MENU_FEATURE_FALLBACK } from '../config/nav';

/**
 * Menu data (spec §6.6). Both endpoints are optional: the menu opens instantly
 * with static defaults and upgrades itself when the API answers, so it never
 * blocks on the network.
 */
export const CATEGORIES_KEY = ['menu', 'categories'];
export const PUBLIC_SETTINGS_KEY = ['menu', 'public-settings'];

const MENU_QUERY = {
  staleTime: 5 * 60 * 1000,
  gcTime: 30 * 60 * 1000,
  refetchOnWindowFocus: false,
  retry: 0,
};

// Static list mirrors GET /api/categories, minus the synthetic "all" bucket.
function staticShopCategories() {
  return staticCategories
    .filter((category) => category.slug !== 'all')
    .map((category) => ({ slug: category.slug, name: category.name, count: category.count }));
}

export const DEFAULT_PUBLIC_SETTINGS = {
  shipping: { threshold_cents: FREE_SHIPPING_THRESHOLD_CENTS },
  menu_feature: MENU_FEATURE_FALLBACK,
};

const fetchCategories = async () => {
  const res = await api('/categories');
  const list = Array.isArray(res?.data) ? res.data : [];
  return list.length > 0 ? list : staticShopCategories();
};

const fetchPublicSettings = async () => {
  const data = (await api('/settings/public')).data || {};
  return {
    shipping: { ...DEFAULT_PUBLIC_SETTINGS.shipping, ...(data.shipping || {}) },
    menu_feature: { ...MENU_FEATURE_FALLBACK, ...(data.menu_feature || {}) },
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
