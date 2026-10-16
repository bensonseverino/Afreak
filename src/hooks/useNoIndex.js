import { useEffect } from 'react';

// Adds <meta name="robots" content="noindex"> while mounted (account pages).
export default function useNoIndex() {
  useEffect(() => {
    const meta = document.createElement('meta');
    meta.name = 'robots';
    meta.content = 'noindex';
    document.head.appendChild(meta);
    return () => {
      document.head.removeChild(meta);
    };
  }, []);
}
