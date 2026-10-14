import { Link } from 'react-router-dom';
import Placeholder from '../ui/Placeholder';
import Badge from '../ui/Badge';
import ColorDots from '../ui/ColorDots';
import { formatPrice } from '../../data/products';

export default function ProductCard({ product, className = '' }) {
  const { slug, name, price, oldPrice, colors = [], isNew, category, image } = product;
  const firstColor = colors[0] || '#000000';

  return (
    <Link 
      to={`/product/${slug}`} 
      className={`group block ${className}`}
      aria-label={`View ${name}`}
    >
      <div className="relative overflow-hidden bg-card aspect-[5/6] mb-3">
        <Placeholder ratio="aspect-[5/6]" label="PRODUCT" src={image} alt={name} />
        {(isNew || oldPrice) && (
          <div className="absolute top-3 left-3 flex flex-col gap-1.5">
            {isNew && <Badge variant="new">NEW</Badge>}
            {oldPrice && <Badge variant="sale">-{Math.round((1 - price / oldPrice) * 100)}%</Badge>}
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
  );
}