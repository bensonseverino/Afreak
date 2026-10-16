import { Link } from 'react-router-dom';

// Big-number square tile used on the Overview (spec §8.1.2).
export default function StatTile({ label, value, to }) {
  const inner = (
    <>
      <span className="block font-display font-extrabold text-[36px] md:text-[40px] leading-none text-ink">
        {value}
      </span>
      <span className="mt-2 block font-sans font-bold uppercase text-[11px] tracking-label text-graphite">
        {label}
      </span>
    </>
  );

  const className = 'block border border-line bg-paper p-4 md:p-5 hover:border-ink transition-colors';

  return to ? (
    <Link to={to} className={className}>
      {inner}
    </Link>
  ) : (
    <div className={className}>{inner}</div>
  );
}
