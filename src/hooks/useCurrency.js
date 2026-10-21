import { useContext } from 'react';
import { CurrencyContext } from '../context/currencyContextValue';

/** Read the display currency and its converters. */
export default function useCurrency() {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error('useCurrency must be used inside a CurrencyProvider');
  }
  return context;
}
