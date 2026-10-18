// Shared country list for checkout + the address book (placeholders).
export const COUNTRIES = [
  'Kenya',
  'United Kingdom',
  'Germany',
  'France',
  'United States',
  'Canada',
  'Australia',
  'Netherlands',
  'Spain',
  'Italy',
  'South Africa',
  'Nigeria',
];

// Country picker for phone identifiers: the ISO code, the label and the dial
// code. The sign-in/sign-up forms send `dial + national number`; the backend
// normalises it to E.164 (`DEFAULT_PHONE_COUNTRY` defaults to Kenya).
export const PHONE_COUNTRIES = [
  { code: 'KE', name: 'Kenya', dial: '+254' },
  { code: 'GB', name: 'United Kingdom', dial: '+44' },
  { code: 'DE', name: 'Germany', dial: '+49' },
  { code: 'FR', name: 'France', dial: '+33' },
  { code: 'US', name: 'United States', dial: '+1' },
  { code: 'CA', name: 'Canada', dial: '+1' },
  { code: 'AU', name: 'Australia', dial: '+61' },
  { code: 'NL', name: 'Netherlands', dial: '+31' },
  { code: 'ES', name: 'Spain', dial: '+34' },
  { code: 'IT', name: 'Italy', dial: '+39' },
  { code: 'ZA', name: 'South Africa', dial: '+27' },
  { code: 'NG', name: 'Nigeria', dial: '+234' },
];

export const DEFAULT_PHONE_COUNTRY = PHONE_COUNTRIES[0];

export default COUNTRIES;
