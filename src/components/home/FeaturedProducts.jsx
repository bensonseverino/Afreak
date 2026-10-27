import { useHome } from '../../lib/catalog';
import SectionHeader from '../ui/SectionHeader';
import ProductGrid from '../product/ProductGrid';
import { ContentUnavailable, SectionSkeleton } from '../ui/ContentState';

/** Featured products from the CMS (`is_featured`, published) — §5.2. */
export default function FeaturedProducts() {
  const { home, isPending, isError, refetch } = useHome();
  const products = (home?.featured ?? []).slice(0, 4);

  if (isError) {
    return (
      <section className="py-12 md:py-16" aria-labelledby="featured-heading">
        <div className="max-w-shell mx-auto px-6">
          <SectionHeader label="FEATURED PRODUCTS" />
          <ContentUnavailable label="PRODUCTS UNAVAILABLE" onRetry={() => refetch()} />
        </div>
      </section>
    );
  }

  if (isPending) {
    return (
      <section className="py-12 md:py-16" aria-labelledby="featured-heading">
        <div className="max-w-shell mx-auto px-6">
          <SectionHeader label="FEATURED PRODUCTS" />
          <SectionSkeleton count={4} columns="grid-cols-2 md:grid-cols-3 lg:grid-cols-4" />
        </div>
      </section>
    );
  }

  if (products.length === 0) return null;

  return (
    <section className="py-12 md:py-16" aria-labelledby="featured-heading">
      <div className="max-w-shell mx-auto px-6">
        <SectionHeader label="FEATURED PRODUCTS" />
        <ProductGrid products={products} columns={{ base: 2, md: 3, lg: 4 }} />
      </div>
    </section>
  );
}
