import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Icon from '../ui/Icon';
import { isNavActive } from '../../config/nav';
import { useIsSignedIn, useLogout } from '../../hooks/useCustomer';
import useEscape from '../../hooks/useEscape';

// Warm the account chunk on hover/tap-start (spec §9).
const preheatAccount = () => {
  import('../../account/AccountLayout');
};

/** Signed-in destinations, in the same order as the dashboard sidebar. */
const accountLinks = [
  { label: 'Profile', to: '/account/profile', icon: 'user' },
  { label: 'Orders', to: '/account/orders', icon: 'bag' },
  { label: 'Wishlist', to: '/account/wishlist', icon: 'heart' },
];

const LABEL_CLASS =
  'font-sans font-semibold uppercase text-xs tracking-label whitespace-nowrap transition-colors';

/**
 * Header account control for tablet and up (≥768px). A profile icon that
 * matches the search and bag controls: inert while the session resolves, a
 * direct link to the login page when signed out (`aria-label="Sign in"`), and
 * signed in it shows `HI, {NAME}` with our own dropdown, so the panel's links
 * are plain links to a page of the dashboard.
 *
 * A disclosure, not a `role="menu"`: the items are plain links, so the trigger
 * is a button with `aria-expanded`/`aria-controls` and Tab walks out of the
 * panel normally. Closes on Escape (focus returns to the trigger), an outside
 * press, focus leaving the control, or a route change.
 */
export default function UserMenu() {
  const { signedIn, loading, me } = useIsSignedIn();
  const logout = useLogout();
  const location = useLocation();

  const rootRef = useRef(null);
  const triggerRef = useRef(null);
  const firstItemRef = useRef(null);

  // Open state is derived from the route, so navigating away closes the panel
  // without an effect (the menu can never outlive the page it opened on).
  const routeKey = location.pathname + location.search;
  const [openFor, setOpenFor] = useState(null);
  const open = openFor === routeKey;

  const close = useCallback((focusTrigger = false) => {
    setOpenFor(null);
    if (focusTrigger) triggerRef.current?.focus();
  }, []);

  const openMenu = useCallback(() => setOpenFor(routeKey), [routeKey]);

  useEscape(open, () => close(true));

  // Press outside the control.
  useEffect(() => {
    if (!open) return undefined;
    const onPointerDown = (event) => {
      if (!rootRef.current?.contains(event.target)) setOpenFor(null);
    };
    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, [open]);

  // Keyboard lands on the first entry, so the panel is usable without a mouse.
  // `loading`/`signedIn` are dependencies because the panel can be opened before
  // the session settles, in which case the items only mount a moment later.
  useEffect(() => {
    if (open) firstItemRef.current?.focus();
  }, [open, loading, signedIn]);

  if (loading) {
    return (
      <span
        className="hidden md:flex w-11 h-11 items-center justify-center text-graphite"
        aria-busy="true"
        aria-label="Account"
      >
        <Icon name="user" size={24} />
      </span>
    );
  }

  if (!signedIn) {
    return (
      <Link
        to="/account/login"
        onClick={preheatAccount}
        aria-label="Sign in"
        className="hidden md:flex w-11 h-11 items-center justify-center text-ink hover:text-graphite transition-colors"
      >
        <Icon name="user" size={24} />
      </Link>
    );
  }

  const customer = me?.customer;
  const firstName = customer?.firstName || '';
  const email = customer?.email || customer?.phone || '';

  const handleSignOut = () => {
    close();
    logout.mutate();
  };

  const rowClass =
    'flex items-center gap-3 px-5 h-12 font-sans font-semibold uppercase text-[12px] tracking-label transition-colors';

  return (
    <div
      ref={rootRef}
      className="hidden md:block relative"
      onBlur={(event) => {
        if (!rootRef.current?.contains(event.relatedTarget)) setOpenFor(null);
      }}
    >
      <button
        ref={triggerRef}
        type="button"
        onClick={() => (open ? close() : openMenu())}
        aria-expanded={open}
        aria-controls="header-user-menu"
        aria-label="Account menu"
        className={`relative inline-flex h-11 items-center gap-2 px-2 ${
          open ? 'text-ink' : 'text-ink hover:text-graphite'
        } ${LABEL_CLASS}`}
      >
        <Icon name="user" size={22} />
        {firstName ? `Hi, ${firstName}` : 'Account'}
        {open && <span aria-hidden="true" className="absolute bottom-0 left-2 right-2 h-[1.5px] bg-ink" />}
      </button>

      {open && (
        <div
          id="header-user-menu"
          className="animate-dropdown-in absolute right-0 top-full mt-[10px] md:mt-[14px] lg:mt-[18px] w-[252px] bg-paper border border-line"
        >
          <div className="px-5 py-4 border-b border-line">
            <p className="font-display font-extrabold uppercase text-[15px] leading-none tracking-tight text-ink truncate">
              {firstName || 'Your account'}
            </p>
            {email && <p className="mt-1.5 text-[11px] text-graphite truncate">{email}</p>}
          </div>

          <ul className="py-1">
            {accountLinks.map((item, index) => {
              const active = isNavActive(item.to, location);
              return (
                <li key={item.label}>
                  <Link
                    ref={index === 0 ? firstItemRef : undefined}
                    to={item.to}
                    onClick={() => close()}
                    aria-current={active ? 'page' : undefined}
                    className={`${rowClass} ${active ? 'bg-mist text-ink' : 'text-ink hover:bg-mist'}`}
                  >
                    <Icon name={item.icon} size={18} className="text-graphite" />
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>

          <button
            type="button"
            onClick={handleSignOut}
            disabled={logout.isPending}
            className={`${rowClass} w-full border-t border-line text-graphite hover:bg-mist hover:text-ink disabled:opacity-50`}
          >
            <Icon name="logout" size={18} />
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}
