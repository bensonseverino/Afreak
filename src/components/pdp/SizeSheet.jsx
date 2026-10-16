import { useEffect, useState } from 'react';
import Drawer from '../ui/Drawer';
import Button from '../ui/Button';
import ColorSwatches from './ColorSwatches';
import SizeGrid from './SizeGrid';
import { useCart } from '../../context/CartContext';
import { colorHex, colorName, formatPrice } from '../../data/products';

// Quick-add sheet: color + size + confirm. Mobile's primary conversion path.
export default function SizeSheet({ open, product, onClose, onAdded }) {
  const { addItem } = useCart();
  const [color, setColor] = useState(null);
  const [size, setSize] = useState(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (open && product) {
      setColor(colorHex(product.colors?.[0]));
      setSize(null);
      setError(false);
    }
  }, [open, product]);

  if (!product) return null;

  const selectedColor = product.colors?.find((c) => colorHex(c) === color);
  const stock = product.sizes?.find((s) => s.label === size)?.stock ?? 0;

  const confirm = () => {
    if (!size) {
      setError(true);
      return;
    }
    addItem({
      productId: product.id,
      slug: product.slug,
      name: product.name,
      price: product.price,
      color: colorName(selectedColor),
      size,
      qty: 1,
      image: product.images?.[0] || null,
      print: { enabled: false, placement: null, fileName: null },
      maxQty: Math.min(stock || 1, 10),
      kind: 'product',
    });
    onAdded?.({ color, size });
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
            Add to bag · {formatPrice(product.price)}
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
            sizes={product.sizes}
            selected={size}
            onSelect={(s) => {
              setSize(s);
              setError(false);
            }}
          />
        </div>
      </div>
    </Drawer>
  );
}
