import { Link } from 'react-router-dom';
import Icon from './Icon';

export default function Pagination({ 
  currentPage = 1, 
  totalPages = 1, 
  baseUrl = '/shop',
  query = '',
  className = '' 
}) {
  if (totalPages <= 1) return null;

  // Extra query string to preserve (e.g. "status=active&q=AF-12").
  const suffix = query ? `&${query}` : '';
  const href = (page) => `${baseUrl}?page=${page}${suffix}`;

  const pages = [];
  const maxVisible = 5;

  let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
  let end = start + maxVisible - 1;

  if (end > totalPages) {
    end = totalPages;
    start = Math.max(1, end - maxVisible + 1);
  }

  for (let i = start; i <= end; i++) {
    pages.push(i);
  }

  return (
    <nav className={`flex items-center justify-center gap-2 ${className}`} aria-label="Pagination">
      <Link
        to={href(currentPage - 1)}
        className="w-10 h-10 flex items-center justify-center border border-line text-ink hover:bg-mist transition-colors"
        aria-label="Previous page"
        aria-disabled={currentPage === 1}
        tabIndex={currentPage === 1 ? -1 : 0}
      >
        <Icon name="arrowLeft" size={18} />
      </Link>

      {start > 1 && (
        <>
          <Link to={href(1)} className="w-10 h-10 flex items-center justify-center border border-line text-ink hover:bg-mist transition-colors">1</Link>
          {start > 2 && <span className="w-10 h-10 flex items-center justify-center text-graphite">…</span>}
        </>
      )}

      {pages.map(page => (
        <Link
          key={page}
          to={href(page)}
          className={`w-10 h-10 flex items-center justify-center font-sans font-medium text-[13px] transition-colors ${
            page === currentPage
              ? 'bg-ink text-paper'
              : 'border border-line text-ink hover:bg-mist'
          }`}
          aria-label={`Page ${page}`}
          aria-current={page === currentPage ? 'page' : undefined}
        >
          {page}
        </Link>
      ))}

      {end < totalPages && (
        <>
          {end < totalPages - 1 && <span className="w-10 h-10 flex items-center justify-center text-graphite">…</span>}
          <Link to={href(totalPages)} className="w-10 h-10 flex items-center justify-center border border-line text-ink hover:bg-mist transition-colors">{totalPages}</Link>
        </>
      )}

      <Link
        to={href(currentPage + 1)}
        className="w-10 h-10 flex items-center justify-center border border-line text-ink hover:bg-mist transition-colors"
        aria-label="Next page"
        aria-disabled={currentPage === totalPages}
        tabIndex={currentPage === totalPages ? -1 : 0}
      >
        <Icon name="arrowRight" size={18} />
      </Link>
    </nav>
  );
}
