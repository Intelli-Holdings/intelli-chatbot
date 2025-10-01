// components/ConsentBanner.tsx
'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

type Consent = 'accepted' | 'rejected' | null
const STORAGE_KEY = 'marketing_consent'

export default function ConsentBanner() {
  const [visible, setVisible] = useState< boolean >(false)

  useEffect(() => {
    const saved = (localStorage.getItem(STORAGE_KEY) as Consent) || null
    setVisible(saved === null) // show if no choice yet
  }, [])

  function setConsent(value: Consent) {
    if (!value) return
    localStorage.setItem(STORAGE_KEY, value)
    setVisible(false)
    // optional: notify listeners (e.g., MetaPixel loader)
    window.dispatchEvent(new CustomEvent('consent-changed', { detail: value }))
  }

  if (!visible) return null

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 bg-white border-t shadow-lg">
      <div className="container mx-auto px-4 py-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <p className="text-sm text-gray-800">
          We use cookies and similar technologies (including the Meta Pixel) to analyze traffic,
          personalize content, and run advertising. This may share data for cross-context behavioral
          advertising. You can accept or reject non-essential cookies. See our{' '}
          <Link href="/privacy" className="underline">Privacy Policy</Link>
          {' '}and{' '}
          <Link href="/do-not-sell" className="underline">Do Not Sell/Share</Link>.
        </p>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setConsent('rejected')}>
            Reject non-essential
          </Button>
          <Button size="sm" onClick={() => setConsent('accepted')}>
            Accept all
          </Button>
        </div>
      </div>
    </div>
  )
}
