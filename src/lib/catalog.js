/**
 * Catalog + CMS content data layer.
 *
 * Fetches from the AFREAK API (`VITE_API_BASE`) and maps every response into
 * the same product shape the storefront components already render, so the
 * views stay untouched and only the data source changes.
 *
 * Money is converted here: the API speaks integer cents, the storefront
 * speaks euros (see `utils/format`).
 *
 * CMS content (hero, lookbook, promo bar, showcase, settings) is fetched
 * through the hooks at the bottom of this file and typed in `lib/types.js`.
 */
import { useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from './api';
import {
  DEFAULT_SHIPPING_RULES,
  DEFAULT_STORE,
  DEFAULT_SHOWCASE,
  DEFAULT_SHIPPING_BANNER,
  DEFAULT_PROMO_BAR,
  DEFAULT_FOOTER,
  DEFAULT_MENU_FEATURE,
} from '../data/defaults';

export const API_BASE = import.meta.env?.VITE_API_BASE ?? '';

/** The API returns root-relative media URLs; the storefront is a separate origin. */
export function assetUrl(url) {
  if (!url) return null;
  if (/^(https?:)?\/\//i.test(url) || url.startsWith('data:')) return url;
  return `${API_BASE}${url}`;
}

const euros = (cents) => (cents == null ? undefined : cents / 100);

// Canonical size run used by the storefront design; unknown labels sort last.
const SIZE_ORDER = ['XXS', 'XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL', '4XL'];
const sizeRank = (label) => {
  const i = SIZE_ORDER.indexOf(label);
  return i === -1 ? SIZE_ORDER.length : i;
};

/* ------------------------------------------------------------------ *
 * Response mappers
 * ------------------------------------------------------------------ */

/** GET /products card → storefront product. */
export function cardToProduct(card) {
  if (!card) return null;
  const image = assetUrl(card.image?.url);
  const colorImages = new Map();
  if (card.colorImages) {
    for (const [k, v] of Object.entries(card.colorImages)) {
      colorImages.set(k, assetUrl(v));
    }
  }
  const minPrice = card.priceFromCents ? euros(card.priceFromCents) : null;
  return {
    id: card.id,
    slug: card.slug,
    name: card.name,
    price: euros(card.price_cents) ?? 0,
    oldPrice: euros(card.old_price_cents),
    category: card.category?.slug ?? '',
    categoryName: card.category?.name ?? '',
    isNew: Boolean(card.isNew),
    featured: Boolean(card.featured),
    rating: card.rating ?? 0,
    reviewCount: card.reviewCount ?? 0,
    colors: card.colors ?? [],
    images: image ? [image] : [],
    accessories: [],
    customizable: false,
    colorImages,
    priceFrom: minPrice,
    soldOut: Boolean(card.soldOut),
  };
}

export function cardsToProducts(list) {
  return (Array.isArray(list) ? list : []).map(cardToProduct).filter(Boolean);
}

/** GET /products/:slug detail → storefront product. */
export function detailToProduct(detail) {
  if (!detail) return null;

  // Build color options from options array (if present) or fallback to colors
  const colorOption = detail.options?.find((o) => o.type === 'color');
  const sizeOption = detail.options?.find((o) => o.type === 'size');
  const colorsFromOptions = colorOption
    ? colorOption.values.map((v) => ({
        name: v.value,
        hex: v.swatchHex ?? '#000000',
        swatchImageUrl: v.swatchImageUrl,
        optionValueId: v.id,
      }))
    : detail.colors ?? [];

  // Build image map per color (primary images)
  const colorImages = new Map();
  if (detail.images?.length) {
    for (const img of detail.images) {
      const colorKey = img.colorName || img.optionValueId;
      if (colorKey && !colorImages.has(colorKey)) {
        colorImages.set(colorKey, assetUrl(img.url));
      }
    }
  }

  // Sizes from option or fallback
  const sizesFromOption = sizeOption
    ? sizeOption.values.map((v) => v.value)
    : detail.sizes ?? [];

  // Map variants with new fields
  const variants = (detail.variants ?? []).map((v) => ({
    ...v,
    colorName: v.color_name ?? v.colorName,
    size: v.size,
    price: euros(v.priceCents ?? v.price_cents),
    compareAtPrice: euros(v.compareAtPriceCents ?? v.compare_at_price_cents),
    optionValueIds: v.optionValueIds ?? v.option_value_ids ?? [],
    inStock: v.inStock ?? (v.trackStock ? v.stock > 0 : true),
    active: v.isActive ?? v.is_active ?? true,
    trackStock: v.trackStock ?? v.track_stock ?? true,
  }));

  return {
    id: detail.id,
    slug: detail.slug,
    name: detail.name,
    price: euros(detail.price_cents) ?? 0,
    oldPrice: euros(detail.old_price_cents),
    category: detail.category?.slug ?? '',
    categoryName: detail.category?.name ?? '',
    isNew: Boolean(detail.isNew),
    featured: Boolean(detail.featured),
    customizable: Boolean(detail.customizable),
    printAddonCents: detail.printAddonCents ?? 0,
    shortDescription: detail.shortDescription ?? '',
    description: detail.description ?? '',
    seo: {
      title: detail.seo?.title ?? null,
      description: detail.seo?.description ?? null,
    },
    features: Array.isArray(detail.features) ? detail.features : [],
    rating: detail.rating?.average ?? 0,
    reviewCount: detail.rating?.count ?? 0,
    ratingDistribution: detail.rating?.distribution ?? null,
    sizeChart: detail.sizeChart ?? null,
    images: (detail.images ?? []).map((img) => assetUrl(img.url)).filter(Boolean),
    colors: colorsFromOptions,
    sizes: sizesFromOption,
    variants,
    pairWith: cardsToProducts(detail.pairWith),
    accessories: cardsToProducts(detail.accessories).map((a) => ({
      ...a,
      image: a.images[0] ?? null,
    })),
    colorImages,
    options: detail.options ?? [],
  };
}

/* ------------------------------------------------------------------ *
 * Variant helpers — the cart needs a real `variantId` to order.
 * ------------------------------------------------------------------ */

/** Sizes with stock, narrowed to one colour when the detail carries variants. */
export function sizesForColor(product, colorName) {
  const variants = product?.variants ?? [];
  const scoped = colorName
    ? variants.filter(
        (v) =>
          v.colorName === colorName ||
          (v.optionValueIds && v.optionValueIds.length && v.colorName === colorName),
      )
    : variants;
  if (scoped.length === 0) {
    // Card-shaped products (no variants) keep whatever sizes they were given.
    return (colorName ? [] : product?.sizes ?? []).map((label) => ({
      label: typeof label === 'string' ? label : label.label,
      stock: typeof label === 'object' && label.stock != null ? label.stock : Infinity,
      available: typeof label === 'object' ? label.available !== false : true,
    }));
  }
  const totals = new Map();
  for (const variant of scoped) {
    const isActive = variant.active !== false;
    if (!isActive) continue;
    const trackStock = variant.trackStock !== false;
    const stock = trackStock ? variant.stock : Infinity;
    totals.set(variant.size, (totals.get(variant.size) ?? 0) + (trackStock ? stock : 1));
  }
  // The API orders variants alphabetically; restore the storefront's size run.
  // Sold-out sizes stay in the list so the PDP can offer "notify me" (row 21).
  return [...totals.entries()]
    .map(([label, stock]) => ({ label, stock, available: stock > 0 }))
    .sort((a, b) => sizeRank(a.label) - sizeRank(b.label));
}

/** Resolve the API variant id for a colour/size pair. */
export function findVariantId(product, colorName, size) {
  const variants = product?.variants ?? [];
  const exact = variants.find(
    (v) => (!colorName || v.colorName === colorName) && (!size || v.size === size),
  );
  return exact?.id ?? null;
}

/* ------------------------------------------------------------------ *
 * Queries
 * ------------------------------------------------------------------ */

/**
 * Shared query policy (CMS CONNECTION FIX §6.4): content is revalidated on
 * focus/reconnect and at most 15 s old, so an admin save is never more than a
 * page refresh away.
 */
const CATALOG_QUERY = {
  staleTime: 15 * 1000,
  gcTime: 15 * 60 * 1000,
  refetchOnWindowFocus: true,
  refetchOnReconnect: true,
  retry: 1,
};

const SORT_MAP = {
  popular: 'popular',
  newest: 'newest',
  'price-asc': 'price_asc',
  'price-desc': 'price_desc',
};

export function buildProductQuery(params = {}) {
  const sp = new URLSearchParams();
  if (params.category && params.category !== 'all') sp.set('category', params.category);
  if (params.q) sp.set('q', params.q);
  if (params.sort && SORT_MAP[params.sort]) sp.set('sort', SORT_MAP[params.sort]);
  if (params.page && params.page > 1) sp.set('page', String(params.page));
  if (params.limit) sp.set('limit', String(params.limit));
  if (params.newOnly) sp.set('new', '1');
  if (params.featured) sp.set('featured', '1');
  if (params.customizable) sp.set('customizable', '1');
  if (params.colors?.length) sp.set('colors', params.colors.join(','));
  if (params.sizes?.length) sp.set('sizes', params.sizes.join(','));
  if (params.minPriceCents != null) sp.set('minPrice', String(params.minPriceCents));
  if (params.maxPriceCents != null) sp.set('maxPrice', String(params.maxPriceCents));
  return sp.toString();
}

export function useProducts(params = {}) {
  const query = buildProductQuery(params);
  const result = useQuery({
    queryKey: ['catalog', 'products', query],
    queryFn: async () => {
      const res = await api(query ? `/products?${query}` : '/products');
      return { products: cardsToProducts(res.data), meta: res.meta ?? {} };
    },
    placeholderData: (prev) => prev,
    ...CATALOG_QUERY,
  });
  return {
    products: result.data?.products ?? [],
    meta: result.data?.meta ?? {},
    isPending: result.isPending,
    isFetching: result.isFetching,
    error: result.error,
  };
}

/** Shared detail cache so pair-with/accessory lookups don't refetch. */
const detailCache = new Map();

export function fetchProductDetail(slug) {
  if (!slug) return Promise.resolve(null);
  if (!detailCache.has(slug)) {
    const promise = api(`/products/${encodeURIComponent(slug)}`)
      .then((res) => detailToProduct(res.data))
      .catch((err) => {
        detailCache.delete(slug);
        throw err;
      });
    detailCache.set(slug, promise);
  }
  return detailCache.get(slug);
}

export function useProduct(slug) {
  const result = useQuery({
    queryKey: ['catalog', 'product', slug],
    enabled: Boolean(slug),
    queryFn: async () => {
      const product = await fetchProductDetail(slug);

      // Pair-with cards carry no variants, so hydrate them for quick-add.
      const pairWith = await Promise.all(
        (product.pairWith ?? []).map((card) =>
          fetchProductDetail(card.slug).catch(() => card),
        ),
      );

      let related = [];
      try {
        const res = await api(`/products?category=${encodeURIComponent(product.category)}&limit=5`);
        related = cardsToProducts(res.data)
          .filter((p) => p.id !== product.id)
          .slice(0, 4);
      } catch {
        /* related is decoration — never block the PDP on it */
      }

      return { ...product, pairWith, related };
    },
    retry: (n, err) => err.status !== 404 && n < 2,
    ...CATALOG_QUERY,
  });
  return {
    product: result.data ?? null,
    isPending: result.isPending,
    isFetching: result.isFetching,
    notFound: result.isError && result.error?.status === 404,
    error: result.error,
  };
}

/* ------------------------------------------------------------------ *
 * CMS content (home, lookbook, settings)
 * ------------------------------------------------------------------ */

export function mapImage(image) {
  if (!image?.url) return null;
  return {
    url: assetUrl(image.url),
    alt: image.alt ?? null,
    width: image.width ?? null,
    height: image.height ?? null,
  };
}

export function mapHeroSlide(slide) {
  return {
    id: slide.id,
    eyebrow: slide.eyebrow ?? null,
    title: slide.title ?? '',
    subtitle: slide.subtitle ?? null,
    ctaLabel: slide.ctaLabel ?? null,
    ctaUrl: slide.ctaUrl ?? null,
    image: mapImage(slide.image),
  };
}

export function mapLookbookItem(item) {
  return {
    id: item.id,
    label: item.caption ?? '',
    linkUrl: item.linkUrl ?? null,
    image: mapImage(item.image),
  };
}

/** Menu tile: defaults + CMS values, with the media URL made absolute. */
export function mapMenuFeature(feature) {
  const value = { ...DEFAULT_MENU_FEATURE, ...(feature ?? {}) };
  return { ...value, image: mapImage(value.image) };
}

/** Showcase = a product card plus the CMS description/feature highlights. */
export function mapShowcase(card) {
  if (!card) return null;
  const product = cardToProduct(card);
  if (!product) return null;
  return {
    ...product,
    image: mapImage(card.image),
    shortDescription: card.shortDescription ?? null,
    description: card.description ?? '',
    features: Array.isArray(card.features) ? card.features : [],
  };
}

/**
 * When `content_version` moves, an admin saved something: drop the catalogue
 * caches so prices, stock and product flags follow the content (§6.4).
 */
let lastContentVersion = null;

function useContentVersionSync(version) {
  const queryClient = useQueryClient();
  useEffect(() => {
    if (typeof version !== 'number') return;
    if (lastContentVersion === null) {
      lastContentVersion = version;
      return;
    }
    if (version === lastContentVersion) return;
    lastContentVersion = version;
    queryClient.invalidateQueries({ queryKey: ['catalog'] });
  }, [queryClient, version]);
}

/** GET /home — single source for every CMS-driven homepage section (§5.1). */
export function useHome() {
  const result = useQuery({
    queryKey: ['catalog', 'home'],
    queryFn: async () => {
      const res = await api('/home');
      const d = res.data ?? {};
      const emptyStore =
        !d.showcase && !d.featured?.length && !d.newArrivals?.length;
      return {
        version: typeof d.version === 'number' ? d.version : null,
        promoBar: d.promoBar ?? DEFAULT_PROMO_BAR,
        shippingBanner: d.shippingBanner ?? DEFAULT_SHIPPING_BANNER,
        footer: d.footer ?? DEFAULT_FOOTER,
        menuFeature: mapMenuFeature(d.menuFeature),
        showcase: mapShowcase(d.showcase) ?? (emptyStore ? DEFAULT_SHOWCASE : null),
        featured: cardsToProducts(d.featured),
        newArrivals: cardsToProducts(d.newArrivals),
        heroSlides: (d.heroSlides ?? []).map(mapHeroSlide),
        lookbook: (d.lookbook ?? []).map(mapLookbookItem),
      };
    },
    ...CATALOG_QUERY,
  });

  useContentVersionSync(result.data?.version);

  return {
    home: result.data ?? null,
    isPending: result.isPending,
    isError: result.isError,
    error: result.error,
    refetch: result.refetch,
  };
}

/** GET /lookbook — the full lookbook page (§4.4). */
export function useLookbook() {
  const result = useQuery({
    queryKey: ['catalog', 'lookbook'],
    queryFn: async () => {
      const res = await api('/lookbook');
      return (Array.isArray(res.data) ? res.data : []).map(mapLookbookItem);
    },
    ...CATALOG_QUERY,
  });
  return {
    items: result.data ?? [],
    isPending: result.isPending,
    isError: result.isError,
    error: result.error,
    refetch: result.refetch,
  };
}

/** GET /settings/public — shipping rules, promo bar, banner, footer, menu tile. */
export function useSettings() {
  const result = useQuery({
    queryKey: ['catalog', 'settings'],
    queryFn: async () => {
      const res = await api('/settings/public');
      const d = res.data ?? {};
      const shipping = d.shipping ?? {};
      const store = d.store ?? {};
      return {
        store: {
          name: store.name ?? DEFAULT_STORE.name,
          email: store.email ?? '',
          social: { ...DEFAULT_STORE.social, ...(store.social ?? {}) },
        },
        promoBar: d.promoBar ?? null,
        shipping: {
          thresholdCents: shipping.thresholdCents ?? shipping.threshold_cents ?? DEFAULT_SHIPPING_RULES.thresholdCents,
          flatCents: shipping.flatCents ?? shipping.flat_cents ?? DEFAULT_SHIPPING_RULES.flatCents,
          expressCents: shipping.expressCents ?? shipping.express_cents ?? DEFAULT_SHIPPING_RULES.expressCents,
        },
        shippingBanner: d.shippingBanner ?? null,
        footer: d.footer ?? null,
        menuFeature: mapMenuFeature(d.menuFeature ?? d.menu_feature),
        currency: d.currency ?? null,
      };
    },
    ...CATALOG_QUERY,
  });
  return {
    settings: result.data ?? null,
    isPending: result.isPending,
    isError: result.isError,
    error: result.error,
    refetch: result.refetch,
  };
}

/**
 * The cart only knows colour/size, not variant ids. Resolve them before
 * quoting or ordering — one detail request per distinct slug, cached.
 */
export async function resolveVariantId(line) {
  if (line.variantId) return line.variantId;
  if (!line.slug) return null;
  try {
    const product = await fetchProductDetail(line.slug);
    const variants = product?.variants ?? [];
    const exact = variants.find(
      (v) => v.colorName === line.color && v.size === line.size,
    );
    const fallback = variants.find((v) => v.stock > 0) ?? variants[0];
    return (exact ?? fallback)?.id ?? null;
  } catch {
    return null;
  }
}
