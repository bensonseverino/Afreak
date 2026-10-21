import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import Icon from '../ui/Icon';
import HamburgerButton from './HamburgerButton';
import UserMenu from './UserMenu';
import CurrencySwitcher from './CurrencySwitcher';
import { useCart } from '../../context/CartContext';
import { useUI } from '../../context/UIContext';
import { isNavActive, primaryNav } from '../../config/nav';
import { prefetchMenuData } from '../../hooks/useMenuData';

/**
 * Storefront header (spec §2).
 *   <1024px  hamburger · AFREAK · bag (tablet adds search + account)
 *   ≥1024px  AFREAK · centred nav · search · account · bag
 */
export default function Navbar() {
  const location = useLocation();
  const { count, openDrawer } = useCart();
  const { menuOpen, openMenu, menuTriggerRef } = useUI();
  const queryClient = useQueryClient();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Warm the menu queries on first idle so the first open is always instant (§8).
  // Desktop never renders the menu, so don't spend requests there.
  useEffect(() => {
    if (!window.matchMedia('(max-width: 1023.98px)').matches) return;
    if (typeof window.requestIdleCallback === 'function') {
      const id = window.requestIdleCallback(() => prefetchMenuData(queryClient));
      return () => window.cancelIdleCallback(id);
    }
    const timer = window.setTimeout(() => prefetchMenuData(queryClient), 1200);
    return () => window.clearTimeout(timer);
  }, [queryClient]);

  const isHomePage = location.pathname === '/';
  const showBorder = !isHomePage || isScrolled;

  return (
    <header
      className={`fixed inset-x-0 top-0 z-[var(--z-header)] bg-paper/95 backdrop-blur transition-colors duration-200 ${
        showBorder ? 'border-b border-line' : ''
      }`}
      style={{ paddingTop: 'env(safe-area-inset-top)' }}
    >
      <div className="relative max-w-wide mx-auto h-16 px-4 sm:px-6 md:h-[72px] lg:h-20 lg:px-8 flex items-center justify-between gap-2">
        {/* Left: hamburger (< lg) or wordmark (≥ lg) */}
        <div className="flex items-center min-w-0 lg:flex-1">
          <HamburgerButton ref={menuTriggerRef} open={menuOpen} onClick={openMenu} />
          <Link
            to="/"
            className="hidden lg:inline font-display font-extrabold uppercase text-2xl tracking-tight text-ink"
            aria-label="AFREAK Home"
          >
            AFREAK
          </Link>
        </div>

        {/* Centre: wordmark on mobile/tablet */}
        <Link
          to="/"
          className="lg:hidden absolute left-1/2 -translate-x-1/2 font-display font-extrabold uppercase tracking-tight text-ink text-xl md:text-2xl"
          aria-label="AFREAK Home"
        >
          AFREAK
        </Link>

        {/* Centre: desktop navigation (same config as the menu) */}
        <nav className="hidden lg:flex items-center gap-10" aria-label="Main navigation">
          {primaryNav.map((link) => {
            const active = isNavActive(link.to, location);
            return (
              <Link
                key={link.label}
                to={link.to}
                className={`font-sans font-medium uppercase text-xs tracking-label transition-colors relative ${
                  active ? 'text-ink' : 'text-graphite hover:text-ink'
                }`}
                aria-current={active ? 'page' : undefined}
              >
                {link.label}
                {active && <span className="absolute bottom-[-6px] left-0 right-0 h-[1px] bg-ink" />}
              </Link>
            );
          })}
        </nav>

        {/* Right: currency + search + account (tablet up), bag */}
        <div className="flex items-center gap-2 md:gap-4 lg:flex-1 lg:justify-end">
          <CurrencySwitcher />
          <Link
            to="/search"
            className="hidden md:flex w-11 h-11 items-center justify-center text-ink hover:text-graphite transition-colors"
            aria-label="Search"
          >
            <Icon name="search" size={24} />
          </Link>
          <UserMenu />
          <button
            type="button"
            onClick={openDrawer}
            className="relative w-11 h-11 -mr-2 flex items-center justify-center text-ink transition-colors hover:text-graphite"
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
    </header>
  );
}
