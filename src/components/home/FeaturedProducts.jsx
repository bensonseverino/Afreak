import { getFeaturedProducts } from '../../data/products';
import SectionHeader from '../ui/SectionHeader';
import ProductGrid from '../product/ProductGrid';

export default function FeaturedProducts() {
  const products = getFeaturedProducts(4);

  return (
    <section className="py-12 md:py-16" aria-labelledby="featured-heading">
      <div className="max-w-shell mx-auto px-6">
        <SectionHeader label="FEATURED PRODUCTS" />
        <ProductGrid products={products} columns={{ base: 2, md: 3, lg: 4 }} />
      </div>
    </section>
  );
}