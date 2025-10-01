"use client"

import { useEffect, useState } from "react"
import MetaPixel from "./MetaPixel"

function readConsent(): "accepted" | "declined" | "" {
  if (typeof document === "undefined") return ""
  const match = document.cookie.match(/(?:^|;\s*)cookie_consent=([^;]+)/)
  return match ? decodeURIComponent(match[1]) as any : ""
}

export default function ConsentGate() {
  const [consent, setConsent] = useState<"accepted" | "declined" | "">("")

  useEffect(() => {
    setConsent(readConsent())
    const onAccept = () => setConsent("accepted")
    window.addEventListener("cookie-consent-accepted", onAccept as any)
    return () => window.removeEventListener("cookie-consent-accepted", onAccept as any)
  }, [])

  if (consent !== "accepted") return null
  return <MetaPixel />
}
