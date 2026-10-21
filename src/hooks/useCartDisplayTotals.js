import { useCart } from '../context/CartContext';
import useCurrency from './useCurrency';

/**
 * Cart totals converted for display.
 *
 * The subtotal is the sum of the converted line amounts (each rounded once),
 * and the total is composed from converted parts — so the rows a shopper sees
 * always add up to the total shown, in every currency.
 */
export default function useCartDisplayTotals() {
  const { items, discount, shipping, tax, subtotal, total } = useCart();
  const { convert } = useCurrency();

  const lineTotals = items.map((line) => convert(line.price * line.qty));
  const displaySubtotal = lineTotals.reduce((sum, value) => sum + value, 0);
  const displayDiscount = convert(discount);
  const displayShipping = convert(shipping);
  const displayTax = convert(tax);
  const displayTotal = Math.max(
    0,
    displaySubtotal - displayDiscount + displayShipping + displayTax,
  );

  return {
    items,
    lineTotals,
    displaySubtotal,
    displayDiscount,
    displayShipping,
    displayTax,
    displayTotal,
    baseSubtotal: subtotal,
    baseTotal: total,
  };
}
