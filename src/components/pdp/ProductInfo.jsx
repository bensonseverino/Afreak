import { useState } from 'react';
import { Link } from 'react-router-dom';
import { formatPrice } from '../../data/products';
import Button from '../ui/Button';
import ColorDots from '../ui/ColorDots';
import SizeSelector from '../ui/SizeSelector';
import QuantityStepper from '../ui/QuantityStepper';
import Accordion from '../ui/Accordion';
import Badge from '../ui/Badge';
import Icon from '../ui/Icon';
import { useCart } from '../../context/CartContext';

const accordionItems = [
  {
    label: 'DESCRIPTION',
    content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.'
  },
  {
    label: 'FEATURES',
    content: '• Premium heavyweight cotton blend\n• Water-resistant finish\n• Multiple utility pockets with zip closures\n• Adjustable drawstring hood and hem\n• Reinforced stitching at stress points\n• Custom AFREAK hardware\n• Made in Portugal'
  },
  {
    label: 'GUARANTEES',
    content: '• 30-day free returns\n• 2-year warranty on manufacturing defects\n• Free shipping on orders over €150\n• Secure checkout with SSL encryption\n• Authenticity guaranteed'
  },
  {
    label: 'REVIEWS',
    content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. (42 reviews)'
  },
];

export default function ProductInfo({ product, isMobile = false }) {
  const { addItem } = useCart();
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState(product.colors[0] || '#000000');
  const [quantity, setQuantity] = useState(1);
  const [showSizeGuide, setShowSizeGuide] = useState(false);
  const [showCustomPrint, setShowCustomPrint] = useState(false);
  const [wishlist, setWishlist] = useState(false);

  const colorName = product.colors.find(c => c === selectedColor) ? 'Black' : 'Gray';

  const handleAddToBag = () => {
    if (!selectedSize) return;
    addItem({
      productId: product.id,
      slug: product.slug,
      name: product.name,
      price: product.price,
      size: selectedSize,
      color: selectedColor,
      image: null,
    });
  };

  const disabledSizes = product.sizes.filter(s => !product.sizes.includes(s));

  return (
    <div className={`space-y-6 ${isMobile ? 'pb-32' : ''}`} role="region" aria-label="Product information">
      {/* Badges */}
      <div className="flex gap-2">
        {product.isNew && <Badge variant="new">NEW</Badge>}
        {product.oldPrice && <Badge variant="sale">-{Math.round((1 - product.price / product.oldPrice) * 100)}%</Badge>}
      </div>

      {/* Title */}
      <h1 className="font-display font-extrabold uppercase text-[32px] leading-tight tracking-tight text-ink">
        {product.name.toUpperCase()}
      </h1>

      {/* Price Row */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <span className="font-sans font-bold text-[13px] text-ink">{formatPrice(product.price)}</span>
          {product.oldPrice && (
            <span className="font-sans text-[13px] text-graphite line-through">{formatPrice(product.oldPrice)}</span>
          )}
        </div>
        <button
          onClick={() => setShowSizeGuide(true)}
          className="font-sans text-xs underline underline-offset-2 text-graphite hover:text-ink transition-colors"
          type="button"
        >
          SIZE GUIDE
        </button>
      </div>

      {/* Size Selector */}
      <div>
        <label className="font-sans font-semibold uppercase text-xs tracking-label text-ink block mb-3">SIZE</label>
        <SizeSelector
          sizes={product.sizes}
          selectedSize={selectedSize}
          onSelect={setSelectedSize}
          disabledSizes={disabledSizes}
          required
        />
      </div>

      {/* Color Swatches */}
      <div>
        <label className="font-sans font-semibold uppercase text-xs tracking-label text-ink block mb-3">COLOR</label>
        <div className="flex items-center gap-4">
          <ColorDots 
            colors={product.colors} 
            selectedColor={selectedColor} 
            onSelect={setSelectedColor} 
            size={22} 
          />
          <span className="font-sans text-graphite text-sm">{colorName}</span>
        </div>
      </div>

      {/* Custom Print Hook */}
      <button
        onClick={() => setShowCustomPrint(true)}
        className="w-full sm:w-auto border border-ink text-ink font-sans font-semibold uppercase text-xs tracking-label py-3 px-6 hover:bg-ink hover:text-paper transition-colors mt-2"
        type="button"
      >
        + ADD CUSTOM PRINT
      </button>

      {/* Quantity Stepper */}
      <div className="flex items-center gap-4">
        <label className="font-sans font-semibold uppercase text-xs tracking-label text-ink">QUANTITY</label>
        <QuantityStepper value={quantity} onChange={setQuantity} max={10} />
      </div>

      {/* Accordions */}
      <Accordion items={accordionItems} />

      {/* Add to Bag + Wishlist */}
      <div className="flex gap-4 pt-4 border-t border-line">
        <Button 
          variant="solid" 
          className="flex-1 h-[56px] text-[13px]" 
          onClick={handleAddToBag}
          disabled={!selectedSize}
        >
          ADD TO BAG
        </Button>
        <button
          onClick={() => setWishlist(!wishlist)}
          className="w-[56px] h-[56px] border border-ink flex items-center justify-center text-ink hover:bg-ink hover:text-paper transition-colors"
          aria-label={wishlist ? 'Remove from wishlist' : 'Add to wishlist'}
          aria-pressed={wishlist}
          type="button"
        >
          <Icon name="heart" size={20} className={wishlist ? 'text-ink' : ''} />
        </button>
      </div>

      {/* Size Guide Modal */}
      {showSizeGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/50" onClick={() => setShowSizeGuide(false)} role="dialog" aria-modal="true" aria-labelledby="size-guide-title">
          <div className="bg-paper w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-6 border-b border-line">
              <h2 id="size-guide-title" className="font-display font-bold uppercase text-xl tracking-tight">SIZE GUIDE</h2>
              <button onClick={() => setShowSizeGuide(false)} className="w-10 h-10 flex items-center justify-center text-ink hover:text-graphite" aria-label="Close size guide">
                <Icon name="close" size={24} />
              </button>
            </div>
            <div className="p-6">
              <p className="text-graphite text-sm mb-4">Measurements in cm. Choose the size that best matches your body measurements.</p>
              <table className="w-full text-sm border border-line">
                <thead>
                  <tr className="bg-mist">
                    <th className="p-3 text-left font-semibold uppercase text-xs tracking-label border-b border-line">SIZE</th>
                    <th className="p-3 text-left font-semibold uppercase text-xs tracking-label border-b border-line">CHEST</th>
                    <th className="p-3 text-left font-semibold uppercase text-xs tracking-label border-b border-line">WAIST</th>
                    <th className="p-3 text-left font-semibold uppercase text-xs tracking-label border-b border-line">HIPS</th>
                  </tr>
                </thead>
                <tbody>
                  {['XS', 'S', 'M', 'L', 'XL', 'XXL'].map((size, i) => (
                    <tr key={size} className={i % 2 === 0 ? 'bg-paper' : 'bg-mist'}>
                      <td className="p-3 font-medium border-b border-line">{size}</td>
                      <td className="p-3 text-graphite border-b border-line">{86 + i * 4}-{90 + i * 4}</td>
                      <td className="p-3 text-graphite border-b border-line">{70 + i * 4}-{74 + i * 4}</td>
                      <td className="p-3 text-graphite border-b border-line">{92 + i * 4}-{96 + i * 4}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Custom Print Modal */}
      {showCustomPrint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/50" onClick={() => setShowCustomPrint(false)} role="dialog" aria-modal="true" aria-labelledby="custom-print-title">
          <div className="bg-paper w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-6 border-b border-line">
              <h2 id="custom-print-title" className="font-display font-bold uppercase text-xl tracking-tight">CUSTOM PRINT</h2>
              <button onClick={() => setShowCustomPrint(false)} className="w-10 h-10 flex items-center justify-center text-ink hover:text-graphite" aria-label="Close">
                <Icon name="close" size={24} />
              </button>
            </div>
            <div className="p-6 space-y-6">
              <p className="text-graphite text-sm">Upload your design and choose placement. Our team will review and contact you for approval before production.</p>
              <div>
                <label className="font-sans font-medium uppercase text-xs tracking-label text-ink block mb-2">UPLOAD DESIGN</label>
                <input type="file" accept="image/*,.pdf,.ai,.psd" className="w-full h-10 px-3 border border-line bg-paper text-ink text-sm focus:outline-none focus:ring-2 focus:ring-ink" />
              </div>
              <div>
                <label className="font-sans font-medium uppercase text-xs tracking-label text-ink block mb-2">PLACEMENT</label>
                <select className="w-full h-10 px-3 border border-line bg-paper text-ink text-sm focus:outline-none focus:ring-2 focus:ring-ink">
                  <option>Front Center</option>
                  <option>Back Center</option>
                  <option>Left Chest</option>
                  <option>Right Chest</option>
                  <option>Left Sleeve</option>
                  <option>Right Sleeve</option>
                </select>
              </div>
              <div className="flex gap-4 pt-4">
                <Button variant="outline" className="flex-1" onClick={() => setShowCustomPrint(false)}>CANCEL</Button>
                <Button variant="solid" className="flex-1">SAVE</Button>
              </div>
              <p className="text-[11px] text-graphite text-center">// TODO: wire to print service</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}