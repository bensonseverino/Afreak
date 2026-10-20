import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { colorHex, colorName } from '../data/products';
import { findVariantId, sizesForColor, useProduct } from '../lib/catalog';
import { TRACK_TYPES, track } from '../lib/analytics';
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

  const { product, isPending, notFound } = useProduct(slug);

  const wishlisted = product ? hasWished(product.id) : false;
  const handleToggleWishlist = () => product && toggleWished(product);

  const [color, setColor] = useState(null);
  const [size, setSize] = useState(null);
  const [qty, setQty] = useState(1);
  const [print, setPrint] = useState(EMPTY_PRINT);
  const [added, setAdded] = useState(false);
  const [sizeError, setSizeError] = useState('');
  const [modal, setModal] = useState(null); // 'print' | 'sizeGuide' | 'sizeSheet'
  const [showSticky, setShowSticky] = useState(false);
  const ctaSentinelRef = useRef(null);

  // Reset selection whenever the loaded product changes.
  const productId = product?.id;
  useEffect(() => {
    if (!product) return;
    setColor(colorHex(product.colors?.[0]));
    setSize(null);
    setQty(1);
    setPrint(EMPTY_PRINT);
    setAdded(false);
    setSizeError('');
    setShowSticky(false);
  }, [productId, slug]); // eslint-disable-line react-hooks/exhaustive-deps

  // Funnel counter for the CMS dashboard (fire-and-forget).
  useEffect(() => {
    if (productId) track(TRACK_TYPES.productView, productId);
  }, [productId]);

  useEffect(() => {
    const el = ctaSentinelRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;
    const io = new IntersectionObserver(
      ([entry]) => setShowSticky(!entry.isIntersecting && entry.boundingClientRect.top < 0),
      { rootMargin: '-80px 0px 0px 0px' }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [slug, productId]);

  // Stock depends on the selected colour, so narrow the size grid to it.
  const selectedColorName = colorName(product?.colors?.find((c) => colorHex(c) === color));
  const sizes = useMemo(() => sizesForColor(product, selectedColorName), [product, selectedColorName]);
  const viewProduct = useMemo(
    () => (product ? { ...product, sizes: sizes.length ? sizes : product.sizes } : null),
    [product, sizes]
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
  const images = product.images?.length ? product.images : [null];
  const discount = product.oldPrice ? Math.round((1 - product.price / product.oldPrice) * 100) : 0;
  const badges = [
    ...(product.isNew ? [{ label: 'NEW', variant: 'new' }] : []),
    ...(discount > 0 ? [{ label: `-${discount}%`, variant: 'sale' }] : []),
  ];

  const pairWithProducts = (product.pairWith || []).slice(0, 4);
  const accessories = product.accessories || [];
  const related = (product.related || []).slice(0, 4);

  const doAdd = (overrideSize, overrideQty) => {
    const chosenSize = overrideSize ?? size;
    const entry = viewProduct.sizes?.find((s) => s.label === chosenSize);
    addItem({
      productId: product.id,
      slug: product.slug,
      variantId: findVariantId(product, selectedColorName, chosenSize),
      name: product.name,
      price: product.price,
      color: selectedColorName,
      size: chosenSize,
      qty: overrideQty ?? qty,
      image: product.images?.[0] || null,
      isNew: Boolean(product.isNew),
      print,
      maxQty: Math.min(entry?.stock ?? 1, 10),
      kind: 'product',
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  const handleAdd = () => {
    if (!size) {
      setSizeError('Please select a size.');
      return;
    }
    setSizeError('');
    doAdd();
  };

  const handleBuyNow = () => {
    if (!size) {
      setSizeError('Please select a size.');
      return;
    }
    setSizeError('');
    doAdd();
    closeDrawer();
    navigate('/checkout');
  };

  const handleStickyAction = () => {
    if (!size) {
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
            images={images}
            badges={badges}
            wishlisted={wishlisted}
            onToggleWishlist={handleToggleWishlist}
            alt={product.name}
          />
        </div>

        <div className="mt-8 lg:mt-0 lg:sticky lg:top-24 self-start">
          <ProductInfo
            product={viewProduct}
            color={color}
            onColorChange={setColor}
            size={size}
            onSizeChange={(s) => {
              setSize(s);
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

        <ReviewsPreview rating={product.rating} reviewCount={product.reviewCount} />

        {related.length > 0 && (
          <section aria-label="You may also like">
            <h2 className="font-sans font-bold uppercase text-[13px] tracking-label text-ink mb-6">
              You may also like
            </h2>
            <ProductGrid products={related} columns={{ base: 2, md: 3, lg: 4 }} />
          </section>
        )}
      </div>

      <StickyBuyBar visible={showSticky} product={product} added={added} onAction={handleStickyAction} />

      <SizeSheet
        open={modal === 'sizeSheet'}
        product={viewProduct}
        onClose={() => setModal(null)}
        onAdded={({ color: c, size: s }) => {
          if (c) setColor(c);
          if (s) setSize(s);
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
