import { Link } from 'react-router-dom';
import { useState } from 'react';
import Placeholder from '../ui/Placeholder';
import Badge from '../ui/Badge';
import ColorDots from '../ui/ColorDots';
import Icon from '../ui/Icon';
import Price from '../ui/Price';
import { colorHex } from '../../data/products';
import { useWishlist } from '../../hooks/useWishlist';
import { paths } from '../../lib/productPaths';

export default function ProductCard({ product, className = '', showWishlist = true }) {
  const { slug, name, price, oldPrice, colors = [], isNew, images = [], colorImages = new Map(), priceFrom, soldOut } = product;
  const [activeColor, setActiveColor] = useState(null);
  const firstColor = activeColor ?? colorHex(colors[0]);
  const firstColorName = colors.find((c) => colorHex(c) === firstColor)?.name;
  const activeImage = activeColor && colorImages.has(activeColor)
    ? colorImages.get(activeColor)
    : firstColorName && colorImages.has(firstColorName)
      ? colorImages.get(firstColorName)
      : images[0] || null;
  const discount = oldPrice ? Math.round((1 - price / oldPrice) * 100) : 0;
  const showFromPrice = priceFrom && priceFrom !== price;

  const { has, toggle } = useWishlist();
  const wished = has(product.id);

  const handleSwatchHover = (color) => {
    setActiveColor(color);
  };

  const handleSwatchLeave = () => {
    setActiveColor(null);
  };

  const productPath = paths.product(slug);

  return (
    <div className={`group relative ${className}`}>
      {productPath ? (
        <Link
          to={`${productPath}${firstColorName ? `?color=${encodeURIComponent(firstColorName)}` : ''}`}
          className="block"
          aria-label={`View ${name}`}
          onMouseEnter={() => setActiveColor(firstColorName)}
          onMouseLeave={handleSwatchLeave}
        >
        <div className="relative overflow-hidden bg-card aspect-[5/6] mb-3">
          <Placeholder ratio="aspect-[5/6]" label="PRODUCT" src={activeImage} alt={name} />
          {(isNew || oldPrice) && (
            <div className="absolute top-3 left-3 flex flex-col gap-1.5">
              {isNew && <Badge variant="new">NEW</Badge>}
              {oldPrice && <Badge variant="sale">-{discount}%</Badge>}
            </div>
          )}
          {soldOut && (
            <div className="absolute inset-0 bg-ink/50 flex items-center justify-center">
              <span className="font-sans font-bold uppercase text-[13px] tracking-label text-paper">Sold out</span>
            </div>
          )}
        </div>
        <div className="space-y-1.5">
          <h3 className="font-sans font-bold uppercase text-[13px] text-ink group-hover:text-graphite transition-colors">
            {name}
          </h3>
          <div className="flex items-center gap-3">
            <span className="font-sans text-[13px] text-ink"><Price amount={price} /></span>
            {oldPrice && (
              <span className="font-sans text-[13px] text-graphite line-through"><Price amount={oldPrice} /></span>
            )}
          </div>
          {showFromPrice && (
            <p className="font-sans text-[11px] text-graphite">From <Price amount={priceFrom} /></p>
          )}
          <ColorDots
            colors={colors.map((c) => ({ name: c.name, hex: c.hex }))}
            selectedColor={activeColor}
            size={10}
            onSelect={handleSwatchHover}
            maxVisible={5}
          />
        </div>
      </Link>
      ) : (
        /* No slug — render card without a link, warn in console (paths.product). */
        <div className="block" aria-hidden="true">
          <div className="relative overflow-hidden bg-card aspect-[5/6] mb-3">
            <Placeholder ratio="aspect-[5/6]" label="PRODUCT" src={activeImage} alt={name} />
          </div>
          <div className="space-y-1.5">
            <h3 className="font-sans font-bold uppercase text-[13px] text-ink">
              {name}
            </h3>
            <div className="flex items-center gap-3">
              <span className="font-sans text-[13px] text-ink"><Price amount={price} /></span>
              {oldPrice && (
                <span className="font-sans text-[13px] text-graphite line-through"><Price amount={oldPrice} /></span>
              )}
            </div>
            {showFromPrice && (
              <p className="font-sans text-[11px] text-graphite">From <Price amount={priceFrom} /></p>
            )}
          </div>
        </div>
      )}

      {showWishlist && (
        <button
          type="button"
          onClick={() => toggle(product)}
          aria-pressed={wished}
          aria-label={wished ? `Remove ${name} from wishlist` : `Save ${name} to wishlist`}
          className="absolute top-3 right-3 z-10 w-9 h-9 flex items-center justify-center bg-paper/90 text-ink hover:text-danger transition-colors"
        >
          <Icon name="heart" size={18} className={wished ? '[&_svg]:fill-current' : ''} />
        </button>
      )}
    </div>
  );
}
