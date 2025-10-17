"use client";
import { usePathname } from 'next/navigation'
import React, { useEffect } from 'react'
import { supportedLocales } from '@/lib/i18n/config'

export default function AlternateLinks({ currentLang }: { currentLang: string }) {
  const pathname = usePathname() || '/'
  const pathWithoutLang = (() => {
    const parts = pathname.split('/')
    if (parts.length > 1 && supportedLocales.includes(parts[1] as any)) {
      return '/' + parts.slice(2).join('/')
    }
    return pathname
  })()

  const base = process.env.NEXT_PUBLIC_BASE_URL || ''

  useEffect(() => {
    // Update OpenGraph locale tags dynamically
    const head = document.head
    const remove = Array.from(head.querySelectorAll('meta[property="og:locale"], meta[property="og:locale:alternate"]'))
    remove.forEach(n => n.parentElement?.removeChild(n))
    const primary = document.createElement('meta')
    primary.setAttribute('property', 'og:locale')
    primary.setAttribute('content', currentLang)
    head.appendChild(primary)
    supportedLocales.filter(l => l !== currentLang).forEach(l => {
      const meta = document.createElement('meta')
      meta.setAttribute('property', 'og:locale:alternate')
      meta.setAttribute('content', l)
      head.appendChild(meta)
    })
  }, [currentLang])

  return (
    <>
      {supportedLocales.map((loc) => (
        <link
          key={loc}
          rel="alternate"
          hrefLang={loc}
          href={`${base}/${loc}${pathWithoutLang}`.replace(/\/$/, '') || '/'}
        />
      ))}
    </>
  )
}
