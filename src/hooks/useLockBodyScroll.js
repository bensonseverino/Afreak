import { useEffect } from 'react';

// Locks body scroll while `active` (drawers, sheets, modals).
export default function useLockBodyScroll(active) {
  useEffect(() => {
    if (!active) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = original;
    };
  }, [active]);
}
