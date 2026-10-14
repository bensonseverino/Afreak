import Placeholder from '../ui/Placeholder';
import Button from '../ui/Button';
import { Link } from 'react-router-dom';

export default function PromoBanner() {
  return (
    <section className="bg-mist mb-10" aria-labelledby="promo-heading">
      <div className="max-w-wide mx-auto px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 min-h-[220px]">
          <div className="flex flex-col justify-center p-8 lg:p-12">
            <h2 id="promo-heading" className="font-display font-extrabold uppercase text-3xl lg:text-4xl tracking-tight text-ink mb-4">
              20% OFF ONLY TODAY.
            </h2>
            <p className="font-sans text-graphite mb-6 max-w-sm">
              Use code <span className="font-semibold text-ink">SPRING20</span> at checkout. Limited time offer.
            </p>
            <Link to="/shop">
              <Button variant="solid" className="w-full lg:w-auto">
                SHOP NOW
              </Button>
            </Link>
          </div>
          <div className="relative aspect-[4/3] bg-paper overflow-hidden">
            <Placeholder ratio="aspect-[4/3]" label="MODEL IMAGE" />
          </div>
        </div>
      </div>
    </section>
  );
}