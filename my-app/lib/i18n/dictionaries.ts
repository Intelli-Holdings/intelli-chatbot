import 'server-only'
import { cache } from 'react'
import { defaultLocale, SupportedLocale, supportedLocales, normalizeToSupportedLocale } from './config'

const LOCIZE_PROJECT_ID = process.env.LOCIZE_PROJECT_ID
const LOCIZE_API_KEY = process.env.LOCIZE_API_KEY
const LOCIZE_VERSION = process.env.LOCIZE_VERSION || 'latest'
const LOCIZE_NAMESPACE = process.env.LOCIZE_NAMESPACE || 'common'

const inMemoryCache = new Map<string, any>()

async function fetchFromLocize(locale: SupportedLocale) {
  if (!LOCIZE_PROJECT_ID || !LOCIZE_API_KEY) return null
  const cacheKey = `locize:${locale}`
  if (inMemoryCache.has(cacheKey)) return inMemoryCache.get(cacheKey)
  try {
    const url = `https://api.locize.app/${LOCIZE_PROJECT_ID}/${LOCIZE_VERSION}/${locale}/${LOCIZE_NAMESPACE}`
    const res = await fetch(url, {
      headers: {
        'Authorization': LOCIZE_API_KEY,
      },
      next: { revalidate: 60 * 10 },
    })
    if (!res.ok) throw new Error(`Locize ${res.status}`)
    const json = await res.json()
    inMemoryCache.set(cacheKey, json)
    return json
  } catch (e) {
    return null
  }
}

export const getDictionary = cache(async (localeInput: string) => {
  const locale = normalizeToSupportedLocale(localeInput) as SupportedLocale

  const locizeDict = await fetchFromLocize(locale)
  if (locizeDict) return locizeDict

  const dict = await import(`@/app/[lang]/dictionaries/${locale}.json`).then(m => m.default).catch(async () => {
    return await import(`@/app/[lang]/dictionaries/${defaultLocale}.json`).then(m => m.default)
  })
  return dict
})

export async function translateText(text: string, targetLocale: string) {
  const locale = normalizeToSupportedLocale(targetLocale)
  const key = process.env.GOOGLE_TRANSLATE_API_KEY
  if (!key) return text
  try {
    const res = await fetch(`https://translation.googleapis.com/language/translate/v2?key=${key}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ q: text, target: locale })
    })
    const data = await res.json()
    return data?.data?.translations?.[0]?.translatedText || text
  } catch {
    return text
  }
}

export function getIntlDateFormatter(locale: string) {
  const l = normalizeToSupportedLocale(locale)
  return new Intl.DateTimeFormat(l, { dateStyle: 'long', timeStyle: 'short' })
}