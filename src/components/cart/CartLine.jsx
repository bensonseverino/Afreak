import { Link } from 'react-router-dom';
import Placeholder from '../ui/Placeholder';
import Icon from '../ui/Icon';
import QuantityStepper from '../ui/QuantityStepper';
import Price from '../ui/Price';
import { paths } from '../../lib/productPaths';

// Responsive cart line: mobile stacked, tablet two-row, desktop 5-column grid.
export default function CartLine({ line, isNew = false, onQtyChange, onRemove, className = '' }) {
  const variant = [line.color, line.size].filter(Boolean).join(' • ');

  return (
    <article
      className={`grid grid-cols-[88px_1fr] gap-4 border-y border-line py-4 sm:border sm:p-4 md:grid-cols-[96px_1fr] lg:grid-cols-[112px_1fr_auto_auto_auto] lg:items-center lg:gap-6 ${className}`}
    >
      <div className="row-span-2 lg:row-span-1 w-full aspect-[88/110] md:aspect-[96/120] lg:aspect-auto lg:w-[112px] lg:h-[128px] bg-card overflow-hidden">
        {line.slug && paths.product(line.slug) ? (
          <Link to={paths.product(line.slug)} aria-label={`View ${line.name}`} className="block w-full h-full">
            <Placeholder ratio="h-full" label="" src={line.image} alt={line.name} className="w-full h-full" />
          </Link>
        ) : (
          <Placeholder ratio="h-full" label="" src={line.image} alt={line.name} className="w-full h-full" />
        )}
      </div>

      <div className="min-w-0">
        {isNew && (
          <p className="font-sans font-bold uppercase text-[10px] tracking-label text-graphite mb-1">
            New arrival
          </p>
        )}
        <h3 className="font-display font-extrabold uppercase text-[16px] lg:text-[18px] text-ink leading-tight">
          {line.slug && paths.product(line.slug) ? (
            <Link to={paths.product(line.slug)} className="hover:text-graphite transition-colors">
              {line.name}
            </Link>
          ) : (
            line.name
          )}
        </h3>
        {variant && <p className="text-[13px] text-graphite mt-1">{variant}</p>}
        {line.print?.enabled && (
          <p className="text-[12px] text-graphite mt-1">
            Custom print · {line.print.placement} ·{' '}
            <button type="button" className="underline hover:text-ink">
              Edit
            </button>
          </p>
        )}
        <p className="flex items-center gap-2 text-[12px] text-graphite mt-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-ok" aria-hidden="true" /> In stock · Ready to ship
        </p>
        <p className="lg:hidden font-display font-bold text-[18px] text-ink mt-2">
          <Price amount={line.price * line.qty} />
        </p>
      </div>

      <div className="lg:col-span-3 flex items-center justify-between gap-3 lg:justify-end lg:gap-6">
        <QuantityStepper
          size="sm"
          value={line.qty}
          max={line.maxQty ?? 10}
          onChange={(q) => onQtyChange?.(line.lineId, q)}
        />
        <p className="hidden lg:block font-display font-bold text-[22px] text-ink whitespace-nowrap">
          <Price amount={line.price * line.qty} />
        </p>
        <button
          type="button"
          onClick={() => onRemove?.(line)}
          aria-label={`Remove ${line.name} from bag`}
          className="hidden sm:flex w-10 h-10 items-center justify-center border border-line text-ink hover:border-danger hover:text-danger transition-colors"
        >
          <Icon name="trash" size={18} />
        </button>
        <button
          type="button"
          onClick={() => onRemove?.(line)}
          className="sm:hidden text-[13px] text-ink underline"
        >
          Remove
        </button>
      </div>
    </article>
  );
}
