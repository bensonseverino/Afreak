import { Link } from 'react-router-dom';
import { useHome } from '../../lib/catalog';
import { DEFAULT_LOOKBOOK } from '../../data/defaults';
import SectionHeader from '../ui/SectionHeader';
import CmsImage from '../ui/CmsImage';
import { ContentUnavailable, FallbackNotice, SectionSkeleton } from '../ui/ContentState';

/**
 * Homepage lookbook (CMS CONNECTION FIX §5.2): the first four active
 * `lookbook_items` from the CMS, managed at /admin → Content.
 */
export default function Lookbook() {
  const { home, isPending, isError, refetch } = useHome();
  const cmsItems = home?.lookbook?.slice(0, 4) ?? [];
  const usingFallback = !isPending && !isError && cmsItems.length === 0;
  const items = cmsItems.length ? cmsItems : DEFAULT_LOOKBOOK.slice(0, 4);

  if (isError) {
    return (
      <section className="py-12 md:py-16" aria-labelledby="lookbook-heading">
        <div className="max-w-shell mx-auto px-6">
          <SectionHeader label="LOOKBOOK" href="/lookbook" />
          <ContentUnavailable label="LOOKBOOK UNAVAILABLE" onRetry={() => refetch()} />
        </div>
      </section>
    );
  }

  if (isPending) {
    return (
      <section className="py-12 md:py-16" aria-labelledby="lookbook-heading">
        <div className="max-w-shell mx-auto px-6">
          <SectionHeader label="LOOKBOOK" href="/lookbook" />
          <SectionSkeleton count={4} ratio="aspect-[3/4]" />
        </div>
      </section>
    );
  }

  return (
    <section className="py-12 md:py-16" aria-labelledby="lookbook-heading">
      <div className="max-w-shell mx-auto px-6">
        <SectionHeader label="LOOKBOOK" href="/lookbook" />
        <FallbackNotice show={usingFallback} section="lookbook" reason="is empty" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-5" role="list">
          {items.map((item) => (
            <Link
              key={item.id}
              to={item.linkUrl || '/lookbook'}
              className="group block overflow-hidden"
              aria-label={item.label ? `View ${item.label}` : 'View lookbook'}
              role="listitem"
            >
              <div className="aspect-[3/4] bg-stone overflow-hidden">
                <CmsImage
                  image={item.image}
                  alt={item.label}
                  ratio="aspect-[3/4]"
                  sizes="(min-width: 768px) 25vw, 50vw"
                  grayscale
                  imgClassName="group-hover:scale-[1.03] transition-transform duration-300"
                />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
