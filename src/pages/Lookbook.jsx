import { Link } from 'react-router-dom';
import { useLookbook } from '../lib/catalog';
import { DEFAULT_LOOKBOOK } from '../data/defaults';
import CmsImage from '../components/ui/CmsImage';
import { ContentUnavailable, FallbackNotice, SectionSkeleton } from '../components/ui/ContentState';

/**
 * Full lookbook page (CMS CONNECTION FIX §4.4/§5.2): every active
 * `lookbook_items` row, in CMS order.
 */
export default function Lookbook() {
  const { items: cmsItems, isPending, isError, refetch } = useLookbook();
  const usingFallback = !isPending && !isError && cmsItems.length === 0;
  const items = cmsItems.length ? cmsItems : DEFAULT_LOOKBOOK;

  return (
    <div className="min-h-screen bg-paper">
      <div className="max-w-wide mx-auto px-6 lg:px-8 py-16">
        <header className="mb-12 lg:mb-16">
          <h1 className="font-display font-black uppercase text-4xl lg:text-5xl tracking-tight text-ink mb-4">
            LOOKBOOK
          </h1>
          <p className="font-sans text-graphite text-base lg:text-lg max-w-2xl leading-relaxed">
            Explore our latest collections through curated editorial spreads. Each look tells a story of craft, culture, and contemporary streetwear.
          </p>
        </header>

        {isError ? (
          <ContentUnavailable label="LOOKBOOK UNAVAILABLE" onRetry={() => refetch()} />
        ) : isPending ? (
          <SectionSkeleton count={8} ratio="aspect-[3/4]" columns="grid-cols-2 md:grid-cols-3 lg:grid-cols-4" />
        ) : (
          <>
            <FallbackNotice show={usingFallback} section="lookbook" reason="is empty" />
            <div
              className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6"
              role="list"
            >
              {items.map((item) => (
                <Link
                  key={item.id}
                  to={item.linkUrl || '/lookbook'}
                  className="group block overflow-hidden"
                  aria-label={item.label ? `View ${item.label}` : 'View look'}
                  role="listitem"
                >
                  <div className="aspect-[3/4] bg-stone overflow-hidden">
                    <CmsImage
                      image={item.image}
                      alt={item.label}
                      ratio="aspect-[3/4]"
                      sizes="(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 50vw"
                      grayscale
                      imgClassName="group-hover:scale-[1.03] transition-transform duration-500"
                    />
                  </div>
                  {item.label && (
                    <div className="mt-4 text-center">
                      <span className="font-sans font-medium uppercase text-xs tracking-label text-ink">
                        {item.label}
                      </span>
                    </div>
                  )}
                </Link>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
