// Currency formatting — spec wants "€120.00" (dot decimal, symbol first).
export function formatPrice(value) {
  const n = Number(value) || 0;
  return `€${n.toFixed(2)}`;
}

// Compact review counts → 1200 => "1.2k"
export function formatCount(value) {
  const n = Number(value) || 0;
  if (n < 1000) return String(n);
  return `${(n / 1000).toFixed(1).replace(/\.0$/, '')}k`;
}
