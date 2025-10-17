"use client";
import React from 'react'
import { usePathname, useRouter } from 'next/navigation'
import ReactCountryFlag from 'react-country-flag'
import { localeNames, localeToCountry, supportedLocales } from '@/lib/i18n/config'

export default function LanguageSwitcher({ current }: { current: string }) {
  const router = useRouter()
  const pathname = usePathname() || '/'

  function onChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const newLocale = e.target.value
    try { localStorage.setItem('NEXT_LOCALE', newLocale) } catch {}
    document.cookie = `NEXT_LOCALE=${newLocale}; path=/; max-age=${60 * 60 * 24 * 365}`

    const parts = pathname.split('/')
    // if path already has a locale, replace first segment
    if (parts.length > 1 && supportedLocales.includes(parts[1] as any)) {
      parts[1] = newLocale
      router.push(parts.join('/') || '/')
    } else {
      router.push(`/${newLocale}`)
    }
  }

  return (
    <label style={{ display: 'inline-flex', gap: 8, alignItems: 'center' }}>
      <span style={{ fontSize: 12, opacity: 0.7 }}>Language</span>
      <select onChange={onChange} value={current} style={{ padding: 6 }}>
        {supportedLocales.map((loc) => (
          <option key={loc} value={loc}>
            {localeNames[loc]}
          </option>
        ))}
      </select>
      <ReactCountryFlag
        svg
        countryCode={localeToCountry[(current as any)]}
        style={{ width: '1.2em', height: '1.2em' }}
      />
    </label>
  )
}
