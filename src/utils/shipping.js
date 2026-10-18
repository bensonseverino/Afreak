// Shipping configuration. Mirrors the backend defaults
// (FREE_SHIPPING_THRESHOLD_CENTS / FLAT_SHIPPING_CENTS / EXPRESS_SHIPPING_CENTS);
// POST /checkout/quote is authoritative at checkout.
export const FREE_SHIPPING_THRESHOLD = 150;
export const FLAT_SHIPPING = 6;
export const EXPRESS_SHIPPING = 12;

export const DELIVERY_METHODS = [
  { id: 'standard', label: 'Standard', note: '4–7 business days', price: FLAT_SHIPPING },
  { id: 'express', label: 'Express', note: '1–3 business days', price: EXPRESS_SHIPPING },
];

// Standard shipping is free above the threshold. Express is always paid.
export function shippingFor(subtotal, method = 'standard') {
  if (subtotal <= 0) return 0;
  if (method === 'express') return EXPRESS_SHIPPING;
  return subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : FLAT_SHIPPING;
}

// Amount still needed to reach free standard shipping.
export function amountToFreeShipping(subtotal) {
  return Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);
}
