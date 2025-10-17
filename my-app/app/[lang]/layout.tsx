import React from 'react'
import { ReactNode } from 'react'
import { isRtl, supportedLocales } from '@/lib/i18n/config'
import HtmlLangDir from '@/components/HtmlLangDir'
import AlternateLinks from './components/alternate-links'

export async function generateStaticParams() {
  return supportedLocales.map((lang) => ({ lang }))
}

export default async function I18nLayout({
  children,
  params,
}: Readonly<{ children: ReactNode, params: { lang: string } }>) {
  const { lang } = params\n  const dir = isRtl(lang) ? 'rtl' : 'ltr'

  // We can't set <html> here; use a client helper to adjust html attributes
  return (
    <section data-locale={lang} dir={dir}>
      {/* Adjust html attributes on client */}
      {/* @ts-expect-error Async Server Component child */}
      <HtmlLangDir locale={lang} />
      {/* SEO alternate links for current route */}
      {/* @ts-expect-error Async Server Component child */}
      <AlternateLinks currentLang={lang} />
      {children}
    </section>
  )
}
