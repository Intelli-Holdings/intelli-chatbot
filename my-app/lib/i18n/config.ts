
export const supportedLocales = [
  'en', // English (default)
  'fr', // French (France)
  'pt', // Portuguese (Portugal/Brazil)
  'ar', // Arabic (RTL)
  'es', // Spanish (Spain/LatAm)
  'nl', // Dutch (Netherlands)
  'it', // Italian (Italy)
  'de', // German (Germany)
] as const

export type SupportedLocale = typeof supportedLocales[number]

export const defaultLocale: SupportedLocale = 'en'

export const isRtl = (locale: string) => locale === 'ar'

export const localeNames: Record<SupportedLocale, string> = {
  en: 'English',
  fr: 'Français',
  pt: 'Português',
  ar: 'العربية',
  es: 'Español',
  nl: 'Nederlands',
  it: 'Italiano',
  de: 'Deutsch',
}

export const localeToCountry: Record<SupportedLocale, string> = {
  en: 'US',
  fr: 'FR',
  pt: 'PT', // could be BR as well; choose PT as default
  ar: 'SA',
  es: 'ES',
  nl: 'NL',
  it: 'IT',
  de: 'DE',
}

export function normalizeToSupportedLocale(input?: string | null): SupportedLocale {
  if (!input) return defaultLocale
  const lower = input.toLowerCase()
  const exact = supportedLocales.find(l => l === lower)
  if (exact) return exact
  // map regional forms like en-US -> en
  const base = lower.split('-')[0]
  const baseMatch = supportedLocales.find(l => l === base)
  return baseMatch ?? defaultLocale
}
