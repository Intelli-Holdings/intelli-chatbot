import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { supportedLocales, defaultLocale, normalizeToSupportedLocale } from '@/lib/i18n/config'

// Define routes that should be protected
const isProtectedRoute = createRouteMatcher([
  '/demo(.*)',
  '/chat(.*)',
  '/onboarding(.*)',
  '/feedback(.*)',
  '/dashboard(.*)',
  '/organization/(.*)',
])

// Non-auth marketing/content routes to localize progressively
const localizedPaths = [
  '/about',
  '/pricing',
  '/blog',
  '/resources',
  '/products',
  '/privacy',
  '/terms-of-service',
  '/customer-stories',
  '/company',
  '/services',
  '/usecases',
]

function pickLocale(req: any): string {
  const url = req.nextUrl
  const cookieLocale = req.cookies.get?.('NEXT_LOCALE')?.value
  if (cookieLocale) return normalizeToSupportedLocale(cookieLocale)

  const qp = url.searchParams.get('lang')
  if (qp) return normalizeToSupportedLocale(qp)

  const header = req.headers.get('accept-language') || ''
  const langs = header
    .split(',')
    .map((s: string) => s.split(';')[0].trim())
    .filter(Boolean)
  for (const l of langs) {
    const matched = normalizeToSupportedLocale(l)
    if ((supportedLocales as readonly string[]).includes(matched)) return matched
  }

  const country = (req?.geo?.country || req.headers.get('x-vercel-ip-country') || '').toUpperCase()
  if (["SA","AE","EG","DZ","MA","QA","KW","OM","BH","JO","LB","LY","SD","YE","IQ","SY","TN","PS"].includes(country)) return 'ar'
  if (["PT","BR"].includes(country)) return 'pt'
  if (country === 'NL') return 'nl'
  if (country === 'DE') return 'de'
  if (country === 'FR') return 'fr'
  if (country === 'ES') return 'es'
  if (country === 'IT') return 'it'
  return defaultLocale
}

function middlewareLocale(req: any) {
  const { pathname } = req.nextUrl
  const hasLocale = (supportedLocales as readonly string[])
    .some((loc: string) => pathname === `/${loc}` || pathname.startsWith(`/${loc}/`))

  // Redirect root or selected marketing routes when missing locale
  if (!hasLocale && (pathname === '/' || localizedPaths.some(p => pathname === p || pathname.startsWith(p + '/')))) {
    const loc = pickLocale(req)
    const url = req.nextUrl.clone()
    url.pathname = pathname === '/' ? `/${loc}` : `/${loc}${pathname}`
    const res = NextResponse.redirect(url)
    res.cookies.set('NEXT_LOCALE', loc, { path: '/', maxAge: 60 * 60 * 24 * 365 })
    return res
  }

  return NextResponse.next()
}

export default clerkMiddleware(async (auth, req) => {
  // i18n locale redirect
  const maybe = middlewareLocale(req)
  if (maybe && (maybe as any).redirected) return maybe

  if (isProtectedRoute(req)) auth().protect()
  return NextResponse.next()
})

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}
