import { Link } from 'react-router-dom';
import Placeholder from '../ui/Placeholder';
import Badge from '../ui/Badge';
import ColorDots from '../ui/ColorDots';
import Icon from '../ui/Icon';
import { formatPrice, colorHex } from '../../data/products';
import { useWishlist } from '../../hooks/useWishlist';

export default function ProductCard({ product, className = '', showWishlist = true }) {
  const { slug, name, price, oldPrice, colors = [], isNew, images = [] } = product;
  const firstColor = colorHex(colors[0]);
  const image = images[0] || null;
  const discount = oldPrice ? Math.round((1 - price / oldPrice) * 100) : 0;

  const { has, toggle } = useWishlist();
  const wished = has(product.id);

  return (
    <div className={`group relative ${className}`}>
      <Link to={`/product/${slug}`} className="block" aria-label={`View ${name}`}>
        <div className="relative overflow-hidden bg-card aspect-[5/6] mb-3">
          <Placeholder ratio="aspect-[5/6]" label="PRODUCT" src={image} alt={name} />
          {(isNew || oldPrice) && (
            <div className="absolute top-3 left-3 flex flex-col gap-1.5">
              {isNew && <Badge variant="new">NEW</Badge>}
              {oldPrice && <Badge variant="sale">-{discount}%</Badge>}
            </div>
          )}
        </div>
        <div className="space-y-1.5">
          <h3 className="font-sans font-bold uppercase text-[13px] text-ink group-hover:text-graphite transition-colors">
            {name}
          </h3>
          <div className="flex items-center gap-3">
            <span className="font-sans text-[13px] text-ink">{formatPrice(price)}</span>
            {oldPrice && (
              <span className="font-sans text-[13px] text-graphite line-through">{formatPrice(oldPrice)}</span>
            )}
          </div>
          <ColorDots colors={colors} selectedColor={firstColor} size={10} />
        </div>
      </Link>

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
