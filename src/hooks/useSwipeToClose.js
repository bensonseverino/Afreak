import { useEffect } from 'react';

const CLOSE_DISTANCE = 60; // px (spec §4.1)
const CLOSE_VELOCITY = 0.5; // px per ms

/**
 * Swipe-left to close a panel (touch/pen only, spec §4.1).
 *
 * The panel is `touch-action: pan-y`, so vertical scrolling is untouched while
 * horizontal movement is ours. The gesture only commits once it is clearly
 * horizontal, which keeps taps on the links inside the panel working.
 */
export default function useSwipeToClose(active, ref, onClose) {
  useEffect(() => {
    const node = ref.current;
    if (!active || !node) return undefined;

    let startX = 0;
    let startY = 0;
    let startTime = 0;
    let offset = 0;
    let tracking = false;
    let decided = false;

    const release = () => {
      node.style.transition = '';
      node.style.transform = '';
      node.style.willChange = '';
    };

    const onPointerDown = (event) => {
      if (event.pointerType === 'mouse') return;
      tracking = true;
      decided = false;
      offset = 0;
      startX = event.clientX;
      startY = event.clientY;
      startTime = performance.now();
      node.style.transition = 'none';
      node.style.willChange = 'transform';
    };

    const onPointerMove = (event) => {
      if (!tracking) return;
      const dx = event.clientX - startX;
      const dy = event.clientY - startY;

      if (!decided) {
        if (Math.abs(dx) < 8 && Math.abs(dy) < 8) return;
        decided = true;
        // Right-swipe or mostly-vertical movement belongs to the browser.
        if (dx > 0 || Math.abs(dy) > Math.abs(dx)) {
          tracking = false;
          release();
          return;
        }
      }

      offset = Math.min(0, dx);
      node.style.transform = `translateX(${offset}px)`;
    };

    const onPointerUp = () => {
      if (!tracking) return;
      tracking = false;

      if (!decided) {
        release();
        return;
      }

      const elapsed = Math.max(1, performance.now() - startTime);
      const velocity = Math.abs(offset) / elapsed;

      if (Math.abs(offset) > CLOSE_DISTANCE || velocity > CLOSE_VELOCITY) {
        // Let CSS own the exit animation from wherever the finger left it.
        release();
        onClose?.();
      } else {
        release();
      }
    };

    node.addEventListener('pointerdown', onPointerDown);
    node.addEventListener('pointermove', onPointerMove);
    node.addEventListener('pointerup', onPointerUp);
    node.addEventListener('pointercancel', onPointerUp);

    return () => {
      node.removeEventListener('pointerdown', onPointerDown);
      node.removeEventListener('pointermove', onPointerMove);
      node.removeEventListener('pointerup', onPointerUp);
      node.removeEventListener('pointercancel', onPointerUp);
      node.style.transition = '';
      node.style.transform = '';
      node.style.willChange = '';
    };
  }, [active, ref, onClose]);
}
