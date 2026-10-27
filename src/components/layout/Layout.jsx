import { Outlet } from 'react-router-dom';
import { useEffect } from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import PromoBar from './PromoBar';
import Price from '../ui/Price';
import { useHome, useSettings } from '../../lib/catalog';
import { DEFAULT_PROMO_BAR, DEFAULT_SHIPPING_RULES } from '../../data/defaults';

export default function Layout() {
  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const { home } = useHome();
  const { settings } = useSettings();

  // Promo bar: CMS text wins; `active: false` hides the bar entirely (the CMS
  // is the switch). A brand-new store shows the shipping-message fallback.
  const promoBar = home?.promoBar ?? null;
  const threshold = (settings?.shipping?.thresholdCents ?? DEFAULT_SHIPPING_RULES.thresholdCents) / 100;
  const promoBarHidden = promoBar ? promoBar.active === false || !promoBar.text : false;
  const promoBarText = promoBar?.text || DEFAULT_PROMO_BAR.text;

  return (
    <div className="min-h-screen flex flex-col bg-paper">
      <PromoBar
        hidden={promoBarHidden}
        isFallback={!promoBar?.text}
        message={
          promoBar?.text ? (
            promoBar.text
          ) : (
            <>
              FREE SHIPPING WORLDWIDE ON ORDERS OVER <Price amount={threshold} />
            </>
          )
        }
      />
      <Navbar />
      <main className="flex-1 pt-16 md:pt-[72px] lg:pt-20">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
