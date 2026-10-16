import { createContext, useContext, useState, useCallback, useMemo, useEffect } from 'react';
import { shippingFor } from '../utils/shipping';

const CartContext = createContext(null);
const STORAGE_KEY = 'afreak.cart.v2';

export const PROMO_CODES = { AFREAK10: 0.1 };

// lineId = productId|color|size|printKey — identical lines merge.
export function buildLineId({ productId, color = '', size = '', print }) {
  const printKey = print?.enabled ? `p-${print.placement}-${print.fileName || 'file'}` : 'none';
  return `${productId}|${color}|${size}|${printKey}`;
}

function loadItems() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function CartProvider({ children }) {
  const [items, setItems] = useState(loadItems);
  const [isOpen, setIsOpen] = useState(false);
  const [shippingMethod, setShippingMethod] = useState('standard');
  const [promoCode, setPromoCode] = useState('');

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      /* storage unavailable — cart stays in memory */
    }
  }, [items]);

  const count = useMemo(() => items.reduce((sum, i) => sum + i.qty, 0), [items]);
  const subtotal = useMemo(() => items.reduce((sum, i) => sum + i.price * i.qty, 0), [items]);
  const discount = useMemo(
    () => (promoCode && PROMO_CODES[promoCode] ? subtotal * PROMO_CODES[promoCode] : 0),
    [promoCode, subtotal]
  );
  const shipping = useMemo(
    () => shippingFor(subtotal - discount, shippingMethod),
    [subtotal, discount, shippingMethod]
  );
  const tax = 0;
  const total = Math.max(0, subtotal - discount + shipping + tax);

  const addItem = useCallback((item, options = {}) => {
    const lineId = buildLineId(item);
    const maxQty = item.maxQty ?? 10;
    setItems((prev) => {
      const idx = prev.findIndex((l) => l.lineId === lineId);
      if (idx >= 0) {
        return prev.map((l, i) =>
          i === idx ? { ...l, qty: Math.min(l.qty + (item.qty || 1), maxQty) } : l
        );
      }
      return [...prev, { ...item, lineId, qty: Math.min(item.qty || 1, maxQty), maxQty }];
    });
    if (options.open !== false) setIsOpen(true);
  }, []);

  const removeItem = useCallback((lineId) => {
    setItems((prev) => prev.filter((l) => l.lineId !== lineId));
  }, []);

  const updateQty = useCallback((lineId, qty) => {
    setItems((prev) =>
      prev.map((l) => {
        if (l.lineId !== lineId) return l;
        const max = l.maxQty ?? 10;
        return { ...l, qty: Math.max(1, Math.min(qty, max)) };
      })
    );
  }, []);

  const applyPromo = useCallback((code) => {
    const normalized = String(code || '').trim().toUpperCase();
    if (PROMO_CODES[normalized]) {
      setPromoCode(normalized);
      return true;
    }
    return false;
  }, []);

  const clearPromo = useCallback(() => setPromoCode(''), []);
  const clear = useCallback(() => {
    setItems([]);
    setPromoCode('');
  }, []);
  const openDrawer = useCallback(() => setIsOpen(true), []);
  const closeDrawer = useCallback(() => setIsOpen(false), []);

  const value = useMemo(
    () => ({
      items, count, subtotal, discount, shipping, tax, total,
      addItem, removeItem, updateQty, clear,
      promoCode, applyPromo, clearPromo,
      isOpen, openDrawer, closeDrawer,
      shippingMethod, setShippingMethod,
    }),
    [
      items, count, subtotal, discount, shipping, tax, total,
      addItem, removeItem, updateQty, clear,
      promoCode, applyPromo, clearPromo,
      isOpen, openDrawer, closeDrawer, shippingMethod,
    ]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within a CartProvider');
  return ctx;
}
