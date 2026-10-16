import { Link } from 'react-router-dom';
import Icon from '../../components/ui/Icon';

// Full-width drill-down rows shown on the mobile Overview (spec §7, <640).
export default function AccountMenuList({ items, onSignOut }) {
  return (
    <nav aria-label="Account" className="border-t border-line">
      <ul>
        {items.map((item) => (
          <li key={item.to} className="border-b border-line">
            <Link
              to={item.to}
              className="flex items-center gap-4 h-14 px-1 text-ink hover:text-graphite"
            >
              <Icon name={item.icon} size={20} className="text-graphite" />
              <span className="flex-1 font-sans font-medium text-[14px]">{item.label}</span>
              {item.badge != null && item.badge > 0 && (
                <span className="text-[12px] text-graphite">{item.badge}</span>
              )}
              <Icon name="chevronRight" size={18} className="text-graphite" />
            </Link>
          </li>
        ))}
        {onSignOut && (
          <li className="border-b border-line">
            <button
              type="button"
              onClick={onSignOut}
              className="w-full flex items-center gap-4 h-14 px-1 text-ink hover:text-danger text-left"
            >
              <Icon name="arrowRightLong" size={20} className="text-graphite" />
              <span className="flex-1 font-sans font-medium text-[14px]">Sign out</span>
            </button>
          </li>
        )}
      </ul>
    </nav>
  );
}
