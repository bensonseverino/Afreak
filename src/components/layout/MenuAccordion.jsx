import { Link } from 'react-router-dom';
import Icon from '../ui/Icon';

/**
 * Expandable primary row (spec §3.4). Generic: any primary item can opt into
 * children, today only SHOP does.
 */
export default function MenuAccordion({
  number,
  stagger,
  label,
  to,
  active = false,
  open = false,
  onToggle,
  panelId,
  onNavigate,
  children,
}) {
  return (
    <li className="menu-item border-b border-white/10" style={{ '--i': stagger }}>
      <div className="flex items-stretch">
        <Link
          to={to}
          replace
          onClick={onNavigate}
          aria-current={active ? 'page' : undefined}
          className="flex min-h-16 flex-1 items-center gap-4 px-6 py-3 md:min-h-[76px] md:px-8"
        >
          <span
            aria-hidden="true"
            className="menu-index w-7 shrink-0 self-start pt-1 font-sans text-[11px] font-semibold tabular-nums text-white/40"
          >
            {String(number).padStart(2, '0')}
          </span>
          <span
            className={`menu-label flex-1 font-display text-[clamp(2.25rem,11vw,3.5rem)] font-black uppercase leading-[0.95] tracking-tight transition-transform duration-150 md:text-6xl ${
              active ? 'text-volt' : 'text-paper'
            }`}
          >
            {label}
          </span>
          {active && <span aria-hidden="true" className="h-2 w-2 shrink-0 bg-volt" />}
        </Link>

        <button
          type="button"
          onClick={onToggle}
          aria-expanded={open}
          aria-controls={panelId}
          aria-label={`${open ? 'Hide' : 'Show'} ${label} categories`}
          className="flex w-14 shrink-0 items-center justify-center text-paper transition-colors hover:text-volt md:w-16"
        >
          <Icon
            name="plus"
            size={20}
            className={`transition-transform duration-200 ${open ? 'rotate-45' : ''}`}
          />
        </button>
      </div>

      {/* 0fr → 1fr keeps the reveal height-agnostic. */}
      <div
        id={panelId}
        className="grid overflow-hidden transition-[grid-template-rows] duration-[280ms] ease-out"
        style={{ gridTemplateRows: open ? '1fr' : '0fr' }}
      >
        <div className="overflow-hidden">{children}</div>
      </div>
    </li>
  );
}
