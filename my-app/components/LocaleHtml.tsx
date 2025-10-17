import { cookies } from 'next/headers'
import HtmlLangDir from './HtmlLangDir'

export default function LocaleHtml() {
  const locale = cookies().get('NEXT_LOCALE')?.value || 'en'
  // @ts-expect-error Async Server Component child
  return <HtmlLangDir locale={locale} />
}
