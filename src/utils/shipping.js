// Shipping configuration. These constants mirror the backend defaults
// (FREE_SHIPPING_THRESHOLD_CENTS / FLAT_SHIPPING_CENTS / EXPRESS_SHIPPING_CENTS)
// and are only used for first paint / when the CMS settings endpoint is
// unavailable. `POST /checkout/quote` remains authoritative at checkout.
export const FREE_SHIPPING_THRESHOLD = 150;
export const FLAT_SHIPPING = 6;
export const EXPRESS_SHIPPING = 12;

export const DELIVERY_METHODS = [
  { id: 'standard', label: 'Standard', note: '4–7 business days', price: FLAT_SHIPPING },
  { id: 'express', label: 'Express', note: '1–3 business days', price: EXPRESS_SHIPPING },
];

/**
 * Standard shipping is free above the threshold. Express is always paid.
 * Pass the CMS rates to keep the cart estimate in sync with /settings/public.
 */
export function shippingFor(subtotal, method = 'standard', rates = {}) {
  if (subtotal <= 0) return 0;
  const threshold = rates.freeShippingThreshold ?? FREE_SHIPPING_THRESHOLD;
  const flat = rates.flat ?? FLAT_SHIPPING;
  const express = rates.express ?? EXPRESS_SHIPPING;
  if (method === 'express') return express;
  return subtotal >= threshold ? 0 : flat;
}

// Amount still needed to reach free standard shipping.
export function amountToFreeShipping(subtotal, threshold = FREE_SHIPPING_THRESHOLD) {
  return Math.max(0, threshold - subtotal);
}
