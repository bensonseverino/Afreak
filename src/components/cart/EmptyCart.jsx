import Button from '../ui/Button';
import Icon from '../ui/Icon';
import ProductGrid from '../product/ProductGrid';
import { getNewArrivals } from '../../data/products';
import { useNavigate } from 'react-router-dom';

export default function EmptyCart() {
  const navigate = useNavigate();
  const arrivals = getNewArrivals().slice(0, 4);

  return (
    <div>
      <div className="text-center py-16 max-w-md mx-auto">
        <span className="inline-flex items-center justify-center text-ink mb-6" aria-hidden="true">
          <Icon name="bag" size={48} />
        </span>
        <h1 className="font-display font-extrabold uppercase text-[28px] text-ink">Your bag is empty</h1>
        <p className="text-[14px] text-graphite mt-3">
          Nothing here yet. Start with the pieces everyone is reaching for.
        </p>
        <Button
          variant="primary"
          onClick={() => navigate('/shop')}
          className="mt-6 h-14 px-8 text-[12px]"
        >
          Shop now
        </Button>
      </div>

      {arrivals.length > 0 && (
        <section className="mt-10" aria-label="New arrivals">
          <h2 className="font-sans font-bold uppercase text-[13px] tracking-label text-ink mb-6">
            New arrivals
          </h2>
          <ProductGrid products={arrivals} columns={{ base: 2, md: 3, lg: 4 }} />
        </section>
      )}
    </div>
  );
}
