import { createContext, useContext, useState, useCallback, useMemo } from 'react';

const CartContext = createContext(undefined);

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);

  const count = useMemo(() => items.reduce((sum, item) => sum + item.quantity, 0), [items]);
  const total = useMemo(() => items.reduce((sum, item) => sum + item.price * item.quantity, 0), [items]);

  const addItem = useCallback((newItem) => {
    setItems(prev => {
      const existingIndex = prev.findIndex(
        item => item.productId === newItem.productId && item.size === newItem.size && item.color === newItem.color
      );
      if (existingIndex >= 0) {
        return prev.map((item, i) => i === existingIndex ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { ...newItem, quantity: 1 }];
    });
  }, []);

  const removeItem = useCallback((productId, size, color) => {
    setItems(prev => prev.filter(item => !(item.productId === productId && item.size === size && item.color === color)));
  }, []);

  const updateQuantity = useCallback((productId, size, color, quantity) => {
    if (quantity <= 0) {
      removeItem(productId, size, color);
      return;
    }
    setItems(prev => prev.map(item => 
      item.productId === productId && item.size === size && item.color === color
        ? { ...item, quantity }
        : item
    ));
  }, [removeItem]);

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const isInCart = useCallback((productId, size, color) => {
    return items.some(item => item.productId === productId && item.size === size && item.color === color);
  }, [items]);

  return (
    <CartContext.Provider value={{ items, count, total, addItem, removeItem, updateQuantity, clearCart, isInCart }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}