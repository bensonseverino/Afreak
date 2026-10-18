import { Link } from 'react-router-dom';

/**
 * A primary menu row: numbered index, oversized Archivo label and — when the
 * route matches — a volt square at the right edge (spec §3.4).
 *
 * `replace` is deliberate: the menu pushes a history entry when it opens, and
 * navigating from inside it consumes that entry so the Back button still
 * returns to the page the visitor was on.
 */
export default function MenuLink({ number, stagger, label, to, active = false, onNavigate }) {
  return (
    <li className="menu-item border-b border-white/10" style={{ '--i': stagger }}>
      <Link
        to={to}
        replace
        onClick={onNavigate}
        aria-current={active ? 'page' : undefined}
        className="flex min-h-16 items-center gap-4 px-6 py-3 md:min-h-[76px] md:px-8"
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
    </li>
  );
}
