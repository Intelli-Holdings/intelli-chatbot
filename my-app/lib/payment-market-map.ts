/**
 * Payment Market Map
 * Smart payment provider recommendation based on customer country/phone prefix
 * for African markets.
 */

import {
  type PaymentProvider,
  PAYMENT_PROVIDERS,
} from '@/types/payments';

// =============================================================================
// PHONE PREFIX -> COUNTRY MAPPING
// =============================================================================

export const PHONE_PREFIX_COUNTRY_MAP: Record<string, string> = {
  '+254': 'KE',
  '+255': 'TZ',
  '+256': 'UG',
  '+234': 'NG',
  '+233': 'GH',
  '+27': 'ZA',
  '+250': 'RW',
  '+237': 'CM',
};

// =============================================================================
// COUNTRY -> PROVIDER PRIORITY (ordered by market dominance)
// =============================================================================

export const COUNTRY_PROVIDER_PRIORITY: Record<string, PaymentProvider[]> = {
  KE: ['mpesa', 'pesapal', 'flutterwave', 'paystack'], // M-PESA is king in Kenya
  TZ: ['mpesa', 'pesapal', 'flutterwave'],             // M-PESA big in Tanzania too
  UG: ['momo', 'pesapal', 'flutterwave'],              // MTN MoMo dominant
  NG: ['paystack', 'flutterwave'],             // Paystack is Nigerian
  GH: ['momo', 'paystack', 'flutterwave'],     // MoMo popular, Paystack too
  ZA: ['paystack', 'flutterwave'],             // Cards dominant, Paystack/Flutter
  RW: ['momo', 'pesapal', 'flutterwave'],        // MoMo dominant
  CM: ['momo', 'flutterwave'],                 // MoMo + Orange Money
};

// =============================================================================
// COUNTRY -> DEFAULT CURRENCY
// =============================================================================

export const COUNTRY_DEFAULT_CURRENCY: Record<string, string> = {
  KE: 'KES',
  TZ: 'TZS',
  UG: 'UGX',
  NG: 'NGN',
  GH: 'GHS',
  ZA: 'ZAR',
  RW: 'RWF',
  CM: 'XAF',
};

// =============================================================================
// COUNTRY NAMES
// =============================================================================

const COUNTRY_NAMES: Record<string, string> = {
  KE: 'Kenya',
  TZ: 'Tanzania',
  UG: 'Uganda',
  NG: 'Nigeria',
  GH: 'Ghana',
  ZA: 'South Africa',
  RW: 'Rwanda',
  CM: 'Cameroon',
};

// =============================================================================
// FUNCTIONS
// =============================================================================

/**
 * Detect country code from a phone number prefix.
 * Tries longest prefix match first (e.g. +254 before +25).
 */
export function getCountryFromPhone(phone: string): string | null {
  const normalized = phone.startsWith('+') ? phone : `+${phone}`;

  // Sort prefixes by length descending so longer prefixes match first
  const sortedPrefixes = Object.keys(PHONE_PREFIX_COUNTRY_MAP).sort(
    (a, b) => b.length - a.length
  );

  for (const prefix of sortedPrefixes) {
    if (normalized.startsWith(prefix)) {
      return PHONE_PREFIX_COUNTRY_MAP[prefix];
    }
  }

  return null;
}

/**
 * Get ordered list of recommended payment providers for a customer
 * based on their phone number. Optionally filter by currency support.
 */
export function getRecommendedProviders(
  phone: string,
  currency?: string
): PaymentProvider[] {
  const country = getCountryFromPhone(phone);
  if (!country) return [];

  const providers = COUNTRY_PROVIDER_PRIORITY[country] ?? [];

  if (!currency) return providers;

  return providers.filter((provider) => {
    const info = PAYMENT_PROVIDERS[provider];
    return info?.supported_currencies.includes(currency);
  });
}

/**
 * Get the default currency for a customer based on their phone number.
 */
export function getDefaultCurrency(phone: string): string | null {
  const country = getCountryFromPhone(phone);
  if (!country) return null;
  return COUNTRY_DEFAULT_CURRENCY[country] ?? null;
}

/**
 * Get human-readable country name from a country code.
 */
export function getCountryName(countryCode: string): string {
  return COUNTRY_NAMES[countryCode] ?? countryCode;
}

/**
 * Get a recommendation label for a provider in a given country.
 * e.g. "Recommended for Kenya" or "Popular in Ghana"
 */
export function getProviderRecommendationLabel(
  provider: PaymentProvider,
  countryCode: string
): string {
  const countryName = getCountryName(countryCode);
  const priority = COUNTRY_PROVIDER_PRIORITY[countryCode];

  if (!priority) return '';

  const index = priority.indexOf(provider);
  if (index === -1) return '';

  if (index === 0) {
    return `Recommended for ${countryName}`;
  }

  return `Popular in ${countryName}`;
}
