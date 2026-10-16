import { Link } from 'react-router-dom';
import useNoIndex from '../../hooks/useNoIndex';

// Two-panel auth chrome (spec §3.6): ink panel on desktop, single column on mobile.
export default function AuthShell({ children }) {
  useNoIndex();

  return (
    <div className="min-h-[100dvh] lg:grid lg:grid-cols-[45%_1fr] bg-paper">
      {/* Left panel — desktop only */}
      <div className="hidden lg:flex bg-ink text-paper p-12 flex-col justify-between">
        <Link to="/" className="font-display font-extrabold uppercase text-2xl tracking-tight text-paper">
          AFREAK
        </Link>
        <div>
          <h1 className="font-display font-black uppercase text-6xl leading-[0.9] tracking-tight">
            Your orders.
            <br />
            Your drops.
          </h1>
          <p className="mt-6 max-w-xs text-[14px] text-paper/70 leading-relaxed">
            Sign in to track every drop from production to your door.
          </p>
          <span className="mt-8 block w-16 h-0.5 bg-volt" aria-hidden="true" />
        </div>
        <p className="text-[12px] text-paper/50">© 2026 AFREAK</p>
      </div>

      {/* Right / single column */}
      <div className="flex flex-col min-h-[100dvh]">
        <div className="h-2 bg-ink lg:hidden" aria-hidden="true" />

        <div className="lg:hidden pt-8 pb-2 text-center">
          <Link to="/" className="font-display font-extrabold uppercase text-2xl tracking-tight text-ink">
            AFREAK
          </Link>
        </div>

        <div className="flex-1 flex items-start lg:items-center justify-center px-6 py-8 lg:py-10">
          <div className="w-full max-w-sm">{children}</div>
        </div>

        <div className="px-6 pb-6 pt-2 flex items-center justify-center gap-5 text-[12px] text-graphite">
          <Link to="/shop" className="underline hover:text-ink">Continue shopping</Link>
        </div>
      </div>
    </div>
  );
}
