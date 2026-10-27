import { useEffect, useRef, useState } from 'react';
import Button from '../ui/Button';
import Icon from '../ui/Icon';
import Stars from '../ui/Stars';
import Badge from '../ui/Badge';
import Accordion from '../ui/Accordion';
import QuantityStepper from '../ui/QuantityStepper';
import ColorSwatches from './ColorSwatches';
import SizeGrid from './SizeGrid';
import Price from '../ui/Price';
import { colorHex, colorName } from '../../data/products';
import { formatCount } from '../../utils/format';
import { useShippingThreshold } from '../../hooks/useMenuData';

const GUARANTEE_COPY =
  'Every AFREAK piece is built to last. If a seam fails or a zip breaks within 2 years of purchase, we repair or replace it — no questions asked.';

/**
 * Right-hand product info column. State is owned by ProductDetail so the
 * sticky bar and size sheet stay in sync.
 */
export default function ProductInfo({
  product,
  color,
  onColorChange,
  size,
  onSizeChange,
  qty,
  onQtyChange,
  print,
  onOpenPrint,
  wishlisted,
  onToggleWishlist,
  onAddToBag,
  onBuyNow,
  added = false,
  error = '',
  onOpenSizeGuide,
  ctaSentinelRef,
  lowStock = 0,
  inStock = true,
  colorAvailability = [],
}) {
  const [expanded, setExpanded] = useState(false);
  const [shake, setShake] = useState(false);
  const sizeRef = useRef(null);
  const freeShippingThreshold = useShippingThreshold();

  useEffect(() => {
    if (!error) return;
    sizeRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-shot shake animation driven by a prop change
    setShake(true);
    const t = setTimeout(() => setShake(false), 500);
    return () => clearTimeout(t);
  }, [error]);

  const discount = product.oldPrice ? Math.round((1 - product.price / product.oldPrice) * 100) : 0;
  const selectedColor = colorAvailability.find((c) => c.name === color) ?? product.colors?.find((c) => colorHex(c) === color);
  const sizeEntry = product.sizes?.find((s) => s.label === size);
  const maxQty = Math.min(sizeEntry?.stock || 10, 10);
  const ctaLabel = added ? 'Added ✓' : size ? 'Add to bag' : 'Select a size';
  const isSoldOut = !inStock && size;

  const accordionItems = [
    { label: 'DESCRIPTION', content: product.description },
    {
      label: 'FEATURES',
      content: (product.features || []).map((f) => `${f.title} — ${f.sub}`).join('  ·  '),
    },
    {
      label: 'SHIPPING & RETURNS',
      content: (
        <>
          Free standard shipping on all orders over <Price amount={freeShippingThreshold} />.
          Standard delivery takes 4–7 business days. Express options are available at checkout.
          Returns accepted within 30 days of delivery.
        </>
      ),
    },
    { label: 'GUARANTEES', content: GUARANTEE_COPY },
    { label: 'REVIEWS', content: 'Customer reviews are shown in the reviews section on this page.' },
  ];

  return (
    <div className="font-sans">
      <header>
        {product.isNew && (
          <p className="font-sans font-bold uppercase text-[12px] tracking-label text-graphite mb-2">
            New arrival
          </p>
        )}
        <div className="flex items-start justify-between gap-4">
          <h1 className="font-display font-extrabold uppercase text-3xl md:text-4xl leading-[1.05] tracking-tight text-ink">
            {product.name}
          </h1>
          <div className="hidden md:flex items-center gap-2 shrink-0">
            <button
              type="button"
              aria-label="Share product"
              className="w-11 h-11 border border-line flex items-center justify-center text-ink hover:border-ink transition-colors"
            >
              <Icon name="share" size={18} />
            </button>
            <button
              type="button"
              onClick={onToggleWishlist}
              aria-pressed={wishlisted}
              aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
              className="w-11 h-11 border border-line flex items-center justify-center text-ink hover:border-ink transition-colors"
            >
              <Icon name="heart" size={18} className={wishlisted ? '[&_svg]:fill-current' : ''} />
            </button>
          </div>
        </div>

        <a href="#reviews" className="mt-3 inline-flex items-center gap-2 group">
          <Stars value={product.rating} size={14} />
          <span className="font-sans font-semibold text-[13px] text-ink">{product.rating}</span>
          <span className="font-sans text-[13px] text-graphite underline group-hover:text-ink">
            ({formatCount(product.reviewCount)} reviews)
          </span>
        </a>

        <div className="mt-4 flex items-center gap-3 flex-wrap">
          <span className="font-display font-bold text-[28px] leading-none text-ink">
            <Price amount={product.price} />
          </span>
          {product.oldPrice && (
            <span className="font-sans text-[15px] text-graphite line-through">
              <Price amount={product.oldPrice} />
            </span>
          )}
          {discount > 0 && <Badge variant="sale">-{discount}%</Badge>}
        </div>
      </header>

      <div className="mt-4">
        <p className={`text-[14px] text-graphite leading-relaxed ${expanded ? '' : 'line-clamp-3'}`}>
          {product.description}
        </p>
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="mt-2 font-sans text-[13px] text-ink underline"
        >
          {expanded ? 'Show less' : 'Show more'}
        </button>
      </div>

      {product.colors?.length > 0 && (
        <div className="mt-6">
          <p className="font-sans text-[13px] font-medium text-ink mb-1">
            Color: {colorName(selectedColor)}
          </p>
          <ColorSwatches
            colors={colorAvailability.length ? colorAvailability : product.colors}
            selected={color}
            onSelect={onColorChange}
          />
        </div>
      )}

      <div className="mt-6" ref={sizeRef}>
        <div className="flex items-center justify-between mb-2">
          <p className="font-sans text-[13px] font-medium text-ink">Size</p>
          <button
            type="button"
            onClick={onOpenSizeGuide}
            className="font-sans text-[13px] text-ink underline"
          >
            View size guide
          </button>
        </div>
        <div className={shake ? 'animate-shake' : ''}>
          <SizeGrid
            sizes={product.sizes}
            selected={size}
            onSelect={onSizeChange}
            disabled={!inStock}
            productId={product.id}
            color={color}
          />
        </div>
        {lowStock > 0 && (
          <p className="mt-2 text-[12px] text-warn" aria-live="polite">
            Only {lowStock} left
          </p>
        )}
        {error && (
          <p className="mt-2 text-[12px] text-danger" aria-live="polite">
            {error}
          </p>
        )}
        {isSoldOut && (
          <p className="mt-2 text-[12px] text-danger" aria-live="polite">
            This combination is sold out.
          </p>
        )}
      </div>

      <div className="mt-6 flex items-center gap-4 flex-wrap">
        <QuantityStepper value={qty} onChange={onQtyChange} max={maxQty} />
        <span className="flex items-center gap-2 text-[13px] text-graphite">
          <span className="w-1.5 h-1.5 rounded-full bg-ok" aria-hidden="true" /> In stock · Ready to ship
        </span>
      </div>

      {product.customizable && (
        <div className="mt-6">
          <Button
            variant="outline"
            size="md"
            leftIcon="plus"
            onClick={onOpenPrint}
            className="w-full sm:w-auto h-12 text-[12px]"
          >
            {print?.enabled ? `Custom print · ${print.placement}` : 'Add custom print'}
          </Button>
        </div>
      )}

      <div className="mt-6 flex gap-2">
        <button
          type="button"
          onClick={onAddToBag}
          className={`flex-1 h-14 inline-flex items-center justify-center font-sans font-semibold uppercase tracking-label text-[12px] border transition-colors ${
            added
              ? 'bg-ink text-paper border-ink'
              : !size || isSoldOut
                ? 'bg-stone text-paper border-stone'
                : 'bg-ink text-paper border-ink hover:bg-graphite hover:border-graphite'
          }`}
          disabled={isSoldOut}
        >
          {ctaLabel}
        </button>
        <button
          type="button"
          onClick={onToggleWishlist}
          aria-pressed={wishlisted}
          aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
          className="w-14 h-14 border border-ink flex items-center justify-center shrink-0 text-ink hover:bg-mist transition-colors"
        >
          <Icon name="heart" size={20} className={wishlisted ? '[&_svg]:fill-current' : ''} />
        </button>
      </div>

      <Button variant="outline" size="md" onClick={onBuyNow} className="w-full h-14 mt-2 text-[12px]" disabled={isSoldOut}>
        Buy now
      </Button>

      {/* Sticky-bar trigger: shown once the CTA row scrolls out of view. */}
      <div ref={ctaSentinelRef} aria-hidden="true" className="h-px" />

      <Accordion items={accordionItems} className="mt-10" />
    </div>
  );
}
