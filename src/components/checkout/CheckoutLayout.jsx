import { Link, useNavigate } from 'react-router-dom';
import Icon from '../ui/Icon';

// Minimal checkout chrome: back arrow · wordmark · lock. No mega-footer.
export default function CheckoutLayout({ children, progress }) {
  const navigate = useNavigate();

  return (
    <div className="min-h-[100dvh] flex flex-col bg-paper">
      <header className="border-b border-line sticky top-0 z-30 bg-paper">
        <div className="max-w-wide mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
          <button
            type="button"
            onClick={() => navigate(-1)}
            aria-label="Go back"
            className="w-11 h-11 -ml-3 flex items-center justify-center text-ink hover:text-graphite"
          >
            <Icon name="arrowLeftLong" size={20} />
          </button>
          <Link
            to="/"
            className="font-display font-extrabold uppercase tracking-tight text-[18px] text-ink"
          >
            AFREAK
          </Link>
          <span className="w-11 h-11 flex items-center justify-center text-graphite" aria-hidden="true">
            <Icon name="lock" size={18} />
          </span>
        </div>
        {progress}
      </header>

      <main className="flex-1">{children}</main>

      <footer className="border-t border-line">
        <div className="max-w-wide mx-auto px-4 md:px-6 py-6 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-[12px] text-graphite">
          <a href="#" className="underline hover:text-ink">
            Refund policy
          </a>
          <a href="#" className="underline hover:text-ink">
            Privacy policy
          </a>
          <a href="#" className="underline hover:text-ink">
            Terms
          </a>
        </div>
      </footer>
    </div>
  );
}
