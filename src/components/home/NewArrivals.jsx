import { useHome } from '../../lib/catalog';
import SectionHeader from '../ui/SectionHeader';
import ProductGrid from '../product/ProductGrid';

export default function NewArrivals() {
  const { home } = useHome();
  const arrivals = home?.newArrivals ?? [];
  // Pad with featured pieces when the catalogue has fewer than five new drops.
  const filler = (home?.featured ?? []).filter((p) => !arrivals.some((a) => a.id === p.id));
  const products = [...arrivals, ...filler].slice(0, 5);

  if (products.length === 0) return null;

  return (
    <section className="py-12 md:py-16" aria-labelledby="new-arrivals-heading">
      <div className="max-w-shell mx-auto px-6">
        <SectionHeader label="NEW ARRIVALS" />
        <ProductGrid
          products={products}
          columns={{ base: 2, md: 3, lg: 5 }}
          className="md:grid-cols-3 lg:grid-cols-5"
        />
      </div>
    </section>
  );
}
