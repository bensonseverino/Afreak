import { Link } from 'react-router-dom';
import Icon from '../ui/Icon';
import { useHome, useSettings } from '../../lib/catalog';
import { DEFAULT_FOOTER } from '../../data/defaults';

const footerLinks = {
  shop: [
    { label: 'All Products', href: '/shop' },
    { label: 'New Arrivals', href: '/shop?filter=new' },
    { label: 'Best Sellers', href: '/shop?sort=popular' },
    { label: 'Accessories', href: '/shop/accessories' },
  ],
  brand: [
    { label: 'About Us', href: '/about' },
    { label: 'Lookbook', href: '/lookbook' },
    { label: 'Journal', href: '/journal' },
    { label: 'Sustainability', href: '/sustainability' },
  ],
  care: [
    { label: 'Shipping & Returns', href: '/shipping-returns' },
    { label: 'Size Guide', href: '/size-guide' },
    { label: 'FAQ', href: '/faq' },
    { label: 'Contact Us', href: '/contact' },
  ],
};

/**
 * Footer (CMS CONNECTION FIX §5.2): blurb, store name and social links come
 * from the CMS. Social icons render only for non-empty URLs — an unset link is
 * omitted rather than pointing at "#".
 */
export default function Footer() {
  const { home } = useHome();
  const { settings } = useSettings();

  const footer = home?.footer ?? settings?.footer ?? null;
  const blurb = footer?.blurb || DEFAULT_FOOTER.blurb;
  const social = { ...DEFAULT_FOOTER.social, ...(footer?.social ?? {}) };
  const storeName = settings?.store?.name || 'AFREAK';

  const socialLinks = [
    { name: 'instagram', label: 'Instagram', href: social.instagram },
    { name: 'x', label: 'X', href: social.x },
    { name: 'youtube', label: 'YouTube', href: social.youtube },
    { name: 'pinterest', label: 'Pinterest', href: social.pinterest },
  ].filter((link) => typeof link.href === 'string' && link.href.trim().length > 0);

  return (
    <footer className="bg-mist border-t border-line" role="contentinfo">
      <div className="max-w-wide mx-auto px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8 lg:gap-12">
          {/* Brand Column */}
          <div className="col-span-2 lg:col-span-2 space-y-6">
            <Link
              to="/"
              className="font-display font-extrabold uppercase text-2xl tracking-tight text-ink"
              aria-label={`${storeName} Home`}
            >
              {storeName}
            </Link>
            <p className="text-graphite leading-relaxed text-sm max-w-xs">{blurb}</p>
            {(socialLinks.length > 0 || social.tiktok) && (
              <div className="flex items-center gap-4" role="list" aria-label="Social links">
                {socialLinks.map((link) => (
                  <a
                    key={link.name}
                    href={link.href}
                    className="w-8 h-8 flex items-center justify-center text-graphite hover:text-ink transition-colors"
                    aria-label={link.label}
                    role="listitem"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Icon name={link.name} size={20} />
                  </a>
                ))}
                {social.tiktok && (
                  <a
                    href={social.tiktok}
                    className="font-sans text-xs text-graphite hover:text-ink transition-colors link-underline"
                    role="listitem"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    TikTok
                  </a>
                )}
              </div>
            )}
          </div>

          {/* Shop Column */}
          <nav aria-label="Shop links">
            <h4 className="font-sans font-bold uppercase text-[11px] tracking-label text-ink mb-4">SHOP</h4>
            <ul className="space-y-3">
              {footerLinks.shop.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.href}
                    className="font-sans text-xs text-graphite hover:text-ink transition-colors link-underline"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Brand Column */}
          <nav aria-label="Brand links">
            <h4 className="font-sans font-bold uppercase text-[11px] tracking-label text-ink mb-4">BRAND</h4>
            <ul className="space-y-3">
              {footerLinks.brand.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.href}
                    className="font-sans text-xs text-graphite hover:text-ink transition-colors link-underline"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Customer Care Column */}
          <nav aria-label="Customer care links">
            <h4 className="font-sans font-bold uppercase text-[11px] tracking-label text-ink mb-4">
              CUSTOMER CARE
            </h4>
            <ul className="space-y-3">
              {footerLinks.care.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.href}
                    className="font-sans text-xs text-graphite hover:text-ink transition-colors link-underline"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Newsletter Column */}
          <div className="col-span-2 lg:col-span-2 space-y-4">
            <h4 className="font-sans font-bold uppercase text-[11px] tracking-label text-ink">NEWSLETTER</h4>
            <p className="text-graphite text-sm leading-relaxed max-w-sm">
              Subscribe to receive updates, access to exclusive deals, and more.
            </p>
            <form className="flex flex-col sm:flex-row gap-2 max-w-xs" aria-label="Newsletter signup">
              <label htmlFor="email" className="sr-only">
                Email address
              </label>
              <input
                type="email"
                id="email"
                placeholder="Enter your email"
                className="flex-1 h-12 px-4 bg-paper border border-line text-ink placeholder-graphite text-sm focus:outline-none focus:ring-2 focus:ring-ink focus:border-ink"
                required
              />
              <button
                type="submit"
                className="w-12 h-12 flex items-center justify-center bg-ink text-paper hover:bg-paper hover:text-ink hover:border hover:border-ink transition-colors"
              >
                <Icon name="arrowRight" size={20} />
              </button>
            </form>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-6 border-t border-line flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="font-sans text-xs text-graphite">© 2026 {storeName}. All rights reserved.</p>
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
            <Link to="/privacy" className="font-sans text-xs text-graphite hover:text-ink transition-colors link-underline">
              Privacy Policy
            </Link>
            <Link to="/terms" className="font-sans text-xs text-graphite hover:text-ink transition-colors link-underline">
              Terms & Conditions
            </Link>
            <a
              href="https://www.exchangerate-api.com"
              target="_blank"
              rel="noopener noreferrer"
              className="font-sans text-xs text-graphite hover:text-ink transition-colors link-underline"
            >
              Rates by Exchange Rate API
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
