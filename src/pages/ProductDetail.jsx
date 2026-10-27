import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { findVariantId, useProduct } from '../lib/catalog';
import { useProductVariants } from '../hooks/useProductVariants';
import useDocumentMeta from '../hooks/useDocumentMeta';
import { TRACK_TYPES, track } from '../lib/analytics';
import { paths } from '../lib/productPaths';
import Gallery from '../components/pdp/Gallery';
import ProductInfo from '../components/pdp/ProductInfo';
import HighlightsPanel from '../components/pdp/HighlightsPanel';
import AccessoryCard from '../components/pdp/AccessoryCard';
import PairItWith from '../components/pdp/PairItWith';
import ReviewsPreview from '../components/pdp/ReviewsPreview';
import StickyBuyBar from '../components/pdp/StickyBuyBar';
import SizeSheet from '../components/pdp/SizeSheet';
import CustomPrintModal from '../components/pdp/CustomPrintModal';
import SizeGuideModal from '../components/pdp/SizeGuideModal';
import ProductGrid from '../components/product/ProductGrid';
import Icon from '../components/ui/Icon';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../hooks/useWishlist';

const EMPTY_PRINT = { enabled: false, placement: null, fileName: null };

export default function ProductDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { addItem, closeDrawer } = useCart();
  const { has: hasWished, toggle: toggleWished } = useWishlist();


  // Reproduce-issue instrumentation (CMS CONNECTION FIX §3b, Step 1).
  // On the live site this logs the three strings the diagnostic expects so you
  // can compare them against the D1 row and the failing network request:
  //   (a) slug parsed from the URL,
  //   (b) the storefront path the card/link actually used,
  //   (c) the API request path the hook fired.
  useEffect(() => {
    if (!slug) return;
    const apiBase = import.meta.env?.VITE_API_BASE ?? '';
    const apiBaseSlash = apiBase && !apiBase.endsWith('/') ? `${apiBase}/` : apiBase;
    console.group('ProductDetail deep-link repro');
    console.log('(a) slug from URL param:', slug);
    console.log('(b) storefront path linked to:', paths.product(slug));
    console.log('(c) API path the hook will use:', `${apiBaseSlash}products/${encodeURIComponent(slug)}`);
    console.log('(d) route table expects path:', paths.product('<slug>'));
    console.groupEnd();
  }, [slug]);

  const { product, isPending, notFound } = useProduct(slug);

  // CMS SEO fields (audit row 16) — falls back to the product name.
  useDocumentMeta(product?.seo?.title || product?.name, product?.seo?.description);

  const wishlisted = product ? hasWished(product.id) : false;
  const handleToggleWishlist = () => product && toggleWished(product);

  // Variant selection hook
  const {
    selectedColor,
    selectedSize,
    selectColor,
    selectSize,
    galleryImages,
    price,
    compareAtPrice: oldPrice,
    inStock,
    lowStock,
    availableSizes,
    colorAvailability,
    selectedVariant,
  } = useProductVariants(product);

  const [qty, setQty] = useState(1);
  const [print, setPrint] = useState(EMPTY_PRINT);
  const [added, setAdded] = useState(false);
  const [sizeError, setSizeError] = useState('');
  const [modal, setModal] = useState(null);
  const [showSticky, setShowSticky] = useState(false);
  const ctaSentinelRef = useRef(null);

  // Funnel counter
  useEffect(() => {
    if (product?.id) track(TRACK_TYPES.productView, product.id);
  }, [product?.id]);

  useEffect(() => {
    const el = ctaSentinelRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;
    const io = new IntersectionObserver(
      ([entry]) => setShowSticky(!entry.isIntersecting && entry.boundingClientRect.top < 0),
      { rootMargin: '-80px 0px 0px 0px' },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [slug, product?.id]);

  const viewProduct = useMemo(
    () => (product ? { ...product, price, oldPrice, sizes: availableSizes } : null),
    [product, price, oldPrice, availableSizes],
  );

  if (isPending && !product) {
    return (
      <div className="max-w-wide mx-auto px-6 py-20 text-center font-sans text-[13px] text-graphite">
        Loading product…
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-wide mx-auto px-6 py-20 text-center">
        <h1 className="font-display font-bold uppercase text-3xl mb-4">
          {notFound ? 'Product not found' : 'Something went wrong'}
        </h1>
        <p className="text-graphite mb-8">
          {notFound
            ? 'The product you are looking for does not exist.'
            : 'We could not load this product right now.'}
        </p>
        <Link to="/shop" className="font-sans font-semibold uppercase text-xs tracking-label text-ink underline">
          Back to shop
        </Link>
      </div>
    );
  }

  const categoryName = product.categoryName || product.category;
  const discount = oldPrice ? Math.round((1 - price / oldPrice) * 100) : 0;
  const badges = [
    ...(product.isNew ? [{ label: 'NEW', variant: 'new' }] : []),
    ...(discount > 0 ? [{ label: `-${discount}%`, variant: 'sale' }] : []),
  ];

  const pairWithProducts = (product.pairWith || []).slice(0, 4);
  const accessories = product.accessories || [];
  const related = (product.related || []).slice(0, 4);

  const doAdd = (overrideSize, overrideQty) => {
    const chosenSize = overrideSize ?? selectedSize;
    const entry = viewProduct.sizes?.find((s) => s.label === chosenSize);
    addItem({
      productId: product.id,
      slug: product.slug,
      variantId: selectedVariant?.id ?? findVariantId(product, selectedColor, chosenSize),
      name: product.name,
      price,
      color: selectedColor,
      size: chosenSize,
      qty: overrideQty ?? qty,
      image: galleryImages[0] || product.images?.[0] || null,
      isNew: Boolean(product.isNew),
      print,
      maxQty: Math.min(entry?.stock ?? 1, 10),
      kind: 'product',
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  const handleAdd = () => {
    if (!selectedSize) {
      setSizeError('Please select a size.');
      return;
    }
    if (!inStock) {
      setSizeError('This combination is out of stock.');
      return;
    }
    setSizeError('');
    doAdd();
  };

  const handleBuyNow = () => {
    if (!selectedSize) {
      setSizeError('Please select a size.');
      return;
    }
    if (!inStock) {
      setSizeError('This combination is out of stock.');
      return;
    }
    setSizeError('');
    doAdd();
    closeDrawer();
    navigate('/checkout');
  };

  const handleStickyAction = () => {
    if (!selectedSize) {
      setModal('sizeSheet');
      return;
    }
    handleAdd();
  };

  const addAccessory = (accessory) =>
    addItem({
      productId: accessory.id,
      slug: accessory.slug ?? null,
      name: accessory.name,
      price: accessory.price,
      color: '',
      size: '',
      qty: 1,
      image: accessory.image || null,
      print: EMPTY_PRINT,
      maxQty: 10,
      kind: 'accessory',
    });

  return (
    <div className="min-h-screen bg-paper">
      <nav className="border-b border-line" aria-label="Breadcrumb">
        <div className="max-w-wide mx-auto px-4 md:px-6 lg:px-8 py-3">
          <Link
            to={`/shop/${product.category}`}
            className="md:hidden inline-flex items-center gap-2 font-sans text-[12px] uppercase tracking-label text-ink"
          >
            <Icon name="arrowLeft" size={16} /> {categoryName}
          </Link>
          <ol className="hidden md:flex items-center gap-2 font-sans text-[12px] uppercase tracking-label">
            <li>
              <Link to="/" className="text-graphite hover:text-ink">
                Home
              </Link>
            </li>
            <li className="text-graphite">/</li>
            <li>
              <Link to={`/shop/${product.category}`} className="text-graphite hover:text-ink">
                {categoryName}
              </Link>
            </li>
            <li className="text-graphite">/</li>
            <li className="text-ink font-medium truncate max-w-[220px]">{product.name}</li>
          </ol>
        </div>
      </nav>

      <div className="max-w-wide mx-auto px-4 md:px-6 lg:px-8 py-6 lg:py-10 lg:grid lg:grid-cols-[1.1fr_1fr] lg:gap-10 xl:gap-14">
        <div className="-mx-4 md:mx-0">
          <Gallery
            key={selectedColor}
            images={galleryImages}
            badges={badges}
            wishlisted={wishlisted}
            onToggleWishlist={handleToggleWishlist}
            alt={product.name}
          />
        </div>

        <div className="mt-8 lg:mt-0 lg:sticky lg:top-24 self-start">
          <ProductInfo
            product={viewProduct}
            color={selectedColor}
            onColorChange={selectColor}
            size={selectedSize}
            onSizeChange={(s) => {
              selectSize(s);
              setSizeError('');
            }}
            qty={qty}
            onQtyChange={setQty}
            print={print}
            onOpenPrint={() => setModal('print')}
            wishlisted={wishlisted}
            onToggleWishlist={handleToggleWishlist}
            onAddToBag={handleAdd}
            onBuyNow={handleBuyNow}
            added={added}
            error={sizeError}
            onOpenSizeGuide={() => setModal('sizeGuide')}
            ctaSentinelRef={ctaSentinelRef}
            lowStock={lowStock}
            inStock={inStock}
            colorAvailability={colorAvailability}
          />
        </div>
      </div>

      <div className="max-w-wide mx-auto px-4 md:px-6 lg:px-8 pb-28 lg:pb-20 space-y-16 lg:space-y-24">
        <section className="grid gap-4 md:grid-cols-2" aria-label="Highlights">
          <HighlightsPanel rating={product.rating} reviewCount={product.reviewCount} features={product.features} />
          {accessories.length > 0 && (
            <div className="space-y-3">
              {accessories.map((a) => (
                <AccessoryCard key={a.id} accessory={a} onAdd={addAccessory} />
              ))}
            </div>
          )}
        </section>

        <PairItWith products={pairWithProducts} />

        <ReviewsPreview
          slug={product.slug}
          rating={product.rating}
          reviewCount={product.reviewCount}
          distribution={product.ratingDistribution}
        />

        {related.length > 0 && (
          <section aria-label="You may also like">
            <h2 className="font-sans font-bold uppercase text-[13px] tracking-label text-ink mb-6">
              You may also like
            </h2>
            <ProductGrid products={related} columns={{ base: 2, md: 3, lg: 4 }} />
          </section>
        )}
      </div>

      <StickyBuyBar visible={showSticky} product={viewProduct} added={added} onAction={handleStickyAction} />

      <SizeSheet
        open={modal === 'sizeSheet'}
        product={viewProduct}
        onClose={() => setModal(null)}
        onAdded={({ color: c, size: s }) => {
          if (c) selectColor(c);
          if (s) selectSize(s);
          setSizeError('');
        }}
      />
      <CustomPrintModal
        open={modal === 'print'}
        onClose={() => setModal(null)}
        onSave={(p) => setPrint(p)}
      />
      <SizeGuideModal
        open={modal === 'sizeGuide'}
        chart={product.sizeChart}
        onClose={() => setModal(null)}
      />
    </div>
  );
}
