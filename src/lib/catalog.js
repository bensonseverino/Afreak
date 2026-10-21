/**
 * Catalog data layer.
 *
 * Fetches from the AFREAK API (`VITE_API_BASE`) and maps every response into
 * the same product shape the storefront components already render, so the
 * views stay untouched and only the data source changes.
 *
 * Money is converted here: the API speaks integer cents, the storefront
 * speaks euros (see `utils/format`).
 */
import { useQuery } from '@tanstack/react-query';
import { api } from './api';

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
    return colorName ? [] : product?.sizes ?? [];
  }
  const totals = new Map();
  for (const variant of scoped) {
    const isActive = variant.active !== false;
    const trackStock = variant.trackStock !== false;
    const stock = trackStock ? variant.stock : Infinity;
    if (!isActive || (trackStock && stock <= 0)) continue;
    totals.set(variant.size, (totals.get(variant.size) ?? 0) + (trackStock ? variant.stock : 1));
  }
  // The API orders variants alphabetically; restore the storefront's size run.
  return [...totals.entries()]
    .map(([label, stock]) => ({ label, stock }))
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

const CATALOG_QUERY = {
  staleTime: 60 * 1000,
  gcTime: 15 * 60 * 1000,
  refetchOnWindowFocus: false,
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

export function useHome() {
  const result = useQuery({
    queryKey: ['catalog', 'home'],
    queryFn: async () => {
      const res = await api('/home');
      const d = res.data ?? {};
      return {
        promoBar: d.promoBar ?? null,
        shippingBanner: d.shippingBanner ?? null,
        footer: d.footer ?? null,
        showcase: cardToProduct(d.showcase),
        featured: cardsToProducts(d.featured),
        newArrivals: cardsToProducts(d.newArrivals),
        heroSlides: (d.heroSlides ?? []).map((slide) => ({
          id: slide.id,
          eyebrow: slide.eyebrow,
          title: slide.title,
          subtitle: slide.subtitle,
          ctaLabel: slide.ctaLabel,
          ctaUrl: slide.ctaUrl,
          image: assetUrl(slide.image?.url),
        })),
        lookbook: (d.lookbook ?? []).map((item) => ({
          id: item.id,
          label: item.caption ?? '',
          linkUrl: item.linkUrl ?? null,
          image: assetUrl(item.image?.url),
        })),
      };
    },
    ...CATALOG_QUERY,
  });
  return { home: result.data ?? null, isPending: result.isPending };
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
