import { useCallback } from 'react';
import { usePrefetchMenuData } from '../../hooks/useMenuData';

// Warm the menu chunk on the same gesture (§8).
const prefetchChunk = () => import('./MobileMenu');

/**
 * Asymmetric two-line mark (spec §2) — deliberately not a generic 3-bar icon.
 * The bottom line extends on hover/press.
 */
export default function HamburgerButton({ open, onClick, ref }) {
  const prefetchMenuData = usePrefetchMenuData();

  const warm = useCallback(() => {
    prefetchMenuData();
    prefetchChunk();
  }, [prefetchMenuData]);

  return (
    <button
      ref={ref}
      type="button"
      onClick={onClick}
      onPointerEnter={warm}
      onTouchStart={warm}
      onFocus={warm}
      aria-label="Open menu"
      aria-expanded={open}
      aria-controls="mobile-menu"
      className="group relative -ml-3 h-11 w-11 shrink-0 lg:hidden"
    >
      <span aria-hidden="true" className="absolute left-3 top-[17px] h-[1.5px] w-[22px] bg-ink" />
      <span
        aria-hidden="true"
        className="absolute left-3 top-[26px] h-[1.5px] w-[14px] bg-ink transition-[width] duration-150 group-hover:w-[22px] group-active:w-[22px]"
      />
    </button>
  );
}
