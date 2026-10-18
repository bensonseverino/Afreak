import { useEffect, useRef } from 'react';

const SITE_KEY = import.meta.env?.VITE_TURNSTILE_SITE_KEY;

/**
 * Optional Cloudflare Turnstile widget (spec §6.4). Renders nothing unless
 * `VITE_TURNSTILE_SITE_KEY` is configured, so the form works out of the box and
 * simply forwards the token when the challenge is enabled.
 */
export default function Turnstile({ onToken }) {
  const containerRef = useRef(null);
  const widgetRef = useRef(null);

  useEffect(() => {
    if (!SITE_KEY || !containerRef.current) return undefined;
    let cancelled = false;

    const render = () => {
      if (cancelled || !containerRef.current || !window.turnstile || widgetRef.current != null) return;
      widgetRef.current = window.turnstile.render(containerRef.current, {
        sitekey: SITE_KEY,
        callback: (token) => onToken?.(token),
        'expired-callback': () => onToken?.(''),
        'error-callback': () => onToken?.(''),
      });
    };

    let script = document.querySelector('script[data-afreak-turnstile]');
    if (!script) {
      script = document.createElement('script');
      script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
      script.async = true;
      script.defer = true;
      script.dataset.afreakTurnstile = 'true';
      document.head.appendChild(script);
    }
    if (window.turnstile) render();
    else script.addEventListener('load', render);

    return () => {
      cancelled = true;
      script.removeEventListener('load', render);
      if (widgetRef.current != null && window.turnstile) {
        try {
          window.turnstile.remove(widgetRef.current);
        } catch {
          /* ignore */
        }
        widgetRef.current = null;
      }
    };
  }, [onToken]);

  if (!SITE_KEY) return null;
  return <div ref={containerRef} className="mt-4" />;
}
