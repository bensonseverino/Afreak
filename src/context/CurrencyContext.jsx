import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { CurrencyContext } from './currencyContextValue';
import {
  BASE_CURRENCY,
  CHARGE_CURRENCY,
  CURRENCY_STORAGE_KEY,
  SUPPORTED_CURRENCIES,
  convertAmount,
  currencyFor,
  formatMoney,
  isSupportedCurrency,
  roundMoney,
} from '../lib/currency';

const API_BASE = import.meta.env.VITE_API_BASE ?? '';
const RATES_URL = `${API_BASE}/api/rates`;
const GEO_URL = `${API_BASE}/api/geo`;

/** Rates stay in memory for an hour; the backend caches them for longer. */
const RATES_TTL_MS = 60 * 60 * 1000;

let ratesCache = { data: null, fetchedAt: 0 };
let ratesRequest = null;

function readStoredCurrency() {
  try {
    const saved = localStorage.getItem(CURRENCY_STORAGE_KEY);
    return isSupportedCurrency(saved) ? saved : null;
  } catch {
    return null;
  }
}

function persistCurrency(currency) {
  try {
    localStorage.setItem(CURRENCY_STORAGE_KEY, currency);
  } catch {
    // Private mode / storage disabled — the choice simply won't persist.
  }
}

/** Starting currency for a first-time visitor (per spec §3). */
function currencyForCountry(country) {
  if (country === 'KE') return 'KES';
  if (country === 'GB') return 'GBP';
  // The shop itself prices in EUR, so the rest of the world starts there.
  return BASE_CURRENCY;
}

async function fetchJson(url) {
  const res = await fetch(url, { headers: { accept: 'application/json' }, credentials: 'omit' });
  if (!res.ok) throw new Error(`Request failed (${res.status})`);
  const json = await res.json();
  return json?.data ?? json;
}

function loadRates(force = false) {
  if (!force && ratesCache.data && Date.now() - ratesCache.fetchedAt < RATES_TTL_MS) {
    return Promise.resolve(ratesCache.data);
  }

  if (!ratesRequest) {
    ratesRequest = fetchJson(RATES_URL)
      .then((data) => {
        if (!data || typeof data.rates !== 'object' || data.rates === null) {
          throw new Error('Invalid rates payload');
        }
        ratesCache = { data, fetchedAt: Date.now() };
        return data;
      })
      .finally(() => {
        ratesRequest = null;
      });
  }
  return ratesRequest;
}

/**
 * Global display currency.
 *
 * Prices render in the base currency until live rates arrive (and again if the
 * API never answers), so the storefront can never show a converted number it
 * cannot justify. Every formatted price goes through `format`/`convert`, and
 * `availableCurrencies` hides codes the provider did not quote.
 */
export function CurrencyProvider({ children }) {
  const [currency, setCurrencyState] = useState(() => readStoredCurrency() ?? BASE_CURRENCY);
  const [rates, setRates] = useState(() => ratesCache.data?.rates ?? null);
  const [updatedAt, setUpdatedAt] = useState(() => ratesCache.data?.updatedAt ?? null);
  const [stale, setStale] = useState(false);
  const [loading, setLoading] = useState(!ratesCache.data);
  const [failed, setFailed] = useState(false);
  const [announcement, setAnnouncement] = useState('');

  // A saved choice outranks the visitor's country.
  const hadSavedChoice = useRef(readStoredCurrency() !== null);

  useEffect(() => {
    let cancelled = false;

    const apply = (data) => {
      setRates(data.rates ?? null);
      setUpdatedAt(data.updatedAt ?? null);
      setStale(Boolean(data.stale));
    };

    loadRates()
      .then((data) => {
        if (!cancelled) apply(data);
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  // First visit: pick a starting currency from the edge country.
  useEffect(() => {
    if (hadSavedChoice.current) return undefined;
    let cancelled = false;

    fetchJson(GEO_URL)
      .then((data) => {
        if (cancelled || readStoredCurrency()) return;
        setCurrencyState(currencyForCountry(String(data?.country ?? '').toUpperCase()));
      })
      .catch(() => {
        // Unknown country → base currency, which is already selected.
      });

    return () => {
      cancelled = true;
    };
  }, []);

  // Reflect a choice made in another tab.
  useEffect(() => {
    const onStorage = (event) => {
      if (event.key !== CURRENCY_STORAGE_KEY) return;
      if (isSupportedCurrency(event.newValue)) setCurrencyState(event.newValue);
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  // Rates can go stale while a tab sleeps; refresh when it wakes.
  useEffect(() => {
    const onVisibility = () => {
      if (document.visibilityState !== 'visible') return;
      if (ratesCache.data && Date.now() - ratesCache.fetchedAt < RATES_TTL_MS) return;
      loadRates()
        .then((data) => {
          setRates(data.rates ?? null);
          setUpdatedAt(data.updatedAt ?? null);
          setStale(Boolean(data.stale));
          setFailed(false);
        })
        .catch(() => setFailed(true));
    };
    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
  }, []);

  const availableCurrencies = useMemo(() => {
    // Show the full set while the first request is in flight so the control
    // does not pop into place; drop codes without a quote once rates arrive.
    if (!rates) return loading ? SUPPORTED_CURRENCIES : SUPPORTED_CURRENCIES.slice(0, 1);

    // A quote is only usable when the base quote exists too, otherwise we
    // could label an unconverted EUR amount with a foreign symbol.
    const baseQuote = Number(rates[BASE_CURRENCY]);
    if (!Number.isFinite(baseQuote) || baseQuote <= 0) {
      return SUPPORTED_CURRENCIES.slice(0, 1);
    }

    return SUPPORTED_CURRENCIES.filter((option) => {
      if (option.code === BASE_CURRENCY) return true;
      const quote = Number(rates[option.code]);
      return Number.isFinite(quote) && quote > 0;
    });
  }, [rates, loading]);

  const activeCurrency = useMemo(() => {
    if (!rates) return BASE_CURRENCY;
    return availableCurrencies.some((option) => option.code === currency) ? currency : BASE_CURRENCY;
  }, [rates, currency, availableCurrencies]);

  const convert = useCallback(
    (amount) => {
      const value = Number(amount) || 0;
      if (!rates || activeCurrency === BASE_CURRENCY) return value;
      return roundMoney(convertAmount(value, rates, activeCurrency), activeCurrency);
    },
    [rates, activeCurrency],
  );

  /** Format an amount that is already expressed in the display currency. */
  const formatValue = useCallback(
    (amount) => formatMoney(amount, activeCurrency),
    [activeCurrency],
  );

  /** Convert a base-currency amount and format it. */
  const format = useCallback(
    (amount) => formatValue(convert(amount)),
    [convert, formatValue],
  );

  const setCurrency = useCallback(
    (code) => {
      if (!isSupportedCurrency(code)) return;
      if (!availableCurrencies.some((option) => option.code === code)) return;

      setCurrencyState(code);
      persistCurrency(code);
      setAnnouncement(`Prices are now shown in ${currencyFor(code).name}.`);
    },
    [availableCurrencies],
  );

  const value = useMemo(
    () => ({
      currency: activeCurrency,
      selectedCurrency: currency,
      baseCurrency: BASE_CURRENCY,
      chargeCurrency: CHARGE_CURRENCY,
      rates,
      updatedAt,
      stale,
      loading,
      failed,
      availableCurrencies,
      setCurrency,
      convert,
      format,
      formatValue,
    }),
    [
      activeCurrency,
      currency,
      rates,
      updatedAt,
      stale,
      loading,
      failed,
      availableCurrencies,
      setCurrency,
      convert,
      format,
      formatValue,
    ],
  );

  return (
    <CurrencyContext.Provider value={value}>
      {children}
      <span className="sr-only" role="status" aria-live="polite">
        {announcement}
      </span>
    </CurrencyContext.Provider>
  );
}
