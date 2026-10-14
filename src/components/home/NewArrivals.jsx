import { getNewArrivals, getProductsByCategory } from '../../data/products';
import SectionHeader from '../ui/SectionHeader';
import ProductGrid from '../product/ProductGrid';

export default function NewArrivals() {
  const newProducts = getNewArrivals();
  // Pad with other products if less than 5
  const allProducts = getProductsByCategory('all');
  const products = newProducts.length >= 5 
    ? newProducts.slice(0, 5) 
    : [...newProducts, ...allProducts.filter(p => !p.isNew).slice(0, 5 - newProducts.length)];

  return (
    <section className="py-12 md:py-16" aria-labelledby="new-arrivals-heading">
      <div className="max-w-shell mx-auto px-6">
        <SectionHeader label="NEW ARRIVALS" />
        <ProductGrid 
          products={products.slice(0, 5)} 
          columns={{ base: 2, md: 3, lg: 5 }} 
          className="md:grid-cols-3 lg:grid-cols-5"
        />
      </div>
    </section>
  );
}