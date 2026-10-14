import { useCart } from '../context/CartContext';
import { formatPrice } from '../data/products';
import Placeholder from '../components/ui/Placeholder';
import Button from '../components/ui/Button';
import QuantityStepper from '../components/ui/QuantityStepper';
import Icon from '../components/ui/Icon';
import { Link } from 'react-router-dom';

export default function Cart() {
  const { items, total, updateQuantity, removeItem, clearCart } = useCart();

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-paper flex items-center justify-center">
        <div className="max-w-md mx-auto px-6 py-16 text-center">
          <div className="w-24 h-24 mx-auto mb-8 bg-mist flex items-center justify-center">
            <Icon name="bag" size={48} className="text-stone" />
          </div>
          <h1 className="font-display font-bold uppercase text-2xl text-ink mb-4">YOUR BAG IS EMPTY</h1>
          <p className="text-graphite mb-8">Looks like you haven't added anything yet.</p>
          <Link to="/shop">
            <Button variant="solid">START SHOPPING</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-paper">
      <div className="max-w-wide mx-auto px-6 lg:px-8 py-10 lg:py-12">
        <h1 className="font-display font-black uppercase text-3xl lg:text-4xl tracking-tight text-ink mb-8">
          SHOPPING BAG
        </h1>

        <div className="grid lg:grid-cols-[1fr_380px] gap-10">
          {/* Cart Items */}
          <div className="space-y-6">
            {items.map((item, index) => (
              <div key={`${item.productId}-${item.size}-${item.color}`} className="flex gap-6 p-6 border border-line bg-paper">
                <div className="flex-shrink-0 w-24 h-32 bg-card overflow-hidden">
                  <Placeholder ratio="aspect-[3/4]" label={item.name.toUpperCase()} src={item.image} alt={item.name} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="font-sans font-bold uppercase text-[13px] text-ink">{item.name.toUpperCase()}</h3>
                      <div className="flex items-center gap-3 mt-1 text-xs text-graphite">
                        <span>Size: <span className="font-medium text-ink">{item.size}</span></span>
                        <span>Color: <span className="font-medium text-ink" style={{ textTransform: 'capitalize' }}>{item.color === '#000000' ? 'Black' : 'Gray'}</span></span>
                      </div>
                    </div>
                    <button
                      onClick={() => removeItem(item.productId, item.size, item.color)}
                      className="flex-shrink-0 w-8 h-8 flex items-center justify-center text-graphite hover:text-ink hover:bg-mist transition-colors"
                      aria-label={`Remove ${item.name}`}
                    >
                      <Icon name="close" size={18} />
                    </button>
                  </div>
                  <div className="flex items-center justify-between mt-4">
                    <QuantityStepper 
                      value={item.quantity} 
                      onChange={qty => updateQuantity(item.productId, item.size, item.color, qty)}
                      max={10}
                    />
                    <span className="font-sans font-bold text-[13px] text-ink">
                      {formatPrice(item.price * item.quantity)}
                    </span>
                  </div>
                </div>
              </div>
            ))}

            {/* Cart Actions */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-line">
              <Button variant="outline" onClick={clearCart} className="w-full sm:w-auto">
                CLEAR BAG
              </Button>
              <Link to="/shop">
                <Button variant="link" className="w-full sm:w-auto justify-center">
                  CONTINUE SHOPPING
                </Button>
              </Link>
            </div>
          </div>

          {/* Order Summary */}
          <aside className="lg:sticky lg:top-[100px] border border-line p-6 bg-paper">
            <h2 className="font-sans font-bold uppercase text-xs tracking-label text-ink mb-6">ORDER SUMMARY</h2>
            
            <dl className="space-y-4 mb-6">
              <div className="flex justify-between text-sm">
                <dt className="text-graphite">Subtotal ({items.reduce((sum, i) => sum + i.quantity, 0)} items)</dt>
                <dd className="font-medium text-ink">{formatPrice(total)}</dd>
              </div>
              <div className="flex justify-between text-sm">
                <dt className="text-graphite">Shipping</dt>
                <dd className="font-medium text-ink">{total >= 150 ? 'FREE' : formatPrice(15)}</dd>
              </div>
              {total < 150 && (
                <p className="text-[12px] text-volt font-medium">Add {formatPrice(150 - total)} more for free shipping</p>
              )}
              <div className="border-t border-line pt-4 flex justify-between">
                <dt className="font-semibold text-ink">TOTAL</dt>
                <dd className="font-bold text-[15px] text-ink">{formatPrice(total >= 150 ? total : total + 15)}</dd>
              </div>
            </dl>

            <Link to="/checkout" className="block">
              <Button variant="solid" className="w-full h-[56px] text-[13px]">
                PROCEED TO CHECKOUT
              </Button>
            </Link>

            <p className="text-center text-[11px] text-graphite mt-6">
              Secure checkout · Free returns · 2-year warranty
            </p>
          </aside>
        </div>
      </div>
    </div>
  );
}