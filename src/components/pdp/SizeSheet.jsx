import { useEffect, useMemo, useState } from 'react';
import Drawer from '../ui/Drawer';
import Button from '../ui/Button';
import ColorSwatches from './ColorSwatches';
import SizeGrid from './SizeGrid';
import { useCart } from '../../context/CartContext';
import Price from '../ui/Price';
import { colorHex, colorName } from '../../data/products';
import { findVariantId, sizesForColor } from '../../lib/catalog';

// Quick-add sheet: color + size + confirm. Mobile's primary conversion path.
export default function SizeSheet({ open, product, onClose, onAdded }) {
  const { addItem } = useCart();
  const [color, setColor] = useState(null);
  const [size, setSize] = useState(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (open && product) {
      // Use color name (not hex) for selection
      setColor(product.colors?.[0]?.name ?? null);
      setSize(null);
      setError(false);
    }
  }, [open, product]);

  if (!product) return null;

  const selectedColor = product.colors?.find((c) => c.name === color);
  const selectedColorName = colorName(selectedColor);
  const sizes = sizesForColor(product, selectedColorName);
  const sizeOptions = sizes.length ? sizes : product.sizes ?? [];

  // Find variant for current selection to get price + image
  const variant = useMemo(
    () =>
      product.variants?.find(
        (v) => v.colorName === selectedColorName && v.size === size && v.active !== false,
      ) ?? null,
    [product.variants, selectedColorName, size],
  );
  const price = variant?.price ?? product.price;
  const stock = variant?.stock ?? sizeOptions.find((s) => s.label === size)?.stock ?? 0;
  const colorImage = product.colorImages?.get(selectedColorName) ?? product.images?.[0] ?? null;

  const confirm = () => {
    if (!size) {
      setError(true);
      return;
    }
    addItem({
      productId: product.id,
      slug: product.slug,
      variantId: variant?.id ?? findVariantId(product, selectedColorName, size),
      name: product.name,
      price,
      color: selectedColorName,
      size,
      qty: 1,
      image: colorImage,
      isNew: Boolean(product.isNew),
      print: { enabled: false, placement: null, fileName: null },
      maxQty: Math.min(stock || 1, 10),
      kind: 'product',
    });
    onAdded?.({ color: selectedColorName, size });
    onClose?.();
  };

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title="Select options"
      variant="bottom"
      footer={
        <div className="p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
          <Button variant="primary" onClick={confirm} className="w-full h-[52px] text-[12px]">
            Add to bag · <Price amount={price} />
          </Button>
          {error && (
            <p className="mt-2 text-[12px] text-danger" aria-live="polite">
              Please select a size.
            </p>
          )}
        </div>
      }
    >
      <div className="p-5 space-y-6">
        {product.colors?.length > 0 && (
          <div>
            <p className="font-sans text-[13px] font-medium text-ink mb-1">
              Color: {colorName(selectedColor)}
            </p>
            <ColorSwatches colors={product.colors} selected={color} onSelect={setColor} />
          </div>
        )}

        <div>
          <p className="font-sans text-[13px] font-medium text-ink mb-2">Size</p>
          <SizeGrid
            sizes={sizeOptions}
            selected={size}
            onSelect={(s) => {
              setSize(s);
              setError(false);
            }}
            productId={product.id}
            color={selectedColorName}
          />
        </div>
      </div>
    </Drawer>
  );
}
