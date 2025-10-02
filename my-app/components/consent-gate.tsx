"use client"

import { useEffect, useState } from "react"
import Script from "next/script"
import { usePathname, useSearchParams } from "next/navigation"
import Image from "next/image"

type Consent = "accepted" | "declined" | ""

function readConsent(): Consent {
  if (typeof document === "undefined") return ""
  const m = document.cookie.match(/(?:^|;\s*)cookie_consent=([^;]+)/)
  const v = m ? decodeURIComponent(m[1]) : ""
  return (v === "accepted" || v === "declined") ? v : ""
}

declare global {
  interface Window {
    fbq?: (...args: any[]) => void
    _fbq: any
  }
}

function PageViewTracker() {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    if (typeof window !== 'undefined' && window.fbq) {
      window.fbq('track', 'PageView')
    }
  }, [pathname, searchParams])

  return null
}

export default function ConsentGate() {
  const [consent, setConsent] = useState<Consent>("")

  useEffect(() => {
    setConsent(readConsent())
    const onAccept = () => setConsent("accepted")
    window.addEventListener("cookie-consent-accepted", onAccept)
    return () => window.removeEventListener("cookie-consent-accepted", onAccept)
  }, [])

  if (consent !== "accepted") return null

  return (
    <>
        <Script async src="https://connect.facebook.net/en_US/fbevents.js"></Script>

        <Script
        id="meta-pixel"
        strategy="afterInteractive"
      >
        {`
          !function(f,b,e,v,n,t,s)
          {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
          n.callMethod.apply(n,arguments):n.queue.push(arguments)};
          if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
          n.queue=[];t=b.createElement(e);t.async=!0;
          t.src=v;s=b.getElementsByTagName(e)[0];
          s.parentNode.insertBefore(t,s)}(window,document,'script',
          'https://connect.facebook.net/en_US/fbevents.js');
          fbq('init', '2914723308689782');
          fbq('track', 'PageView');
        `}
      </Script>
      <noscript>
        <Image
        alt="Meta Pixel"
          height="1"
          width="1"
          style={{ display: 'none' }}
          src="https://www.facebook.com/tr?id=2914723308689782&ev=PageView&noscript=1"
        />
      </noscript>
      <PageViewTracker />
    </>
  )
}