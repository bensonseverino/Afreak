// Fires `onEscape` while `active`.
import { useEffect } from 'react';

export default function useEscape(active, onEscape) {
  useEffect(() => {
    if (!active) return;
    const handler = (e) => {
      if (e.key === 'Escape') onEscape?.();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [active, onEscape]);
}
