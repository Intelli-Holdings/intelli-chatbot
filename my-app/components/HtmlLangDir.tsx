"use client";
import React, { useEffect } from 'react'
import { isRtl, normalizeToSupportedLocale } from '@/lib/i18n/config'

export default function HtmlLangDir({ locale }: { locale: string }) {
  useEffect(() => {
    const l = normalizeToSupportedLocale(locale)
    const dir = isRtl(l) ? 'rtl' : 'ltr'
    document.documentElement.setAttribute('lang', l)
    document.documentElement.setAttribute('dir', dir)
    if (dir === 'rtl') {
      document.body.classList.add('rtl')
    } else {
      document.body.classList.remove('rtl')
    }
  }, [locale])
  return null
}
