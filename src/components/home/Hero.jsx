import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import CmsImage from '../ui/CmsImage';
import Button from '../ui/Button';
import Icon from '../ui/Icon';
import Skeleton from '../ui/Skeleton';
import { ContentUnavailable, FallbackNotice } from '../ui/ContentState';
import { useHome } from '../../lib/catalog';
import { DEFAULT_HERO_SLIDES } from '../../data/defaults';

/**
 * Homepage hero (CMS CONNECTION FIX §5.2).
 *
 * Every piece of copy and the image come from `GET /api/home → heroSlides`
 * (managed at /admin → Content). The three slides that used to be hard-coded
 * here now live in `data/defaults.js` and render only for a brand-new store —
 * and say so on `?debug=1`.
 */

const MAX_TITLE_LINES = 3;

/** Split a CMS title into at most three stacked display lines. */
export function titleLines(title, maxLines = MAX_TITLE_LINES) {
  const words = String(title ?? '').trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return [];
  if (words.length <= maxLines) return words;
  const perLine = Math.ceil(words.length / maxLines);
  const lines = [];
  for (let i = 0; i < words.length; i += perLine) {
    lines.push(words.slice(i, i + perLine).join(' '));
  }
  return lines.slice(0, maxLines);
}

function isExternal(url) {
  return /^https?:\/\//i.test(url ?? '');
}

/** CMS CTA: internal `/path` → router link, `https://…` → external link. */
function SlideCta({ label, url }) {
  if (!label || !url) return null;
  if (url.startsWith('/')) {
    return (
      <Link to={url} className="w-full sm:w-auto">
        <Button size="lg" className="w-full sm:w-auto">
          {label}
        </Button>
      </Link>
    );
  }
  if (isExternal(url)) {
    return (
      <Button
        href={url}
        size="lg"
        target="_blank"
        rel="noopener noreferrer"
        className="w-full sm:w-auto"
      >
        {label}
      </Button>
    );
  }
  return null;
}

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia?.('(prefers-reduced-motion: reduce)');
    if (!mq) return undefined;
    setReduced(mq.matches);
    const onChange = (event) => setReduced(event.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);
  return reduced;
}

export default function Hero() {
  const { home, isPending, isError, refetch } = useHome();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [paused, setPaused] = useState(false);
  const regionRef = useRef(null);
  const reducedMotion = usePrefersReducedMotion();

  const cmsSlides = home?.heroSlides ?? [];
  const usingFallback = !isPending && !isError && cmsSlides.length === 0;
  const slides = useMemo(
    () => (cmsSlides.length ? cmsSlides : DEFAULT_HERO_SLIDES),
    [cmsSlides],
  );
  const slideCount = slides.length;
  const isCarousel = slideCount > 1;

  useEffect(() => {
    if (currentSlide >= slideCount) setCurrentSlide(0);
  }, [currentSlide, slideCount]);

  const goToSlide = useCallback(
    (index) => {
      if (!slideCount) return;
      setCurrentSlide(((index % slideCount) + slideCount) % slideCount);
    },
    [slideCount],
  );

  // Autoplay: off for a single slide, on hover/focus and for reduced motion.
  useEffect(() => {
    if (!isCarousel || paused || reducedMotion) return undefined;
    const interval = setInterval(() => {
      setCurrentSlide((index) => (index + 1) % slideCount);
    }, 6000);
    return () => clearInterval(interval);
  }, [isCarousel, paused, reducedMotion, slideCount]);

  const onKeyDown = (event) => {
    if (!isCarousel) return;
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      goToSlide(currentSlide - 1);
    }
    if (event.key === 'ArrowRight') {
      event.preventDefault();
      goToSlide(currentSlide + 1);
    }
  };

  if (isError) {
    return (
      <section
        className="relative min-h-[420px] lg:min-h-[520px] bg-mist"
        aria-label="Hero carousel unavailable"
      >
        <div className="max-w-wide mx-auto px-6 lg:px-8 py-16">
          <ContentUnavailable label="HOME CONTENT UNAVAILABLE" onRetry={() => refetch()} />
        </div>
      </section>
    );
  }

  if (isPending) {
    return (
      <section className="relative min-h-[560px] lg:min-h-[720px]" aria-busy="true" aria-label="Loading hero">
        <div className="max-w-wide mx-auto px-6 lg:px-8 py-16">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-start">
            <div className="space-y-5">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-14 w-full" />
              <Skeleton className="h-14 w-3/4" />
              <Skeleton className="h-5 w-full" />
              <Skeleton className="h-12 w-40" />
            </div>
            <Skeleton className="aspect-[3/4] w-full" />
          </div>
        </div>
      </section>
    );
  }

  const slide = slides[Math.min(currentSlide, slideCount - 1)] ?? DEFAULT_HERO_SLIDES[0];
  const lines = titleLines(slide.title);
  const current = String(Math.min(currentSlide, slideCount - 1) + 1).padStart(2, '0');
  const total = String(slideCount).padStart(2, '0');

  return (
    <section
      ref={regionRef}
      className="relative min-h-[560px] lg:min-h-[720px] overflow-hidden outline-none"
      aria-label="Hero carousel"
      aria-roledescription="carousel"
      tabIndex={-1}
      onKeyDown={onKeyDown}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
    >
      <div className="max-w-wide mx-auto px-6 lg:px-8 h-full">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 h-full items-start">
          {/* Left Column - Content */}
          <div className="flex flex-col justify-center lg:pt-12 z-10">
            <FallbackNotice show={usingFallback} section="heroSlides" reason="is empty" />
            {slide.eyebrow && (
              <span className="font-sans font-semibold uppercase text-xs tracking-label text-ink mb-4">
                {slide.eyebrow}
              </span>
            )}
            <h1 className="font-display font-black uppercase leading-[0.9] tracking-tight text-ink mb-6 lg:mb-8">
              {lines.map((line, i) => (
                <div key={i} className="text-5xl lg:text-6xl xl:text-7xl">
                  {line}
                </div>
              ))}
            </h1>
            {slide.subtitle && (
              <p className="font-sans text-base lg:text-lg text-graphite leading-relaxed mb-8 lg:mb-10 max-w-md">
                {slide.subtitle}
              </p>
            )}
            <div className="flex flex-col sm:flex-row gap-4">
              <SlideCta label={slide.ctaLabel} url={slide.ctaUrl} />
              <Link to="/lookbook" className="w-full sm:w-auto">
                <Button variant="link" size="lg" className="w-full sm:w-auto justify-start">
                  VIEW LOOKBOOK
                </Button>
              </Link>
            </div>
          </div>

          {/* Right Column - CMS image */}
          <div className="relative lg:pt-8">
            <div className="relative aspect-[3/4] bg-mist overflow-hidden">
              <CmsImage
                image={slide.image}
                alt={slide.title}
                ratio="aspect-[3/4]"
                sizes="(min-width: 1024px) 50vw, 100vw"
                priority={currentSlide === 0}
                className="transition-opacity duration-300"
              />

              {/* Vertical text label - Desktop only */}
              <div className="hidden lg:block absolute right-0 top-1/2 -translate-y-1/2 -translate-x-[40px] transform">
                <div className="writing-mode-vertical-rl text-right">
                  <span className="font-sans font-bold uppercase text-[12px] tracking-label text-ink">
                    COLLECTION
                  </span>
                  <div className="w-[1px] h-36 bg-ink mx-auto mt-4" />
                </div>
              </div>
            </div>

            {/* Carousel Controls - hidden for a single slide (§5.2) */}
            {isCarousel && (
              <div className="absolute bottom-6 right-0 flex items-center gap-4">
                <div className="flex items-center gap-3 font-sans font-medium uppercase text-xs tracking-label text-ink">
                  <span className="w-8 text-center">{current}</span>
                  <div className="w-16 h-[1px] bg-ink" />
                  <span className="w-8 text-center">{total}</span>
                </div>
                <div className="w-[80px] h-[56px] bg-ink flex items-center justify-center gap-4">
                  <button
                    onClick={() => goToSlide(currentSlide - 1)}
                    className="w-10 h-10 flex items-center justify-center text-paper hover:bg-ink/80 transition-colors"
                    aria-label="Previous slide"
                  >
                    <Icon name="arrowLeft" size={18} />
                  </button>
                  <button
                    onClick={() => goToSlide(currentSlide + 1)}
                    className="w-10 h-10 flex items-center justify-center text-paper hover:bg-ink/80 transition-colors"
                    aria-label="Next slide"
                  >
                    <Icon name="arrowRight" size={18} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
