import Icon from '../../components/ui/Icon';

// Shared account empty state: icon, title, copy, single action.
export default function EmptyState({ icon = 'bag', title, children, action, className = '' }) {
  return (
    <div className={`text-center py-14 max-w-md mx-auto ${className}`}>
      <span className="inline-flex items-center justify-center text-ink mb-5" aria-hidden="true">
        <Icon name={icon} size={44} />
      </span>
      <h2 className="font-display font-extrabold uppercase text-[24px] text-ink">{title}</h2>
      {children && <p className="text-[14px] text-graphite mt-3">{children}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
