import Icon from '../../components/ui/Icon';

/**
 * Square, 1px-bordered notice shown above an auth form's submit button
 * (spec §6.3): invalid credentials in `danger`, status notices in ink.
 */
export default function AuthNotice({ tone = 'danger', icon, title, children }) {
  const danger = tone === 'danger';
  return (
    <div
      role="alert"
      className={`border bg-paper p-4 flex items-start gap-3 ${danger ? 'border-danger' : 'border-line'}`}
    >
      {icon && (
        <Icon
          name={icon}
          size={18}
          className={`${danger ? 'text-danger' : 'text-graphite'} shrink-0 mt-0.5`}
        />
      )}
      <div className="min-w-0">
        {title && (
          <p
            className={`font-sans font-bold uppercase text-[12px] tracking-label ${
              danger ? 'text-danger' : 'text-ink'
            }`}
          >
            {title}
          </p>
        )}
        {children && (
          <p className={`text-[13px] leading-relaxed ${danger ? 'text-danger' : 'text-graphite'} ${title ? 'mt-1' : ''}`}>
            {children}
          </p>
        )}
      </div>
    </div>
  );
}
