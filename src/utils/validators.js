// Placeholder validators — no backend, basic length/format checks only.

export const isEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(v).trim());

export const isPhone = (v) => String(v).replace(/\D/g, '').length >= 7;

export const isPostal = (v) => String(v).trim().length >= 3;

export const required = (v) => String(v ?? '').trim().length > 0;

// Card placeholders — Luhn-free, length-only checks.
export const isCardNumber = (v) => String(v).replace(/\s/g, '').length >= 13;

export const isExpiry = (v) => /^\d{2}\s?\/\s?\d{2}$/.test(String(v).trim());

export const isCvc = (v) => /^\d{3,4}$/.test(String(v).trim());

// Group card digits 4-4-4-4 while typing.
export function formatCardNumber(value) {
  return String(value)
    .replace(/\D/g, '')
    .slice(0, 16)
    .replace(/(\d{4})(?=\d)/g, '$1 ');
}

export function formatExpiry(value) {
  const digits = String(value).replace(/\D/g, '').slice(0, 4);
  if (digits.length <= 2) return digits;
  return `${digits.slice(0, 2)} / ${digits.slice(2)}`;
}
