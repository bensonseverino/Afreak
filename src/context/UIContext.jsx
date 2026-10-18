import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useCart } from './CartContext';

/**
 * Coordinates full-screen overlays so only one can ever be open (spec §4.2).
 *
 * The cart drawer's open state lives in `CartContext`; the menu's lives here.
 * They are kept mutually exclusive by closing the other on open and by the
 * guard effect below, so the two can never stack.
 */
const UIContext = createContext(null);

export function UIProvider({ children }) {
  const { isOpen: cartOpen, closeDrawer } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);
  // Sticky: once the menu has been opened the panel stays available for its
  // exit animation (spec §4.1). Also lets the menu chunk load off first paint.
  const [hasOpenedMenu, setHasOpenedMenu] = useState(false);
  // The hamburger that opened the menu — focus returns here on close (§4.2).
  const menuTriggerRef = useRef(null);
  // Owns the history entry pushed while the menu is open (§4.3). Opening pushes
  // one so the browser Back button closes the menu instead of leaving the page;
  // closing pops it again, but only if it is still the current entry.
  const menuEntryRef = useRef(false);

  const openMenu = useCallback(() => {
    closeDrawer();
    if (!menuEntryRef.current) {
      menuEntryRef.current = true;
      const idx = window.history.state?.idx;
      window.history.pushState(
        { idx: (typeof idx === 'number' ? idx : 0) + 1, afreakMenu: true },
        ''
      );
    }
    setHasOpenedMenu(true);
    setMenuOpen(true);
  }, [closeDrawer]);

  const closeMenu = useCallback(() => {
    if (menuEntryRef.current) {
      menuEntryRef.current = false;
      // Deferred by a tick on purpose: a tap on a menu link replaces this entry
      // with the destination in the same task, and stepping back here would undo
      // that navigation. By the time this runs the marker is either gone (the
      // link won, nothing to do) or still current (X / Escape — pop it).
      window.setTimeout(() => {
        if (window.history.state?.afreakMenu) window.history.back();
      }, 0);
    }
    setMenuOpen(false);
  }, []);

  const toggleMenu = useCallback(() => {
    if (menuOpen) closeMenu();
    else openMenu();
  }, [menuOpen, openMenu, closeMenu]);

  // Belt and braces: if the drawer opens some other way, drop the menu.
  useEffect(() => {
    if (cartOpen && menuOpen) setMenuOpen(false);
  }, [cartOpen, menuOpen]);

  const activeOverlay = menuOpen ? 'menu' : cartOpen ? 'cart' : null;

  const value = useMemo(
    () => ({
      activeOverlay,
      menuOpen,
      hasOpenedMenu,
      openMenu,
      closeMenu,
      toggleMenu,
      menuTriggerRef,
    }),
    [activeOverlay, menuOpen, hasOpenedMenu, openMenu, closeMenu, toggleMenu]
  );

  return <UIContext.Provider value={value}>{children}</UIContext.Provider>;
}

export function useUI() {
  const ctx = useContext(UIContext);
  if (!ctx) throw new Error('useUI must be used inside a UIProvider');
  return ctx;
}
