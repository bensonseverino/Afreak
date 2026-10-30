import Button from '../ui/Button';
import Icon from '../ui/Icon';
import Price from '../ui/Price';
import { Link } from 'react-router-dom';
import Skeleton from '../ui/Skeleton';
import { ContentUnavailable, FallbackNotice } from '../ui/ContentState';
import { useHome } from '../../lib/catalog';
import { useShippingThreshold } from '../../hooks/useMenuData';
import { DEFAULT_SHIPPING_BANNER } from '../../data/defaults';

/**
 * Shipping banner (CMS CONNECTION FIX §5.2): title / subtitle / CTA from
 * /admin → Content, threshold from Settings → shipping. When the CMS has no
 * subtitle the free-shipping threshold fills it in, so a threshold change is
 * reflected here as well as at checkout.
 */
export default function ShippingBanner() {
  const { home, isPending, isError, refetch } = useHome();
  const threshold = useShippingThreshold();

  const banner = home?.shippingBanner ?? null;
  const usingFallback = !isPending && !isError && !banner?.title;
  const data = banner?.title ? banner : DEFAULT_SHIPPING_BANNER;

  if (isError) {
    return (
      <section className="bg-ink text-paper py-8" aria-labelledby="shipping-heading">
        <div className="max-w-wide mx-auto px-6 lg:px-8">
          <ContentUnavailable
            label="SHIPPING BANNER UNAVAILABLE"
            onRetry={() => refetch()}
            className="!border-white/20 !bg-ink !text-paper"
          />
        </div>
      </section>
    );
  }

  // While the API is still answering, show the section's shape — not default copy.
  if (isPending) {
    return (
      <section className="bg-ink text-paper py-8" aria-labelledby="shipping-heading" aria-busy="true">
        <div className="max-w-wide mx-auto px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
            <div className="space-y-3">
              <Skeleton className="h-7 w-72" />
              <Skeleton className="h-4 w-52" />
            </div>
            <Skeleton className="h-12 w-40" />
          </div>
        </div>
      </section>
    );
  }

  const ctaUrl = data.ctaUrl || '/shop';
  const ctaLabel = data.ctaLabel || 'SHOP NOW';
  const isInternal = ctaUrl.startsWith('/');

  return (
    <section className="bg-ink text-paper py-8" aria-labelledby="shipping-heading">
      <div className="max-w-wide mx-auto px-6 lg:px-8">
        <FallbackNotice show={usingFallback} section="shippingBanner" reason="is empty" />
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-16 h-16 lg:w-20 lg:h-20 flex items-center justify-center">
              <Icon name="globe" size={64} strokeWidth={1} />
            </div>
            <div>
              <h2
                id="shipping-heading"
                className="font-display font-bold uppercase text-[22px] lg:text-[28px] tracking-tight mb-1"
              >
                {data.title}
              </h2>
              <p className="font-sans text-[14px] text-paper/70">
                {data.subtitle ? (
                  data.subtitle
                ) : (
                  <>
                    On all orders over <Price amount={threshold} />
                  </>
                )}
              </p>
            </div>
          </div>
          {isInternal ? (
            <Link to={ctaUrl} className="w-full lg:w-auto">
              <Button
                variant="outline"
                className="w-full lg:w-auto justify-center gap-2 border-volt text-volt hover:bg-volt hover:text-ink"
              >
                {ctaLabel}
                <Icon name="arrowRightLong" size={20} />
              </Button>
            </Link>
          ) : (
            <Button
              href={ctaUrl}
              target="_blank"
              rel="noopener noreferrer"
              variant="outline"
              className="w-full lg:w-auto justify-center gap-2 border-volt text-volt hover:bg-volt hover:text-ink"
            >
              {ctaLabel}
              <Icon name="arrowRightLong" size={20} />
            </Button>
          )}
        </div>
      </div>
    </section>
  );
}
