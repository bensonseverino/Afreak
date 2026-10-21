/**
 * Shared store details for the legal pages (Privacy Policy, Terms & Conditions).
 *
 * Replace the bracketed values with real details before launch. Anything still
 * wrapped in square brackets is treated as a placeholder, so it stays visible
 * in the rendered page instead of being silently dropped.
 */
export const PLACEHOLDERS = {
  COMPANY_NAME: 'Afreak',
  LEGAL_ENTITY: '[LEGAL ENTITY NAME]',
  WEBSITE_URL: '[WEBSITE URL]',
  CONTACT_EMAIL: '[CONTACT EMAIL]',
  CONTACT_PHONE: '[CONTACT PHONE]',
  MAILING_ADDRESS: '[MAILING ADDRESS]',
  LAST_UPDATED: '[DATE]',
  GOVERNING_LAW: '[GOVERNING LAW / JURISDICTION]',
  DISPUTE_LOCATION: '[CITY / COUNTRY FOR DISPUTES]',
  MIN_AGE: '18',
  DEFECT_NOTICE_DAYS: '7',
  CANCELLATION_WINDOW_HOURS: '[HOURS BEFORE PRODUCTION STARTS]',
  PAYMENT_PROCESSOR: '[PAYMENT PROCESSOR]',
  PROCESSING_TIME: '[PRODUCTION / PROCESSING TIME]',
  SHIPPING_PARTNERS: '[SHIPPING / FULFILLMENT PARTNERS]',
  ANALYTICS_TOOLS: '[ANALYTICS TOOLS]',
  EMAIL_SMS_PROVIDER: '[EMAIL / SMS PROVIDER]',
  SUPPORT_TOOL: '[CUSTOMER SUPPORT TOOL]',
};

/** Replace every {{KEY}} token with its value from PLACEHOLDERS. */
export function interpolate(value) {
  return String(value).replace(/\{\{\s*([A-Z0-9_]+)\s*\}\}/g, (token, key) =>
    Object.prototype.hasOwnProperty.call(PLACEHOLDERS, key) ? PLACEHOLDERS[key] : token,
  );
}

/** True when the value is still an unreplaced [PLACEHOLDER]. */
export function isPlaceholder(value) {
  return /^\[.*\]$/.test(String(value).trim());
}
