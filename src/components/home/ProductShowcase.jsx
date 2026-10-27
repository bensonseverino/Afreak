import { Link } from 'react-router-dom';
import CmsImage from '../ui/CmsImage';
import Button from '../ui/Button';
import Icon from '../ui/Icon';
import Price from '../ui/Price';
import Skeleton from '../ui/Skeleton';
import { ContentUnavailable, FallbackNotice } from '../ui/ContentState';
import { useHome } from '../../lib/catalog';
import { DEFAULT_SHOWCASE } from '../../data/defaults';

/**
 * Product showcase (CMS CONNECTION FIX §5.2): the product picked at
 * /admin → Content → Showcase product. Hidden when nothing is chosen and the
 * catalogue already has products; only a brand-new (empty) store falls back to
 * the default copy.
 */
export default function ProductShowcase() {
  const { home, isPending, isError, refetch } = useHome();
  const showcase = home?.showcase ?? null;

  const emptyStore =
    !isPending && !isError && !showcase && !(home?.featured?.length) && !(home?.newArrivals?.length);
  const usingFallback = emptyStore;
  const data = showcase ?? (emptyStore ? DEFAULT_SHOWCASE : null);

  if (isError) {
    return (
      <section className="bg-mist py-16" aria-labelledby="showcase-heading">
        <div className="max-w-wide mx-auto px-6 lg:px-8">
          <ContentUnavailable label="SHOWCASE UNAVAILABLE" onRetry={() => refetch()} />
        </div>
      </section>
    );
  }

  if (isPending) {
    return (
      <section className="bg-mist py-16" aria-labelledby="showcase-heading" aria-busy="true">
        <div className="max-w-wide mx-auto px-6 lg:px-8">
          <div className="grid lg:grid-cols-3 gap-8 lg:gap-12 items-start">
            <div className="space-y-4">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-10 w-3/4" />
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-24 w-full" />
            </div>
            <Skeleton className="aspect-[3/4] w-full" />
            <div className="space-y-6">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (!data) return null;

  const features = (data.features ?? [])
    .map((feature) => ({
      icon: feature.icon || 'check',
      label: feature.title || feature.label || '',
    }))
    .filter((feature) => feature.label);

  return (
    <section className="bg-mist py-16" aria-labelledby="showcase-heading">
      <div className="max-w-wide mx-auto px-6 lg:px-8">
        <FallbackNotice show={usingFallback} section="showcase" reason="has no product selected" />
        <div className="grid lg:grid-cols-3 gap-8 lg:gap-12 items-start">
          {/* Left Column - Text */}
          <div className="lg:pt-8 space-y-6">
            <span className="font-sans font-bold uppercase text-[13px] tracking-label text-ink">
              PRODUCT SHOWCASE
            </span>
            <h2
              id="showcase-heading"
              className="font-display font-extrabold uppercase leading-none text-3xl lg:text-4xl text-ink"
            >
              {data.name}
            </h2>
            <div className="font-sans font-bold text-[13px] text-ink">
              <Price amount={data.price} />
            </div>
            {data.description && (
              <p className="text-graphite leading-relaxed text-sm lg:text-base max-w-xs">
                {data.description}
              </p>
            )}
            {data.slug && (
              <Link to={`/product/${data.slug}`} className="block w-full lg:w-auto">
                <Button variant="solid" className="w-full lg:w-auto">
                  VIEW PRODUCT
                </Button>
              </Link>
            )}
          </div>

          {/* Center Column - Product image from the CMS */}
          <div className="relative aspect-[4/5] bg-mist overflow-hidden lg:aspect-[3/4]">
            <CmsImage
              image={data.image ?? null}
              alt={data.name}
              ratio="aspect-[4/5]"
              sizes="(min-width: 1024px) 33vw, 100vw"
            />
          </div>

          {/* Right Column - Features from `products.features_json` */}
          {features.length > 0 && (
            <div className="space-y-8 lg:pt-8">
              {features.map((feature, index) => (
                <div key={index} className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center text-ink">
                    <Icon name={feature.icon} size={40} strokeWidth={1.5} />
                  </div>
                  <div>
                    <span className="font-sans font-bold uppercase text-[12px] tracking-label text-ink block leading-tight">
                      {feature.label}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
