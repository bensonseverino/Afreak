/**
 * Table of contents for a legal page. Rendered twice by `LegalPage`: sticky on
 * desktop, inside the collapsible "On this page" panel on mobile/tablet.
 */
export default function PolicyTOC({ sections, activeId, label, className = '', onNavigate }) {
  return (
    <nav aria-label={label} className={className}>
      <ol className="space-y-0.5">
        {sections.map((section) => {
          const isActive = section.id === activeId;
          return (
            <li key={section.id}>
              <a
                href={`#${section.id}`}
                onClick={onNavigate}
                aria-current={isActive ? 'location' : undefined}
                className={`block border-l-2 py-1.5 pl-4 text-xs leading-5 transition-colors ${
                  isActive
                    ? 'border-ink font-semibold text-ink'
                    : 'border-line text-graphite hover:border-graphite hover:text-ink'
                }`}
              >
                {section.title}
              </a>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
