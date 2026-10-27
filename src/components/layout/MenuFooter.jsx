import Icon from '../ui/Icon';
import Price from '../ui/Price';
import { menuSocials, FREE_SHIPPING_THRESHOLD_CENTS } from '../../config/nav';
import { usePublicSettings } from '../../hooks/useMenuData';

/** Shipping note + socials + copyright (spec §3.7). */
export default function MenuFooter({ stagger }) {
  const { settings } = usePublicSettings();
  const thresholdCents =
    Number(settings.shipping?.thresholdCents ?? settings.shipping?.threshold_cents) ||
    FREE_SHIPPING_THRESHOLD_CENTS;

  return (
    <div
      className="menu-item mt-auto border-t border-white/10 px-6 py-6 md:px-8"
      style={{ '--i': stagger }}
    >
      <p className="flex items-center gap-2 font-sans text-[11px] font-semibold uppercase tracking-label text-white/60">
        <span aria-hidden="true" className="h-1.5 w-1.5 shrink-0 bg-volt" />
        <span>
          Free shipping worldwide over <Price amount={thresholdCents / 100} />
        </span>
      </p>

      <div className="mt-4 flex items-center justify-between gap-4">
        <ul className="flex items-center gap-1">
          {menuSocials.map((social) => (
            <li key={social.name}>
              <a
                href={social.href}
                aria-label={social.label}
                className="flex h-11 w-11 items-center justify-center text-white/70 transition-colors hover:text-volt"
              >
                <Icon name={social.name} size={20} />
              </a>
            </li>
          ))}
        </ul>
        <p className="font-sans text-[11px] text-white/40">© 2026 AFREAK</p>
      </div>
    </div>
  );
}
