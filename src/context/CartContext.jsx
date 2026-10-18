import {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  useRef,
  useEffect,
} from 'react';
import { shippingFor } from '../utils/shipping';
import { api } from '../lib/api';
import { TRACK_TYPES, track } from '../lib/analytics';

const CartContext = createContext(null);
const STORAGE_KEY = 'afreak.cart.v2';

// Offline fallback, used only when POST /promo/validate is unreachable.
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
  // `promo` mirrors the API's shape: { code, type: 'percent'|'fixed', value }.
  const [promo, setPromo] = useState(null);
  // Totals returned by POST /checkout/quote override the local estimate.
  const [serverQuote, setServerQuote] = useState(null);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      /* storage unavailable — cart stays in memory */
    }
  }, [items]);

  const count = useMemo(() => items.reduce((sum, i) => sum + i.qty, 0), [items]);
  const subtotal = useMemo(() => items.reduce((sum, i) => sum + i.price * i.qty, 0), [items]);

  const discount = useMemo(() => {
    if (!promo || subtotal <= 0) return 0;
    const raw =
      promo.type === 'fixed'
        ? promo.value / 100
        : (subtotal * promo.value) / 100;
    return Math.max(0, Math.min(raw, subtotal));
  }, [promo, subtotal]);

  const localTotals = useMemo(() => {
    const shipping = shippingFor(subtotal - discount, shippingMethod);
    return {
      subtotal,
      discount,
      shipping,
      tax: 0,
      total: Math.max(0, subtotal - discount + shipping),
    };
  }, [subtotal, discount, shippingMethod]);

  // Only trust a server quote that matches the current cart inputs.
  const signature = useMemo(
    () =>
      JSON.stringify({
        lines: items.map((i) => [i.lineId, i.qty]),
        shippingMethod,
        promo: promo?.code ?? null,
      }),
    [items, shippingMethod, promo],
  );
  const signatureRef = useRef(signature);
  useEffect(() => {
    signatureRef.current = signature;
  }, [signature]);

  const setServerTotals = useCallback((totals) => {
    setServerQuote(totals ? { key: signatureRef.current, totals } : null);
  }, []);

  const totals =
    serverQuote && serverQuote.key === signature ? serverQuote.totals : localTotals;

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
    if (item.productId) track(TRACK_TYPES.addToCart, item.productId);
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

  /**
   * Validates a code against POST /promo/validate.
   * Resolves `true` on success, or a message string explaining the rejection.
   */
  const applyPromo = useCallback(async (code) => {
    const normalized = String(code || '').trim().toUpperCase();
    if (!normalized) return 'Enter a promo code.';

    const subtotalCents = Math.round(
      items.reduce((sum, i) => sum + i.price * i.qty, 0) * 100
    );

    try {
      const res = await api('/promo/validate', {
        method: 'POST',
        body: { code: normalized, subtotalCents },
      });
      const data = res?.data ?? {};
      if (data.valid) {
        setPromo({ code: data.code ?? normalized, type: data.type, value: data.value });
        return true;
      }
      return data.reason || 'That code is not valid.';
    } catch {
      if (PROMO_CODES[normalized]) {
        setPromo({ code: normalized, type: 'percent', value: PROMO_CODES[normalized] * 100 });
        return true;
      }
      return 'Could not check that code. Please try again.';
    }
  }, [items]);

  const clearPromo = useCallback(() => setPromo(null), []);
  const clear = useCallback(() => {
    setItems([]);
    setPromo(null);
    setServerQuote(null);
  }, []);
  const openDrawer = useCallback(() => setIsOpen(true), []);
  const closeDrawer = useCallback(() => setIsOpen(false), []);

  const value = useMemo(
    () => ({
      items,
      count,
      subtotal: totals.subtotal,
      discount: totals.discount,
      shipping: totals.shipping,
      tax: totals.tax,
      total: totals.total,
      addItem,
      removeItem,
      updateQty,
      clear,
      promo,
      promoCode: promo?.code ?? '',
      applyPromo,
      clearPromo,
      setServerTotals,
      isOpen,
      openDrawer,
      closeDrawer,
      shippingMethod,
      setShippingMethod,
    }),
    [
      items,
      count,
      totals,
      addItem,
      removeItem,
      updateQty,
      clear,
      promo,
      applyPromo,
      clearPromo,
      setServerTotals,
      isOpen,
      openDrawer,
      closeDrawer,
      shippingMethod,
    ]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within a CartProvider');
  return ctx;
}
