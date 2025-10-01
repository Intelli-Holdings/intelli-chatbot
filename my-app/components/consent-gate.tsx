"use client"

import { useEffect, useState } from "react"
import MetaPixel from "./MetaPixel"
import PageView from "./PageView"

type Consent = "accepted" | "declined" | ""

function readConsent(): Consent {
  if (typeof document === "undefined") return ""
  const m = document.cookie.match(/(?:^|;\s*)cookie_consent=([^;]+)/)
  const v = m ? decodeURIComponent(m[1]) : ""
  return (v === "accepted" || v === "declined") ? v : ""
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
    <MetaPixel />
    <PageView />
  </>
)
}
