import { useState } from 'react';
import Icon from '../ui/Icon';
import Price from '../ui/Price';
import { FREE_SHIPPING_THRESHOLD } from '../../utils/shipping';

/** Announcement bar; CMS copy can replace the default message. */
export default function PromoBar({
  message = (
    <span>
      FREE SHIPPING WORLDWIDE ON ORDERS OVER <Price amount={FREE_SHIPPING_THRESHOLD} />
    </span>
  ),
  dismissible = true,
  className = '',
  showOnDesktop = false,
}) {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div
      className={`bg-ink text-paper text-xs font-sans font-medium uppercase tracking-label h-9 flex items-center justify-center ${!showOnDesktop ? 'lg:hidden' : ''} ${className}`}
      role="status"
      aria-live="polite"
    >
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
