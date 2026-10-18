import { useEffect } from 'react';

/**
 * iOS-safe body scroll lock (spec §4.2).
 *
 * `overflow: hidden` alone does not stop background scrolling on iOS Safari, so
 * the body is fixed in place at the current offset and restored on release. Any
 * classic (non-overlay) scrollbar width is compensated so tablet layouts do not
 * shift sideways while the menu is open.
 */
export default function useScrollLock(locked) {
  useEffect(() => {
    if (!locked) return undefined;

    const { body, documentElement } = document;
    const scrollY = window.scrollY;
    const scrollbar = window.innerWidth - documentElement.clientWidth;
    const previous = {
      position: body.style.position,
      top: body.style.top,
      width: body.style.width,
      paddingRight: body.style.paddingRight,
      overflow: body.style.overflow,
    };
    const previousScrollBehavior = documentElement.style.scrollBehavior;

    body.style.position = 'fixed';
    body.style.top = `-${scrollY}px`;
    body.style.width = '100%';
    body.style.overflow = 'hidden';
    if (scrollbar > 0) body.style.paddingRight = `${scrollbar}px`;

    return () => {
      body.style.position = previous.position;
      body.style.top = previous.top;
      body.style.width = previous.width;
      body.style.paddingRight = previous.paddingRight;
      body.style.overflow = previous.overflow;
      // Jump, never animate: `html { scroll-behavior: smooth }` would otherwise
      // turn the restore into a visible scroll.
      documentElement.style.scrollBehavior = 'auto';
      window.scrollTo(0, scrollY);
      documentElement.style.scrollBehavior = previousScrollBehavior;
    };
  }, [locked]);
}
