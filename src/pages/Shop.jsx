import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useProducts } from '../lib/catalog';
import FilterSidebar from '../components/shop/FilterSidebar';
import SortSelect from '../components/shop/SortSelect';
import PromoBanner from '../components/shop/PromoBanner';
import ProductGrid from '../components/product/ProductGrid';
import FilterChips from '../components/ui/FilterChips';
import Pagination from '../components/ui/Pagination';
import Placeholder from '../components/ui/Placeholder';
import Button from '../components/ui/Button';
import useCurrency from '../hooks/useCurrency';

const ITEMS_PER_PAGE = 12;

const sortOptions = [
  { value: 'popular', label: 'Popularity' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'newest', label: 'Newest' },
];

const FALLBACK_CATEGORIES = [
  { slug: 'hoodies', name: 'Hoodies' },
  { slug: 'accessories', name: 'Accessories' },
];

export default function Shop({ category: categoryParam }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const { format } = useCurrency();

  // URL facets drive the grid, so every link into /shop is shareable:
  //   ?category=hoodies · ?new=1 · ?customizable=1 · ?q=hoodie · ?page=2
  const urlCategory = searchParams.get('category') || categoryParam || '';
  const urlQuery = searchParams.get('q') || '';
  const urlNew = searchParams.get('new') === '1';
  const urlCustomizable = searchParams.get('customizable') === '1';
  const page = Math.max(1, Number(searchParams.get('page')) || 1);

  const [filters, setFilters] = useState({
    category: urlCategory ? [urlCategory] : [],
    color: null,
    size: [],
    price: null,
    newOnly: urlNew,
    customizable: urlCustomizable,
    q: urlQuery,
  });
  const [sortBy, setSortBy] = useState(urlNew ? 'newest' : 'popular');
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);

  // Re-seed when a link (header, menu, footer) changes the URL facets.
  useEffect(() => {
    setFilters((prev) => ({
      ...prev,
      category: urlCategory ? [urlCategory] : [],
      newOnly: urlNew,
      customizable: urlCustomizable,
      q: urlQuery,
    }));
    if (urlNew) setSortBy('newest');
  }, [urlCategory, urlQuery, urlNew, urlCustomizable]);

  // Any filter or sort change sends us back to the first page. The previous
  // key is tracked so a plain ?page=2 deep link is left alone on mount.
  const filtersKey = `${sortBy}|${JSON.stringify(filters)}`;
  const prevFiltersKey = useRef(filtersKey);
  useEffect(() => {
    if (prevFiltersKey.current === filtersKey) return;
    prevFiltersKey.current = filtersKey;
    if (!searchParams.get('page')) return;
    const next = new URLSearchParams(searchParams);
    next.delete('page');
    setSearchParams(next, { replace: true });
  }, [filtersKey, searchParams, setSearchParams]);

  const params = useMemo(
    () => ({
      category: filters.category?.length ? filters.category : undefined,
      q: filters.q || undefined,
      newOnly: filters.newOnly,
      customizable: filters.customizable,
      colors: filters.color ? [filters.color] : undefined,
      sizes: filters.size?.length ? filters.size : undefined,
      minPriceCents: filters.price ? Math.round(filters.price.from * 100) : undefined,
      maxPriceCents: filters.price ? Math.round(filters.price.to * 100) : undefined,
      sort: sortBy,
      page,
      limit: ITEMS_PER_PAGE,
    }),
    [filters, sortBy, page]
  );

  const { products, meta, isPending } = useProducts(params);

  const facets = useMemo(() => {
    const f = meta.facets;
    if (!f) return undefined;
    return {
      categories: f.categories ?? [],
      colors: f.colors ?? [],
      sizes: f.sizes ?? [],
      priceMin: 0,
      priceMax: Math.max(1, Math.ceil((f.priceRange?.max ?? 20000) / 100)),
    };
  }, [meta.facets]);

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const clearAllFilters = () => {
    setFilters({
      category: [],
      color: null,
      size: [],
      price: null,
      newOnly: false,
      customizable: false,
      q: '',
    });
  };

  const activeChips = useMemo(() => {
    const chips = [];
    if (filters.category?.length) {
      filters.category.forEach((cat) => {
        const category = facets?.categories?.find((c) => c.slug === cat);
        chips.push({ key: `category-${cat}`, label: category?.name?.toUpperCase() || cat.toUpperCase() });
      });
    }
    if (filters.color) {
      chips.push({ key: 'color', label: String(filters.color).toUpperCase() });
    }
    if (filters.size?.length) {
      filters.size.forEach((size) => {
        chips.push({ key: `size-${size}`, label: size });
      });
    }
    if (filters.price) {
      chips.push({ key: 'price', label: `${format(filters.price.from)} – ${format(filters.price.to)}` });
    }
    if (filters.newOnly) {
      chips.push({ key: 'new', label: 'NEW ARRIVALS' });
    }
    if (filters.customizable) {
      chips.push({ key: 'customizable', label: 'CUSTOM PRINT' });
    }
    if (filters.q) {
      chips.push({ key: 'q', label: `“${filters.q.toUpperCase()}”` });
    }
    return chips;
  }, [filters, facets, format]);

  const total = meta.total ?? products.length;
  const totalPages = meta.pages ?? 1;

  const activeCategorySlug = filters.category?.length === 1 ? filters.category[0] : null;
  const categoryName = activeCategorySlug
    ? (facets?.categories?.find((c) => c.slug === activeCategorySlug)?.name?.toUpperCase() ||
        activeCategorySlug.toUpperCase())
    : 'ALL PRODUCTS';

  const paginationQuery = [
    activeCategorySlug ? `category=${activeCategorySlug}` : '',
    filters.q ? `q=${encodeURIComponent(filters.q)}` : '',
    filters.newOnly ? 'new=1' : '',
    filters.customizable ? 'customizable=1' : '',
  ]
    .filter(Boolean)
    .join('&');

  const otherCategories = (facets?.categories?.length ? facets.categories : FALLBACK_CATEGORIES)
    .filter((c) => c.slug === 'hoodies' || c.slug === 'accessories')
    .slice(0, 2);

  return (
    <div className="min-h-screen bg-paper">
      {/* Breadcrumb */}
      <nav className="border-b border-line bg-mist" aria-label="Breadcrumb">
        <div className="max-w-wide mx-auto px-6 lg:px-8 py-4">
          <ol className="flex items-center gap-2 font-sans text-[12px]">
            <li>
              <Link to="/" className="text-graphite hover:text-ink transition-colors link-underline">HOME</Link>
            </li>
            <li className="text-graphite">/</li>
            <li>
              <Link to="/shop" className="text-graphite hover:text-ink transition-colors link-underline">SHOP</Link>
            </li>
            {categoryParam || activeCategorySlug ? (
              <>
                <li className="text-graphite">/</li>
                <li className="text-ink font-medium uppercase tracking-label">{categoryName}</li>
              </>
            ) : null}
          </ol>
        </div>
      </nav>

      {/* Promo Banner */}
      <PromoBanner />

      {/* Main Content */}
      <div className="max-w-wide mx-auto px-6 lg:px-8 py-10 lg:py-12">
        <div className="grid lg:grid-cols-[240px_1fr] gap-10">
          {/* Sidebar */}
          <FilterSidebar
            filters={filters}
            onFilterChange={handleFilterChange}
            onClearAll={clearAllFilters}
            facets={facets}
            isOpen={filterDrawerOpen}
            onClose={() => setFilterDrawerOpen(false)}
            onOpen={() => setFilterDrawerOpen(true)}
          />

          {/* Product Area */}
          <div>
            {/* Toolbar */}
            <div className="mb-6 lg:mb-8">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
                <div className="font-sans text-[13px] text-graphite">
                  Showing <span className="font-semibold text-ink">{products.length}</span> of{' '}
                  <span className="font-semibold text-ink">{total}</span> results
                </div>
                <SortSelect value={sortBy} onChange={setSortBy} options={sortOptions} />
              </div>

              {/* Applied Filter Chips */}
              <FilterChips chips={activeChips} onRemove={(key) => {
                if (key.startsWith('category-')) {
                  const cat = key.replace('category-', '');
                  handleFilterChange('category', filters.category.filter(c => c !== cat));
                } else if (key === 'color') {
                  handleFilterChange('color', null);
                } else if (key.startsWith('size-')) {
                  const size = key.replace('size-', '');
                  handleFilterChange('size', filters.size.filter(s => s !== size));
                } else if (key === 'price') {
                  handleFilterChange('price', null);
                } else if (key === 'new') {
                  handleFilterChange('newOnly', false);
                } else if (key === 'customizable') {
                  handleFilterChange('customizable', false);
                } else if (key === 'q') {
                  handleFilterChange('q', '');
                }
              }} />
            </div>

            {/* Product Grid */}
            {isPending && products.length === 0 ? (
              <div className="py-24 text-center font-sans text-[13px] text-graphite">
                Loading products…
              </div>
            ) : (
              <ProductGrid products={products} columns={{ base: 2, lg: 3 }} />
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-10 lg:mt-12">
                <Pagination
                  currentPage={page}
                  totalPages={totalPages}
                  baseUrl="/shop"
                  query={paginationQuery}
                />
              </div>
            )}

            {/* Other Categories - Optional */}
            {otherCategories.length > 0 && (
              <div className="mt-16 lg:mt-20 space-y-6" aria-label="Other categories">
                {otherCategories.map((cat) => (
                  <Link
                    key={cat.slug}
                    to={`/shop/${cat.slug}`}
                    className="block bg-mist border border-line p-6 lg:p-8 flex flex-col lg:flex-row lg:items-center gap-6 lg:gap-8"
                  >
                    <div className="flex-1">
                      <h3 className="font-display font-extrabold uppercase text-xl lg:text-2xl tracking-tight text-ink mb-2">
                        {cat.name?.toUpperCase()}
                      </h3>
                      <p className="font-sans text-graphite text-sm lg:text-base">
                        Discover our latest {cat.name?.toLowerCase()} collection with new styles dropping weekly.
                      </p>
                    </div>
                    <div className="flex items-center gap-4 mt-6 lg:mt-0 lg:flex-shrink-0">
                      <Button variant="outline" className="w-full lg:w-auto">
                        SHOP {cat.name?.toUpperCase()}
                      </Button>
                      <div className="w-32 h-32 lg:w-40 lg:h-40 bg-paper flex-shrink-0 overflow-hidden">
                        <Placeholder ratio="aspect-square" label={cat.name?.toUpperCase() || 'CATEGORY'} />
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
