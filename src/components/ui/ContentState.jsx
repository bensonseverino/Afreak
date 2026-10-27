import { useEffect } from 'react';
import Icon from './Icon';
import Skeleton from './Skeleton';
import { isDebugMode } from '../../lib/debug';

/**
 * Fallback badge (CMS CONNECTION FIX §5.3).
 *
 * Only when this section is actually rendering first-run fallback content
 * (`show`), and only in development or on `?debug=1` — invisible to shoppers,
 * obvious to whoever is looking for it.
 */
export function FallbackNotice({ show = false, section, reason = 'is empty', className = '' }) {
  const debug = isDebugMode();

  useEffect(() => {
    if (show && debug) console.warn(`[cms] FALLBACK CONTENT: ${section} ${reason}`);
  }, [show, debug, section, reason]);

  if (!show || !debug) return null;

  return (
    <div
      className={`mb-4 inline-block bg-volt px-2 py-1 font-sans text-[11px] font-semibold uppercase tracking-label text-ink ${className}`}
    >
      FALLBACK CONTENT: {section} {reason}
    </div>
  );
}

/**
 * Error state — shown when the API fails (not when it returns an empty list).
 * A broken CMS must be visible, never silently replaced by default content.
 */
export function ContentUnavailable({ label = 'CONTENT UNAVAILABLE', onRetry, className = '' }) {
  return (
    <div
      role="alert"
      className={`flex flex-col items-center justify-center gap-3 border border-line bg-mist px-6 py-10 text-center ${className}`}
    >
      <Icon name="alert" size={22} className="text-graphite" />
      <p className="font-sans text-xs font-semibold uppercase tracking-label text-ink">{label}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="inline-flex items-center gap-2 border border-ink px-4 py-2 font-sans text-[11px] font-semibold uppercase tracking-label text-ink hover:bg-ink hover:text-paper"
        >
          <Icon name="refresh" size={14} />
          Retry
        </button>
      )}
    </div>
  );
}

/** Loading skeleton matching the section grids, so the layout never jumps. */
export function SectionSkeleton({ count = 4, ratio = 'aspect-[5/6]', columns = 'grid-cols-2 md:grid-cols-4' }) {
  return (
    <div className={`grid ${columns} gap-4 md:gap-5`} aria-busy="true" aria-label="Loading content">
      {Array.from({ length: count }).map((_, i) => (
        <Skeleton key={i} className={`${ratio} w-full`} />
      ))}
    </div>
  );
}
