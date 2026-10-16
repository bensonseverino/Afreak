import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Icon from '../ui/Icon';
import { useCart } from '../../context/CartContext';

const navLinks = [
  { label: 'SHOP', href: '/shop' },
  { label: 'LOOKBOOK', href: '/lookbook' },
  { label: 'ABOUT', href: '/about' },
  { label: 'JOURNAL', href: '/journal' },
  { label: 'CONTACT', href: '/contact' },
];

export default function Navbar() {
  const location = useLocation();
  const { count, openDrawer } = useCart();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isHomePage, setIsHomePage] = useState(true);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsHomePage(location.pathname === '/');
  }, [location.pathname]);

  const handleKeyDown = (e) => {
    if (e.key === 'Escape' && isMobileMenuOpen) {
      setIsMobileMenuOpen(false);
    }
  };

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  const showBorder = !isHomePage || isScrolled;

  return (
    <header className={`fixed top-0 left-0 right-0 z-40 h-[80px] bg-paper/95 backdrop-blur transition-all duration-200 ${showBorder ? 'border-b border-line' : ''}`}>
      <div className="max-w-wide mx-auto px-6 lg:px-8 h-full flex items-center justify-between">
        {/* Mobile Hamburger */}
        <button
          onClick={() => setIsMobileMenuOpen(true)}
          className="lg:hidden w-11 h-11 flex items-center justify-center text-ink"
          aria-label="Open menu"
          aria-expanded={isMobileMenuOpen}
        >
          <Icon name="menu" size={24} />
        </button>

        {/* Logo */}
        <Link 
          to="/" 
          className="font-display font-extrabold uppercase text-2xl tracking-tight text-ink flex-shrink-0 lg:ml-0"
          aria-label="AFREAK Home"
        >
          AFREAK
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-10" aria-label="Main navigation">
          {navLinks.map(link => (
            <Link
              key={link.label}
              to={link.href}
              className={`font-sans font-medium uppercase text-xs tracking-label transition-colors relative ${location.pathname === link.href ? 'text-ink' : 'text-graphite hover:text-ink'}`}
              aria-current={location.pathname === link.href ? 'page' : undefined}
            >
              {link.label}
              {location.pathname === link.href && (
                <span className="absolute bottom-[-6px] left-0 right-0 h-[1px] bg-ink" />
              )}
            </Link>
          ))}
          <Link
            to="/shop"
            className="font-sans font-medium uppercase text-xs tracking-label text-graphite hover:text-ink transition-colors"
          >
            CUSTOM PRINT
          </Link>
        </nav>

        {/* Right Icons */}
        <div className="flex items-center gap-6">
          <Link to="/search" className="w-11 h-11 flex items-center justify-center text-ink hover:text-graphite transition-colors" aria-label="Search">
            <Icon name="search" size={24} />
          </Link>
          <Link to="/account" className="w-11 h-11 flex items-center justify-center text-ink hover:text-graphite transition-colors" aria-label="Account">
            <Icon name="user" size={24} />
          </Link>
          <button
            type="button"
            onClick={openDrawer}
            className="relative w-11 h-11 flex items-center justify-center text-ink transition-colors hover:text-graphite"
            aria-label={`Open shopping bag${count > 0 ? `, ${count} items` : ''}`}
          >
            <Icon name="bag" size={24} />
            {count > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[18px] h-5 bg-ink text-paper text-[10px] font-bold flex items-center justify-center px-1">
                {count > 99 ? '99+' : count}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 z-50 bg-paper lg:hidden" 
          role="dialog" 
          aria-modal="true" 
          aria-label="Navigation menu"
        >
          <div className="flex h-full flex-col">
            <div className="h-[80px] flex items-center justify-end px-6 border-b border-line">
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="w-11 h-11 flex items-center justify-center text-ink"
                aria-label="Close menu"
              >
                <Icon name="close" size={24} />
              </button>
            </div>
            <nav className="flex-1 py-12 px-6 overflow-y-auto" aria-label="Mobile navigation">
              <ul className="space-y-6">
                {navLinks.map(link => (
                  <li key={link.label}>
                    <Link
                      to={link.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`block font-display font-bold uppercase text-4xl tracking-tight transition-colors ${location.pathname === link.href ? 'text-ink' : 'text-graphite hover:text-ink'}`}
                      aria-current={location.pathname === link.href ? 'page' : undefined}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
                <li>
                  <Link
                    to="/shop"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block font-display font-bold uppercase text-4xl tracking-tight text-graphite hover:text-ink transition-colors"
                  >
                    CUSTOM PRINT
                  </Link>
                </li>
              </ul>
            </nav>
          </div>
        </div>
      )}
    </header>
  );
}