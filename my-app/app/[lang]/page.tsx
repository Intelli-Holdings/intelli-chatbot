import React from 'react'
import { getDictionary, getIntlDateFormatter } from '@/lib/i18n/dictionaries'
import { localeNames } from '@/lib/i18n/config'
import LanguageSwitcher from './components/LanguageSwitcher'

export default async function I18nHome({
  params,
}: { params: { lang: string } }) {
  const { lang } = params
  const dict = await getDictionary(lang)
  const fmt = getIntlDateFormatter(lang)
  const now = fmt.format(new Date())

  return (
    <main className="min-h-[40vh] p-6">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold">
          {dict?.common?.welcome ?? 'Welcome'} ({localeNames[lang as keyof typeof localeNames] ?? lang})
        </h1>
        {/* @ts-expect-error Async Server Component child */}
        <LanguageSwitcher current={lang} />
      </div>
      <p className="mt-4 opacity-80">{dict?.common?.current_time ?? 'Current time'}: {now}</p>
    </main>
  )
}
