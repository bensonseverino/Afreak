import ProductCard from './ProductCard';

export default function ProductGrid({ 
  products = [], 
  columns = { base: 2, md: 3, lg: 4, xl: 5 }, 
  gap = 'gap-4 md:gap-5',
  className = '',
  ...props 
}) {
  const colClasses = [
    `grid-cols-${columns.base || 2}`,
    columns.md && `md:grid-cols-${columns.md}`,
    columns.lg && `lg:grid-cols-${columns.lg}`,
    columns.xl && `xl:grid-cols-${columns.xl}`,
  ].filter(Boolean).join(' ');

  return (
    <div className={`grid ${colClasses} ${gap} ${className}`} {...props} role="list">
      {products.map(product => (
        <ProductCard key={product.id} product={product} />
      ))}
      {products.length === 0 && (
        <div className="col-span-full py-16 text-center text-graphite">
          No products found.
        </div>
      )}
    </div>
  );
}