import { Link } from 'react-router-dom';
import Icon from '../ui/Icon';
import CmsImage from '../ui/CmsImage';
import { usePublicSettings } from '../../hooks/useMenuData';
import { DEFAULT_MENU_FEATURE } from '../../data/defaults';

/**
 * Promo tile (spec §3.6) — compact on mobile, tall on tablet. Content comes from
 * the `menu_feature` public setting (camelCase `menuFeature` since the CMS
 * connection fix) with a built-in fallback.
 */
export default function MenuFeatureTile({ stagger, onNavigate }) {
  const { settings } = usePublicSettings();
  const feature = { ...DEFAULT_MENU_FEATURE, ...(settings.menuFeature ?? settings.menu_feature ?? {}) };
  const to = feature.url || '/shop?new=1';
  const eyebrow = feature.eyebrow || DEFAULT_MENU_FEATURE.eyebrow;
  const title = feature.title || DEFAULT_MENU_FEATURE.title;

  return (
    <div className="menu-item menu-feature px-6 pb-1 pt-6 md:px-8" style={{ '--i': stagger }}>
      <Link
        to={to}
        replace
        onClick={onNavigate}
        className="group block border border-white/15 transition-colors hover:border-volt"
      >
        {/* Mobile: compact horizontal card */}
        <div className="flex items-center gap-4 p-3 md:hidden">
          <div className="h-[88px] w-[72px] shrink-0 overflow-hidden bg-white/10">
            {feature.image?.url ? (
              <CmsImage image={feature.image} alt={title} ratio="aspect-[3/4]" />
            ) : (
              <div aria-hidden="true" className="h-full w-full bg-white/10" />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-sans text-[11px] font-semibold uppercase tracking-label text-white/60">
              {eyebrow}
            </p>
            <p className="mt-1 font-display text-[20px] font-extrabold uppercase leading-tight tracking-tight text-paper">
              {title}
            </p>
          </div>
          <Icon name="arrowRight" size={20} className="shrink-0 text-volt" />
        </div>

        {/* Tablet: tall card with a caption strip */}
        <div className="hidden md:block">
          {feature.image?.url ? (
            <CmsImage image={feature.image} alt={title} ratio="aspect-[4/5]" />
          ) : (
            <div className="flex aspect-[4/5] items-center justify-center bg-white/10 text-[10px] font-semibold uppercase tracking-label text-white/40">
              Collection image
            </div>
          )}
          <div className="flex items-center justify-between gap-4 bg-ink px-4 py-3">
            <div>
              <p className="font-sans text-[11px] font-semibold uppercase tracking-label text-white/60">
                {eyebrow}
              </p>
              <p className="mt-0.5 font-display text-2xl font-extrabold uppercase leading-none tracking-tight text-paper">
                {title}
              </p>
            </div>
            <Icon name="arrowRight" size={22} className="shrink-0 text-volt" />
          </div>
        </div>
      </Link>
    </div>
  );
}
