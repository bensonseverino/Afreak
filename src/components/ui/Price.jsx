import useCurrency from '../../hooks/useCurrency';

/**
 * A price in the shopper's chosen currency.
 * `amount` is always in the store base currency (KES); conversion and
 * rounding happen here so every display on the site stays consistent.
 */
export default function Price({ amount = 0, className = '', ...rest }) {
  const { format } = useCurrency();
  return (
    <span className={className} {...rest}>
      {format(amount)}
    </span>
  );
}
