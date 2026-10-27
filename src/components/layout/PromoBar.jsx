import { useState } from 'react';
import Icon from '../ui/Icon';
import { isDebugMode } from '../../lib/debug';

/**
 * Announcement bar. The copy comes from the CMS (`settings.promo_bar`) and the
 * bar hides when the CMS turns it off — §5.2.
 */
export default function PromoBar({
  message,
  hidden = false,
  isFallback = false,
  dismissible = true,
  className = '',
  showOnDesktop = false,
}) {
  const [dismissed, setDismissed] = useState(false);

  if (hidden || dismissed) return null;

  return (
    <div
      className={`bg-ink text-paper text-xs font-sans font-medium uppercase tracking-label h-9 flex items-center justify-center ${!showOnDesktop ? 'lg:hidden' : ''} ${className}`}
      role="status"
      aria-live="polite"
    >
      {isFallback && isDebugMode() && (
        <span className="mr-3 bg-volt px-1.5 py-0.5 text-[10px] font-bold normal-case tracking-normal text-ink">
          FALLBACK CONTENT: promoBar is empty
        </span>
      )}
      <span className="flex items-center gap-2">{message}</span>
      {dismissible && (
        <button
          onClick={() => setDismissed(true)}
          className="ml-4 w-5 h-5 flex items-center justify-center hover:bg-ink/80 transition-colors -mr-2"
          aria-label="Dismiss announcement"
        >
          <Icon name="close" size={12} />
        </button>
      )}
    </div>
  );
}
