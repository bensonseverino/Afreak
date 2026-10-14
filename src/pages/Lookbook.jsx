import { lookbookItems } from '../data/lookbook';
import Placeholder from '../components/ui/Placeholder';
import { Link } from 'react-router-dom';

export default function Lookbook() {
  return (
    <div className="min-h-screen bg-paper">
      <div className="max-w-wide mx-auto px-6 lg:px-8 py-16">
        <header className="mb-12 lg:mb-16">
          <h1 className="font-display font-black uppercase text-4xl lg:text-5xl tracking-tight text-ink mb-4">
            LOOKBOOK
          </h1>
          <p className="font-sans text-graphite text-base lg:text-lg max-w-2xl leading-relaxed">
            Explore our latest collections through curated editorial spreads. Each look tells a story of craft, culture, and contemporary streetwear.
          </p>
        </header>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6" role="list">
          {lookbookItems.map((item, index) => (
            <Link
              key={item.id}
              to="#"
              className="group block overflow-hidden"
              aria-label={`View ${item.label}`}
              role="listitem"
            >
              <div className="aspect-[3/4] bg-stone overflow-hidden">
                <Placeholder 
                  ratio="aspect-[3/4]" 
                  label={item.label} 
                  className="grayscale group-hover:scale-[1.03] transition-transform duration-500"
                />
              </div>
              <div className="mt-4 text-center">
                <span className="font-sans font-medium uppercase text-xs tracking-label text-ink">
                  {item.label}
                </span>
              </div>
            </Link>
          ))}
        </div>

        {/* Pagination placeholder */}
        <nav className="mt-12 flex justify-center" aria-label="Lookbook pagination">
          <div className="flex items-center gap-2">
            <button className="w-10 h-10 flex items-center justify-center border border-line text-ink hover:bg-mist" aria-label="Previous">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5"><path d="M15 18l-6-6 6-6"/></svg>
            </button>
            <button className="w-10 h-10 flex items-center justify-center bg-ink text-paper" aria-label="Page 1">1</button>
            <button className="w-10 h-10 flex items-center justify-center border border-line text-ink hover:bg-mist" aria-label="Page 2">2</button>
            <button className="w-10 h-10 flex items-center justify-center border border-line text-ink hover:bg-mist" aria-label="Page 3">3</button>
            <span className="w-10 h-10 flex items-center justify-center text-graphite">…</span>
            <button className="w-10 h-10 flex items-center justify-center border border-line text-ink hover:bg-mist" aria-label="Page 6">6</button>
            <button className="w-10 h-10 flex items-center justify-center border border-line text-ink hover:bg-mist" aria-label="Next">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5"><path d="M9 6l6 6-6 6"/></svg>
            </button>
          </div>
        </nav>
      </div>
    </div>
  );
}