import { useRef } from 'react';
import Icon from './Icon';
import useLockBodyScroll from '../../hooks/useLockBodyScroll';
import useFocusTrap from '../../hooks/useFocusTrap';
import useEscape from '../../hooks/useEscape';

/**
 * Right drawer on md+ / bottom sheet on mobile.
 * variant: 'auto' | 'right' | 'bottom'
 */
export default function Drawer({ open, onClose, title, children, footer, variant = 'auto', panelClassName = '' }) {
  const panelRef = useRef(null);
  useLockBodyScroll(open);
  useFocusTrap(open, panelRef);
  useEscape(open, onClose);

  if (!open) return null;

  const position =
    variant === 'right'
      ? 'inset-y-0 right-0 h-full w-full max-w-[420px]'
      : variant === 'bottom'
        ? 'inset-x-0 bottom-0 max-h-[85dvh] w-full'
        : 'inset-x-0 bottom-0 max-h-[85dvh] w-full md:inset-y-0 md:bottom-auto md:left-auto md:h-full md:max-h-none md:w-[420px]';

  const borderClass =
    variant === 'bottom'
      ? 'border-t border-line'
      : 'border-t border-line md:border-t-0 md:border-l md:border-line';

  return (
    <div className="fixed inset-0 z-[60]" role="dialog" aria-modal="true" aria-label={title}>
      <div className="absolute inset-0 bg-ink/50" onClick={onClose} />
      <div
        ref={panelRef}
        className={`absolute ${position} bg-paper flex flex-col overscroll-contain ${borderClass} ${panelClassName}`}
      >
        {variant !== 'right' && (
          <div className="md:hidden pt-3 flex justify-center shrink-0" aria-hidden="true">
            <span className="w-10 h-1 bg-stone" />
          </div>
        )}
        <div className="flex items-center justify-between px-5 h-16 border-b border-line shrink-0">
          <h2 className="font-display font-extrabold uppercase text-[15px] tracking-tight">{title}</h2>
          <button
            onClick={onClose}
            className="w-11 h-11 -mr-3 flex items-center justify-center text-ink hover:text-graphite"
            aria-label="Close"
            type="button"
          >
            <Icon name="close" size={22} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto overscroll-contain">{children}</div>
        {footer && <div className="border-t border-line shrink-0">{footer}</div>}
      </div>
    </div>
  );
}
