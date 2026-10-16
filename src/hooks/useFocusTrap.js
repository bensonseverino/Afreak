import { useEffect, useRef } from 'react';

const FOCUSABLE =
  'a[href],button:not([disabled]),textarea:not([disabled]),input:not([disabled]),select:not([disabled]),[tabindex]:not([tabindex="-1"])';

// Keeps Tab focus inside `ref` while `active`; restores focus on close.
export default function useFocusTrap(active, ref) {
  const previous = useRef(null);

  useEffect(() => {
    if (!active) return;
    previous.current = document.activeElement;
    const node = ref.current;
    if (!node) return;

    const focusables = () => Array.from(node.querySelectorAll(FOCUSABLE)).filter((el) => el.offsetParent !== null);
    const list = focusables();
    (list[0] || node).focus?.();

    const onKeyDown = (e) => {
      if (e.key !== 'Tab') return;
      const items = focusables();
      if (items.length === 0) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    node.addEventListener('keydown', onKeyDown);
    return () => {
      node.removeEventListener('keydown', onKeyDown);
      previous.current?.focus?.();
    };
  }, [active, ref]);
}
