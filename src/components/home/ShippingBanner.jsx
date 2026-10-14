import Button from '../ui/Button';
import Icon from '../ui/Icon';
import { Link } from 'react-router-dom';

export default function ShippingBanner() {
  return (
    <section className="bg-ink text-paper py-8" aria-labelledby="shipping-heading">
      <div className="max-w-wide mx-auto px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-16 h-16 lg:w-20 lg:h-20 flex items-center justify-center">
              <Icon name="globe" size={64} strokeWidth={1} />
            </div>
            <div>
              <h2 id="shipping-heading" className="font-display font-bold uppercase text-[22px] lg:text-[28px] tracking-tight mb-1">
                FREE SHIPPING WORLDWIDE
              </h2>
              <p className="font-sans text-[14px] text-paper/70">
                On all orders over €150
              </p>
            </div>
          </div>
          <Link to="/shop" className="w-full lg:w-auto">
            <Button variant="outline" className="w-full lg:w-auto justify-center gap-2 border-volt text-volt hover:bg-volt hover:text-ink">
              SHOP NOW
              <Icon name="arrowRightLong" size={20} />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}