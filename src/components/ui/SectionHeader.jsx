import { Link } from 'react-router-dom';

export default function SectionHeader({ label, href = '/shop', showViewAll = true, className = '' }) {
  return (
    <div className={`flex items-end justify-between mb-8 ${className}`}>
      <span className="font-sans font-bold uppercase text-[13px] tracking-label text-ink">{label}</span>
      {showViewAll && (
        <Link to={href} className="font-sans font-medium uppercase text-[13px] tracking-label text-ink hover:text-graphite transition-colors link-underline">
          VIEW ALL
        </Link>
      )}
    </div>
  );
}