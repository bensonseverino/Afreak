import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getProductBySlug, getProductsByCategory } from '../data/products';
import Gallery from '../components/pdp/Gallery';
import ProductInfo from '../components/pdp/ProductInfo';
import SectionHeader from '../components/ui/SectionHeader';
import ProductGrid from '../components/product/ProductGrid';
import Placeholder from '../components/ui/Placeholder';
import Badge from '../components/ui/Badge';
import Icon from '../components/ui/Icon';
import { Link } from 'react-router-dom';

export default function ProductDetail() {
  const { slug } = useParams();
  const product = getProductBySlug(slug);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  if (!product) {
    return (
      <div className="max-w-wide mx-auto px-6 py-20 text-center">
        <h1 className="font-display font-bold uppercase text-3xl mb-4">PRODUCT NOT FOUND</h1>
        <p className="text-graphite mb-8">The product you're looking for doesn't exist.</p>
        <Link to="/shop" className="font-sans font-semibold uppercase text-xs tracking-label text-ink underline">BACK TO SHOP</Link>
      </div>
    );
  }

  // Related products from same category
  const relatedProducts = getProductsByCategory(product.category)
    .filter(p => p.id !== product.id)
    .slice(0, 4);

  const galleryImages = [null, null, null]; // placeholder images
  const badges = [
    ...(product.isNew ? [{ type: 'new', label: 'NEW' }] : []),
    ...(product.oldPrice ? [{ type: 'sale', label: `-${Math.round((1 - product.price / product.oldPrice) * 100)}%` }] : []),
  ];

  return (
    <div className="min-h-screen bg-paper">
      {/* Breadcrumb */}
      <nav className="border-b border-line bg-mist" aria-label="Breadcrumb">
        <div className="max-w-wide mx-auto px-6 lg:px-8 py-4">
          <ol className="flex items-center gap-2 font-sans text-[12px]">
            <li><Link to="/" className="text-graphite hover:text-ink link-underline">HOME</Link></li>
            <li className="text-graphite">/</li>
            <li><Link to="/shop" className="text-graphite hover:text-ink link-underline">SHOP</Link></li>
            <li className="text-graphite">/</li>
            <li><Link to={`/shop/${product.category}`} className="text-graphite hover:text-ink link-underline uppercase tracking-label">{product.category.toUpperCase()}</Link></li>
            <li className="text-graphite">/</li>
            <li className="text-ink font-medium uppercase tracking-label truncate max-w-[200px]">{product.name.toUpperCase()}</li>
          </ol>
        </div>
      </nav>

      {/* Product Detail */}
      <div className="max-w-wide mx-auto px-6 lg:px-8 py-10 lg:py-12">
        {isMobile ? (
          // Mobile Layout
          <div className="space-y-6">
            <Gallery 
              images={galleryImages} 
              badges={badges} 
              isMobile={true}
              onWishlistToggle={() => {}}
            />
            <div className="px-2">
              <ProductInfo product={product} isMobile={true} />
            </div>
          </div>
        ) : (
          // Desktop Layout
          <div className="grid grid-cols-[1.4fr_1fr_0.9fr] gap-6">
            {/* Gallery - Left */}
            <div className="sticky top-[100px]">
              <Gallery images={galleryImages} badges={badges} />
            </div>

            {/* Product Info - Right */}
            <div className="col-span-2 sticky top-[100px] max-h-[calc(100vh-120px)] overflow-y-auto pr-4">
              <ProductInfo product={product} />
            </div>
          </div>
        )}

        {/* You May Also Like */}
        {relatedProducts.length > 0 && (
          <section className="mt-20 lg:mt-24" aria-labelledby="related-heading">
            <SectionHeader label="YOU MAY ALSO LIKE" />
            <ProductGrid products={relatedProducts} columns={{ base: 2, md: 3, lg: 4 }} />
          </section>
        )}
      </div>

      {/* Mobile Sticky Add to Bag Bar */}
      {isMobile && (
        <div className="mobile-sticky-bar border-t border-line bg-paper px-6 py-4 flex items-center gap-4">
          <div className="flex-1 flex items-center gap-3">
            <span className="font-sans font-bold text-[13px] text-ink">
              {product.price.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}
            </span>
          </div>
          <Button 
            variant="solid" 
            className="w-[200px] h-[56px] text-[13px] flex-shrink-0"
            disabled={false}
          >
            ADD TO BAG
          </Button>
        </div>
      )}
    </div>
  );
}