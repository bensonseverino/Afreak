import { useRef } from 'react';
import Icon from './Icon';
import useLockBodyScroll from '../../hooks/useLockBodyScroll';
import useFocusTrap from '../../hooks/useFocusTrap';
import useEscape from '../../hooks/useEscape';

const WIDTHS = { sm: 'max-w-sm', md: 'max-w-md', lg: 'max-w-2xl' };

export default function Modal({ open, onClose, title, children, footer, size = 'md', bodyClassName = '' }) {
  const panelRef = useRef(null);
  useLockBodyScroll(open);
  useFocusTrap(open, panelRef);
  useEscape(open, onClose);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center sm:p-4" role="dialog" aria-modal="true" aria-label={title}>
      <div className="absolute inset-0 bg-ink/50" onClick={onClose} />
      <div
        ref={panelRef}
        className={`relative bg-paper w-full ${WIDTHS[size]} max-h-[90dvh] flex flex-col`}
      >
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
        <div className={`flex-1 overflow-y-auto overscroll-contain p-5 ${bodyClassName}`}>{children}</div>
        {footer && <div className="border-t border-line shrink-0">{footer}</div>}
      </div>
    </div>
  );
}
