import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Link, useLocation } from 'react-router-dom';
import Icon from '../ui/Icon';
import MenuAccordion from './MenuAccordion';
import MenuFeatureTile from './MenuFeatureTile';
import MenuFooter from './MenuFooter';
import MenuLink from './MenuLink';
import MenuSearch from './MenuSearch';
import { useUI } from '../../context/UIContext';
import { useCart } from '../../context/CartContext';
import { useIsSignedIn, useLogout } from '../../hooks/useCustomer';
import { useCategories } from '../../hooks/useMenuData';
import useEscape from '../../hooks/useEscape';
import useFocusTrap from '../../hooks/useFocusTrap';
import useMediaQuery from '../../hooks/useMediaQuery';
import useScrollLock from '../../hooks/useScrollLock';
import useSwipeToClose from '../../hooks/useSwipeToClose';
import { isNavActive, primaryNav, secondaryNav, staticShopLinks } from '../../config/nav';

const SHOP_PANEL_ID = 'mobile-menu-shop';
const STAGGER = { search: 0, secondary: 7, feature: 8, footer: 9 };

/**
 * Mobile (<768px) full-screen menu / tablet (768–1023px) left drawer.
 * Rendered in a portal on `document.body` so the panel can sit above the header
 * and so marking `#root` inert never touches it. Spec §3–§5.
 */
export default function MobileMenu() {
  const { menuOpen, closeMenu, menuTriggerRef } = useUI();
  const { count, openDrawer } = useCart();
  const location = useLocation();
  const { categories } = useCategories();
  const { signedIn, me, user } = useIsSignedIn();
  const logout = useLogout();
  const isTablet = useMediaQuery('(min-width: 768px)');
  const isDesktop = useMediaQuery('(min-width: 1024px)');

  const panelRef = useRef(null);
  const wasOpen = useRef(false);
  const openedAt = useRef(null);
  const hadMounted = useRef(false);

  // closed → entering (keyframe) → open (inline transforms allowed) → closing → closed
  const [state, setState] = useState('closed');
  const [shopOpen, setShopOpen] = useState(false);

  // Render as soon as the menu is asked to open, so the panel is in the DOM
  // before the focus trap activates.
  const mounted = menuOpen || state !== 'closed';

  const shopLinks = useMemo(
    () => [
      ...staticShopLinks.map((link) => ({ label: link.label, to: link.to })),
      ...categories.map((category) => ({
        label: category.name,
        to: `/shop?category=${category.slug}`,
        count: category.count,
      })),
    ],
    [categories]
  );

  const firstName = me?.customer?.firstName || user?.firstName || '';

  /* ---------------- open / close state machine ---------------- */
  useEffect(() => {
    if (menuOpen && !wasOpen.current) {
      wasOpen.current = true;
      setShopOpen(location.pathname.startsWith('/shop'));
      setState('entering');
      return;
    }
    if (!menuOpen && wasOpen.current) {
      wasOpen.current = false;
      setState('closing');
    }
  }, [menuOpen, location.pathname]);

  // Safety net: never leave the panel stuck in a transitional state if an
  // animation/transition event is missed (hidden tab, interrupted animation).
  useEffect(() => {
    if (state !== 'closing' && state !== 'entering') return undefined;
    const timer = window.setTimeout(
      () => setState(state === 'closing' ? 'closed' : 'open'),
      state === 'closing' ? 500 : 700
    );
    return () => window.clearTimeout(timer);
  }, [state]);

  /* ---------------- close triggers ---------------- */
  // Viewport grows to the desktop breakpoint (§5).
  useEffect(() => {
    if (menuOpen && isDesktop) closeMenu();
  }, [menuOpen, isDesktop, closeMenu]);

  // Any route change while open (§4.1).
  useEffect(() => {
    if (!menuOpen) {
      openedAt.current = null;
      return;
    }
    const key = `${location.pathname}${location.search}`;
    if (openedAt.current === null) {
      openedAt.current = key;
      return;
    }
    if (openedAt.current !== key) {
      openedAt.current = null;
      closeMenu();
    }
  }, [menuOpen, location.pathname, location.search, closeMenu]);

  // Browser Back / Android back gesture closes the menu instead of leaving the
  // page (§4.3). The history entry itself is owned by UIContext; closing twice is
  // a no-op, so the listener can simply live for the component's lifetime.
  useEffect(() => {
    const onPopState = () => closeMenu();
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, [closeMenu]);

  /* ---------------- scroll lock, gesture, inert, focus ---------------- */
  useScrollLock(mounted);
  useSwipeToClose(mounted, panelRef, closeMenu);
  useEscape(menuOpen, closeMenu);

  // Declared before the focus trap so this cleanup (un-inerting `#root`) runs
  // first and focus can return to the hamburger. Released as soon as the menu
  // starts closing so a drawer opened from the menu is immediately usable.
  useEffect(() => {
    if (!menuOpen) return undefined;
    const root = document.getElementById('root');
    if (!root) return undefined;
    const children = Array.from(root.children);
    children.forEach((child) => {
      child.setAttribute('inert', '');
      child.setAttribute('aria-hidden', 'true');
    });
    return () => {
      children.forEach((child) => {
        child.removeAttribute('inert');
        child.removeAttribute('aria-hidden');
      });
    };
  }, [menuOpen]);

  useFocusTrap(mounted, panelRef);

  // Focus the hamburger again once the panel is gone (§4.2).
  useEffect(() => {
    if (mounted) {
      hadMounted.current = true;
      return;
    }
    if (hadMounted.current) {
      hadMounted.current = false;
      menuTriggerRef.current?.focus?.();
    }
  }, [mounted, menuTriggerRef]);

  const handleBag = () => {
    closeMenu();
    openDrawer();
  };

  const handleSignOut = () => {
    closeMenu();
    logout.mutate();
  };

  if (!mounted) return null;

  return createPortal(
    <>
      {isTablet && (
        <div
          className="menu-scrim fixed inset-0 bg-ink/60 backdrop-blur-[2px]"
          style={{ zIndex: 'var(--z-scrim)' }}
          data-state={state}
          onClick={closeMenu}
          aria-hidden="true"
        />
      )}

      <aside
        id="mobile-menu"
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label="Main menu"
        data-state={state}
        className="menu-panel fixed inset-y-0 left-0 flex w-full touch-pan-y flex-col bg-ink text-paper md:w-[480px]"
        style={{
          zIndex: 'var(--z-menu)',
          paddingTop: 'env(safe-area-inset-top)',
          paddingBottom: 'env(safe-area-inset-bottom)',
        }}
        onAnimationEnd={(event) => {
          if (event.target === event.currentTarget && state === 'entering') setState('open');
        }}
        onTransitionEnd={(event) => {
          if (event.target === event.currentTarget && state === 'closing') setState('closed');
        }}
      >
        {/* Top bar — close sits exactly where the hamburger was (§3.2) */}
        <div className="relative flex h-16 shrink-0 items-center justify-between border-b border-white/10 px-4 md:h-[72px] md:px-6">
          <button
            type="button"
            onClick={closeMenu}
            aria-label="Close menu"
            className="-ml-3 flex h-11 w-11 items-center justify-center text-paper transition-colors hover:text-volt"
          >
            <Icon name="close" size={22} />
          </button>

          <Link
            to="/"
            replace
            onClick={closeMenu}
            aria-label="Afreak home"
            className="absolute left-1/2 -translate-x-1/2 font-display text-xl font-extrabold uppercase tracking-tight text-paper md:text-2xl"
          >
            AFREAK
          </Link>

          <button
            type="button"
            onClick={handleBag}
            aria-label={`Open shopping bag${count > 0 ? `, ${count} items` : ''}`}
            className="relative -mr-2 flex h-11 w-11 items-center justify-center text-paper transition-colors hover:text-volt"
          >
            <Icon name="bag" size={22} />
            {count > 0 && (
              <span className="absolute right-0 top-1.5 flex h-4 min-w-4 items-center justify-center bg-volt px-1 text-[10px] font-bold leading-none text-ink">
                {count > 99 ? '99+' : count}
              </span>
            )}
          </button>
        </div>

        <div className="flex flex-1 flex-col overflow-y-auto overscroll-contain">
          <MenuSearch stagger={STAGGER.search} onNavigate={closeMenu} />

          <ul className="menu-primary">
            {primaryNav.map((item, index) =>
              item.children ? (
                <MenuAccordion
                  key={item.label}
                  number={index + 1}
                  stagger={index + 1}
                  label={item.label}
                  to={item.to}
                  active={isNavActive(item.to, location)}
                  open={shopOpen}
                  onToggle={() => setShopOpen((open) => !open)}
                  panelId={SHOP_PANEL_ID}
                  onNavigate={closeMenu}
                >
                  <ul>
                    {shopLinks.map((link) => (
                      <li key={link.label}>
                        <Link
                          to={link.to}
                          replace
                          onClick={closeMenu}
                          className="flex min-h-12 items-center justify-between gap-4 pl-[52px] pr-6 font-sans text-[15px] font-semibold uppercase tracking-label text-white/80 transition-colors hover:text-volt md:pr-8"
                        >
                          <span>{link.label}</span>
                          {link.count != null && (
                            <span className="tabular-nums text-white/40">{link.count}</span>
                          )}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </MenuAccordion>
              ) : (
                <MenuLink
                  key={item.label}
                  number={index + 1}
                  stagger={index + 1}
                  label={item.label}
                  to={item.to}
                  active={isNavActive(item.to, location)}
                  onNavigate={closeMenu}
                />
              )
            )}
          </ul>

          {/* Secondary links (§3.5) */}
          <div
            className="menu-item border-t border-white/10 px-6 py-6 md:px-8"
            style={{ '--i': STAGGER.secondary }}
          >
            <ul className="grid grid-cols-2 gap-x-6 gap-y-1">
              <li>
                <Link
                  to={signedIn ? '/account' : '/sign-in'}
                  replace
                  onClick={closeMenu}
                  className="flex min-h-11 items-center font-sans text-[13px] font-semibold uppercase tracking-label text-white/80 transition-colors hover:text-volt"
                >
                  {signedIn && firstName ? `Hi, ${firstName}` : signedIn ? 'Your account' : 'Sign in'}
                </Link>
              </li>
              {secondaryNav.map((item) => (
                <li key={item.label}>
                  <Link
                    to={item.to}
                    replace
                    onClick={closeMenu}
                    className="flex min-h-11 items-center font-sans text-[13px] font-semibold uppercase tracking-label text-white/80 transition-colors hover:text-volt"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
              {signedIn && (
                <li>
                  <button
                    type="button"
                    onClick={handleSignOut}
                    className="flex min-h-11 items-center font-sans text-[13px] font-semibold uppercase tracking-label text-white/60 transition-colors hover:text-volt"
                  >
                    Sign out
                  </button>
                </li>
              )}
            </ul>
          </div>

          <MenuFeatureTile stagger={STAGGER.feature} onNavigate={closeMenu} />
          <MenuFooter stagger={STAGGER.footer} />
        </div>
      </aside>
    </>,
    document.body
  );
}
