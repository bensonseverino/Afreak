import Icon from './Icon';

// Inline status toast (e.g. "Removed … UNDO").
export default function Toast({ open, message, actionLabel, onAction, onClose }) {
  if (!open) return null;
  return (
    <div
      className="fixed left-1/2 -translate-x-1/2 bottom-24 lg:bottom-8 z-[80] w-[calc(100%-2rem)] max-w-sm bg-ink text-paper px-4 py-3 flex items-center gap-4"
      role="status"
      aria-live="polite"
    >
      <span className="text-[13px] flex-1 min-w-0">{message}</span>
      {actionLabel && (
        <button
          onClick={onAction}
          className="font-sans font-semibold uppercase text-[12px] tracking-label text-volt shrink-0"
          type="button"
        >
          {actionLabel}
        </button>
      )}
      <button
        onClick={onClose}
        aria-label="Dismiss"
        className="w-8 h-8 -mr-2 flex items-center justify-center shrink-0 text-paper/70 hover:text-paper"
        type="button"
      >
        <Icon name="close" size={16} />
      </button>
    </div>
  );
}
