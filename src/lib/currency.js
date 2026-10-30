/**
 * Display-currency configuration.
 *
 * Product and order amounts are stored in `BASE_CURRENCY` (EUR). The switcher
 * only changes how those amounts are *displayed*; customers are always charged
 * in `CHARGE_CURRENCY`. Adding a currency is a single entry in
 * `SUPPORTED_CURRENCIES` plus its quote in the backend rates payload.
 */

export const BASE_CURRENCY = 'EUR';
export const CHARGE_CURRENCY = 'EUR';

/** localStorage key for the shopper's choice. */
export const CURRENCY_STORAGE_KEY = 'afreak_currency';

/**
 * `decimals: 0` for shillings (whole units), 2 for euro/dollar/pound.
 * `symbol` is rendered directly so KES reads "KSh", not Intl's "Ksh".
 */
export const SUPPORTED_CURRENCIES = [
  { code: 'EUR', symbol: '€', name: 'Euro', locale: 'en-IE', decimals: 2 },
  { code: 'USD', symbol: '$', name: 'US Dollar', locale: 'en-US', decimals: 2 },
  { code: 'GBP', symbol: '£', name: 'British Pound', locale: 'en-GB', decimals: 2 },
  { code: 'KES', symbol: 'KSh', name: 'Kenyan Shilling', locale: 'en-KE', decimals: 0 },
];

const BASE_META = SUPPORTED_CURRENCIES[0];

export function currencyFor(code) {
  return SUPPORTED_CURRENCIES.find((currency) => currency.code === code) ?? BASE_META;
}

export function isSupportedCurrency(code) {
  return SUPPORTED_CURRENCIES.some((currency) => currency.code === code);
}

/** Round to the currency's smallest displayed unit. */
export function roundMoney(value, currency) {
  const { decimals } = currencyFor(currency);
  const factor = 10 ** decimals;
  return Math.round((Number(value) || 0) * factor) / factor;
}

/**
 * Convert between any two currencies in a USD-quoted rate table.
 * Returns the amount unchanged when a quote is missing (never NaN).
 */
export function convertBetween(amount, rates, from, to) {
  const value = Number(amount) || 0;
  if (!rates || !from || !to || from === to) return value;

  const source = Number(rates[from]);
  const target = Number(rates[to]);
  if (!Number.isFinite(source) || !Number.isFinite(target) || source <= 0 || target <= 0) {
    return value;
  }
  return (value * target) / source;
}

/**
 * Convert an amount from the base currency using a USD-quoted rate table.
 * Returns the amount unchanged when either quote is missing (never NaN).
 */
export function convertAmount(amount, rates, currency) {
  return convertBetween(amount, rates, BASE_CURRENCY, currency);
}

const formatters = new Map();

function numberFormatter(locale, decimals) {
  const key = `${locale}:${decimals}`;
  let formatter = formatters.get(key);
  if (!formatter) {
    formatter = new Intl.NumberFormat(locale, {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
    formatters.set(key, formatter);
  }
  return formatter;
}

/**
 * Format an amount that is already in `currency`.
 *   formatMoney(120, 'EUR')      → "€120.00"
 *   formatMoney(6500, 'KES')     → "KSh 6,500"
 */
export function formatMoney(amount, currency) {
  const meta = currencyFor(currency);
  const rounded = roundMoney(amount, currency);
  const digits = numberFormatter(meta.locale, meta.decimals).format(rounded);
  const gap = meta.code === 'KES' ? ' ' : '';
  return `${meta.symbol}${gap}${digits}`;
}

/** Convert from the base currency, then format. */
export function formatConverted(amount, rates, currency) {
  return formatMoney(convertAmount(amount, rates, currency), currency);
}

const relativeFormatter =
  typeof Intl !== 'undefined' && Intl.RelativeTimeFormat
    ? new Intl.RelativeTimeFormat('en', { numeric: 'auto' })
    : null;

/**
 * "just now", "5 minutes ago", "3 hours ago" … for the rates note.
 * Returns null when the timestamp is missing or unparseable.
 */
export function relativeTime(iso) {
  const time = Date.parse(iso || '');
  if (!Number.isFinite(time)) return null;

  const rawSeconds = Math.round((time - Date.now()) / 1000);
  // A device clock behind Cloudflare's can make a fresh row look future-dated;
  // clamp it rather than telling shoppers rates update "in 3 minutes".
  const seconds = Math.min(0, rawSeconds);
  const abs = Math.abs(seconds);
  if (abs < 60) return 'just now';

  const units = [
    ['day', 86400],
    ['hour', 3600],
    ['minute', 60],
  ];
  for (const [unit, size] of units) {
    if (abs >= size) {
      const value = Math.round(seconds / size);
      return relativeFormatter ? relativeFormatter.format(value, unit) : `${Math.abs(value)} ${unit}s ago`;
    }
  }
  return null;
}
