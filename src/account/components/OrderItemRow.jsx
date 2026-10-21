import Placeholder from '../../components/ui/Placeholder';
import Price from '../../components/ui/Price';

// One line on the order detail page (spec §8.3).
export default function OrderItemRow({ item }) {
  const variant = [item.color, item.size].filter(Boolean).join(' / ');

  return (
    <li className="flex gap-4 py-4 border-b border-line last:border-b-0">
      <div className="w-20 h-[100px] shrink-0">
        <Placeholder ratio="h-full" label="" src={item.image} alt={item.name} className="w-full h-full" />
      </div>

      <div className="flex-1 min-w-0">
        <p className="font-sans font-bold uppercase text-[14px] text-ink">{item.name}</p>
        {variant && <p className="text-[13px] text-graphite mt-1">{variant}</p>}
        <p className="text-[13px] text-graphite mt-1">Qty {item.qty}</p>

        {item.print && (
          <p className="mt-2 flex flex-wrap items-center gap-2 text-[12px] text-graphite">
            <span className="inline-flex items-center px-2 py-0.5 border border-ink text-ink font-semibold uppercase text-[10px] tracking-label">
              PRINT
            </span>
            Custom print · {item.print.placement}
            {item.hasArtwork && <span className="text-ink">Artwork submitted ✓</span>}
          </p>
        )}
      </div>

      <span className="font-display font-bold text-[16px] text-ink shrink-0">
        <Price amount={(item.unitPriceCents * item.qty) / 100} />
      </span>
    </li>
  );
}
