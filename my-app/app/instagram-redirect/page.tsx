"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Loader } from "lucide-react"

/**
 * Instagram OAuth Redirect Page
 * This page receives the authorization code from Instagram OAuth flow
 * and redirects to the channels page with the code
 */
export default function InstagramRedirectPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<"loading" | "error">("loading")
  const [errorMessage, setErrorMessage] = useState<string>("")

  useEffect(() => {
    const code = searchParams.get("code")
    const error = searchParams.get("error")
    const errorReason = searchParams.get("error_reason")
    const errorDescription = searchParams.get("error_description")

    if (error) {
      setStatus("error")
      setErrorMessage(errorDescription || errorReason || error)

      // Redirect to channels page with error after 3 seconds
      setTimeout(() => {
        router.push(`/dashboard/channels?error=${encodeURIComponent(errorMessage || error)}`)
      }, 3000)
      return
    }

    if (code) {
      // Successfully received code, redirect to channels page
      router.push(`/dashboard/channels?instagram_code=${code}&instagram_auth=success`)
    } else {
      setStatus("error")
      setErrorMessage("No authorization code received from Instagram")

      // Redirect to channels page with error after 3 seconds
      setTimeout(() => {
        router.push("/dashboard/channels?error=No authorization code received")
      }, 3000)
    }
  }, [searchParams, router, errorMessage])

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-r from-purple-100 to-pink-100">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-lg">
        {status === "loading" ? (
          <div className="flex flex-col items-center space-y-4">
            <Loader className="h-12 w-12 animate-spin text-purple-600" />
            <h2 className="text-xl font-semibold text-gray-800">Connecting to Instagram...</h2>
            <p className="text-center text-sm text-gray-600">
              Please wait while we complete your Instagram authentication.
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center space-y-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
              <span className="text-2xl text-red-600">✕</span>
            </div>
            <h2 className="text-xl font-semibold text-gray-800">Authentication Error</h2>
            <p className="text-center text-sm text-gray-600">{errorMessage}</p>
            <p className="text-center text-xs text-gray-500">Redirecting you back to the channels page...</p>
          </div>
        )}
      </div>
    </div>
  )
}
