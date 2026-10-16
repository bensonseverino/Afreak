import { useEffect, useRef, useState } from 'react';
import Placeholder from '../ui/Placeholder';
import Badge from '../ui/Badge';
import Icon from '../ui/Icon';
import Modal from '../ui/Modal';
import ThumbStrip from './ThumbStrip';

/**
 * Product gallery.
 * Mobile  — full-bleed scroll-snap slides, counter + dots, tap to open lightbox.
 * Tablet  — single image with arrows + horizontal thumb strip, tap to open lightbox.
 * Desktop — vertical thumb rail + large image, arrow keyboard nav, hover zoom (xl).
 */
export default function Gallery({ images = [], badges = [], wishlisted = false, onToggleWishlist, alt = 'Product' }) {
  const [index, setIndex] = useState(0);
  const [lightbox, setLightbox] = useState(false);
  const [origin, setOrigin] = useState('50% 50%');
  const mobileRef = useRef(null);
  const total = images.length || 1;

  const goTo = (i) => {
    const next = Math.max(0, Math.min(i, total - 1));
    setIndex(next);
    const el = mobileRef.current;
    if (el) el.scrollTo({ left: next * el.clientWidth, behavior: 'smooth' });
  };

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'ArrowLeft') goTo(index - 1);
      if (e.key === 'ArrowRight') goTo(index + 1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [index]);

  const handleMove = (e) => {
    const r = e.currentTarget.getBoundingClientRect();
    setOrigin(`${((e.clientX - r.left) / r.width) * 100}% ${((e.clientY - r.top) / r.height) * 100}%`);
  };

  const badgeStack = badges.length > 0 && (
    <div className="absolute top-4 left-4 z-20 flex flex-col gap-2 pointer-events-none">
      {badges.map((b, i) => (
        <Badge key={i} variant={b.variant || 'default'}>
          {b.label || b}
        </Badge>
      ))}
    </div>
  );

  const heartBtn = (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onToggleWishlist?.();
      }}
      aria-pressed={wishlisted}
      aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
      className="absolute top-3 right-3 z-20 w-11 h-11 flex items-center justify-center bg-paper/85 backdrop-blur-sm text-ink hover:bg-paper"
      type="button"
    >
      <Icon name="heart" size={20} className={wishlisted ? '[&_svg]:fill-current' : ''} />
    </button>
  );

  const arrowBtn = (dir) => (
    <button
      key={dir}
      onClick={(e) => {
        e.stopPropagation();
        goTo(index + dir);
      }}
      disabled={(dir < 0 && index === 0) || (dir > 0 && index === total - 1)}
      aria-label={dir < 0 ? 'Previous image' : 'Next image'}
      className={`absolute top-1/2 -translate-y-1/2 z-20 w-11 h-11 bg-paper/85 flex items-center justify-center text-ink hover:bg-paper transition-opacity disabled:opacity-0 ${
        dir < 0 ? 'left-3' : 'right-3'
      }`}
      type="button"
    >
      <Icon name={dir < 0 ? 'chevronLeft' : 'chevronRight'} size={20} />
    </button>
  );

  const slide = (i, eager) => (
    <Placeholder
      ratio="h-full"
      label=""
      src={images[i]}
      alt={`${alt} — image ${i + 1}`}
      loading={eager ? 'eager' : 'lazy'}
      className="w-full h-full"
    />
  );

  const dotCount = Math.min(images.length, 4);
  const activeDot = Math.min(index, Math.max(0, dotCount - 1));

  return (
    <div className="relative" aria-roledescription="carousel" aria-label="Product gallery">
      {/* Mobile */}
      <div className="md:hidden relative">
        <div
          ref={mobileRef}
          onScroll={(e) => setIndex(Math.round(e.currentTarget.scrollLeft / e.currentTarget.clientWidth))}
          className="flex overflow-x-auto snap-x snap-mandatory no-scrollbar"
        >
          {images.map((_, i) => (
            <button
              key={i}
              onClick={() => setLightbox(true)}
              aria-label={`Open image ${i + 1}`}
              className="w-full shrink-0 snap-center bg-card aspect-[4/5]"
              type="button"
            >
              {slide(i, i === 0)}
            </button>
          ))}
        </div>
        {badgeStack}
        {heartBtn}
        <div className="absolute bottom-3 left-4 z-20 flex gap-1.5 pointer-events-none">
          {Array.from({ length: dotCount }).map((_, i) => (
            <span key={i} className={`w-1.5 h-1.5 rounded-full ${i === activeDot ? 'bg-ink' : 'bg-stone'}`} />
          ))}
        </div>
        <span className="absolute bottom-2.5 right-4 z-20 bg-paper/85 px-2 py-1 text-[11px] font-medium text-ink">
          {index + 1} / {total}
        </span>
      </div>

      {/* Tablet */}
      <div className="hidden md:block lg:hidden">
        <div className="relative aspect-[3/4] bg-card overflow-hidden">
          {slide(index, true)}
          {badgeStack}
          {heartBtn}
          {arrowBtn(-1)}
          {arrowBtn(1)}
        </div>
        <div className="mt-4">
          <ThumbStrip images={images} index={index} onSelect={goTo} layout="row" />
        </div>
      </div>

      {/* Desktop */}
      <div className="hidden lg:grid grid-cols-[72px_1fr] gap-4">
        <ThumbStrip images={images} index={index} onSelect={goTo} layout="column" />
        <div
          className="relative aspect-[4/5] bg-card overflow-hidden group"
          onMouseMove={handleMove}
          onClick={() => setLightbox(true)}
          role="button"
          tabIndex={0}
          aria-label="Open image viewer"
          onKeyDown={(e) => e.key === 'Enter' && setLightbox(true)}
        >
          <div
            className="w-full h-full transition-transform duration-300 xl:group-hover:scale-[1.6]"
            style={{ transformOrigin: origin }}
          >
            {slide(index, true)}
          </div>
          {badgeStack}
          {heartBtn}
          {arrowBtn(-1)}
          {arrowBtn(1)}
        </div>
      </div>

      {/* Lightbox */}
      <Modal open={lightbox} onClose={() => setLightbox(false)} title="Product image" size="lg" bodyClassName="p-0">
        <div className="relative bg-ink">
          <Placeholder
            ratio="aspect-[3/4]"
            label=""
            src={images[index]}
            alt={`${alt} — image ${index + 1}`}
            className="w-full bg-ink"
          />
          <button
            onClick={() => goTo(index - 1)}
            disabled={index === 0}
            aria-label="Previous image"
            className="absolute top-1/2 -translate-y-1/2 left-3 w-11 h-11 flex items-center justify-center bg-paper/90 text-ink disabled:opacity-30"
            type="button"
          >
            <Icon name="chevronLeft" size={22} />
          </button>
          <button
            onClick={() => goTo(index + 1)}
            disabled={index === total - 1}
            aria-label="Next image"
            className="absolute top-1/2 -translate-y-1/2 right-3 w-11 h-11 flex items-center justify-center bg-paper/90 text-ink disabled:opacity-30"
            type="button"
          >
            <Icon name="chevronRight" size={22} />
          </button>
          <span className="absolute bottom-4 left-1/2 -translate-x-1/2 text-paper text-[12px] bg-ink/70 px-2 py-1">
            {index + 1} / {total}
          </span>
        </div>
      </Modal>
    </div>
  );
}
