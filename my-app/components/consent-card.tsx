"use client"

import { useEffect, useState, useCallback } from "react"
import { Button } from "@/components/ui/button"

const LS_KEY = "cookie-consent"
const COOKIE_NAME = "cookie_consent"

function readCookie(name: string) {
  if (typeof document === "undefined") return ""
  const match = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"))
  return match ? decodeURIComponent(match[2]) : ""
}

function writeCookie(name: string, value: string, days = 365) {
  if (typeof document === "undefined") return
  const expires = new Date(Date.now() + days * 864e5).toUTCString()
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax`
}

export default function ConsentBanner() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const ls = typeof window !== "undefined" ? window.localStorage.getItem(LS_KEY) : null
    const ck = readCookie(COOKIE_NAME)
    if (!ls && !ck) {
      setVisible(true)
    }
  }, [])

  const accept = useCallback(() => {
    if (typeof window !== "undefined") window.localStorage.setItem(LS_KEY, "accepted")
    writeCookie(COOKIE_NAME, "accepted")
    setVisible(false)
    if (typeof window !== "undefined") window.dispatchEvent(new Event("cookie-consent-accepted"))
  }, [])

  const decline = useCallback(() => {
    if (typeof window !== "undefined") window.localStorage.setItem(LS_KEY, "declined")
    writeCookie(COOKIE_NAME, "declined")
    setVisible(false)
  }, [])

  if (!visible) return null

  return (
    <div
      role="dialog"
      aria-live="polite"
      aria-label="Cookie consent"
      className="fixed left-6 bottom-6 z-50 max-w-sm"
    >
      <div className="rounded-2xl border border-blue-200 bg-white text-blue-900 shadow-xl transform translate-y-2">
        <div className="p-5">
          <div className="flex items-start gap-3">
            <div className="flex-1">
              <h2 className="text-base font-bold">Intelli Uses Cookies</h2>
              <p className="mt-2 text-sm leading-6">
                We use essential cookies to make our site work. With your consent, we may also use
                non-essential cookies to improve user experience and analyze website traffic. By
                clicking <strong>Accept</strong>, you agree to our website’s cookie use. Learn more
                in our{" "}
                <a href="/privacy" className="underline text-blue-700 hover:text-blue-600">
                  Privacy Policy
                </a>.
              </p>
            </div>
          </div>

          <div className="my-4 h-px w-full border-t border-dotted border-blue-200" />

          <div className="flex items-center gap-3">
            <Button
              size="sm"
              variant="outline"
              className="rounded-md border-blue-600 text-blue-700 hover:bg-blue-50 px-3"
              onClick={decline}
            >
              Reject non-essentials
            </Button>
            <Button
              size="sm"
              className="rounded-md w-full bg-blue-600 text-white hover:bg-blue-700"
              onClick={accept}
            >
              Accept
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
