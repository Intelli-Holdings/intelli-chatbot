"use client"

import { useCallback, useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertCircle, ArrowRight, CheckCircle, Loader } from "lucide-react"
import useActiveOrganizationId from "@/hooks/use-organization-id"
import {
  launchInstagramSignup,
} from "@/lib/facebook-sdk"
import Image from 'next/image';

import { logger } from "@/lib/logger";

type SetupStep = "initial" | "authorizing" | "connecting" | "complete"

const InstagramEmbeddedSignup = () => {
  const organizationId = useActiveOrganizationId()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [step, setStep] = useState<SetupStep>("initial")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [statusMessage, setStatusMessage] = useState<string>("")
  const [pageName, setPageName] = useState<string | null>(null)

  // Handle Instagram OAuth callback from URL
  useEffect(() => {
    const instagramCode = searchParams.get("instagram_code")
    const instagramAuth = searchParams.get("instagram_auth")
    const urlError = searchParams.get("error")

    if (urlError) {
      setError(decodeURIComponent(urlError))
      router.replace(window.location.pathname)
      return
    }

    if (instagramCode && instagramAuth === "success") {
      logger.info("Received instagram_code from redirect")
      setStep("connecting")
      setStatusMessage("Connecting your Instagram account...")

      // Clear URL params
      router.replace(window.location.pathname)

      // Build redirect URI for token exchange
      const redirectUri = process.env.NEXT_PUBLIC_INSTAGRAM_REDIRECT_URI ||
        `${window.location.origin}/instagram-redirect`

      connectInstagram(instagramCode, redirectUri)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, router])

  // Send auth code to backend for server-side processing
  const connectInstagram = async (code: string, redirectUri: string) => {
    if (!organizationId) {
      setError("Organization ID is required. Please ensure you're in an organization.")
      setStep("initial")
      return
    }

    try {
      setIsLoading(true)

      const response = await fetch("/api/appservice/connect/instagram", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          organization_id: organizationId,
          code,
          redirect_uri: redirectUri,
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || data.detail || "Failed to connect Instagram account")
      }

      setPageName(data.instagram_page_name || null)
      setStep("complete")
      setStatusMessage("Instagram channel created successfully!")
    } catch (err) {
      logger.error("Instagram connect error:", { error: err instanceof Error ? err.message : String(err) })
      setError(err instanceof Error ? err.message : "Failed to connect Instagram account")
      setStep("initial")
    } finally {
      setIsLoading(false)
    }
  }

  // Start the signup process - redirects to Facebook OAuth
  const handleStartSignup = useCallback(() => {
    setError(null)
    setStep("authorizing")
    setStatusMessage("Redirecting to Facebook authorization...")
    launchInstagramSignup()
  }, [])

  // Reset to start over
  const handleReset = useCallback(() => {
    setStep("initial")
    setError(null)
    setStatusMessage("")
    setPageName(null)
  }, [])

  return (
    <div className="bg-gradient-to-r from-purple-100 via-pink-100 to-orange-100 p-4 rounded-lg shadow-sm w-full h-full flex items-center justify-center">
      <Card className="w-full max-w-lg mx-auto">
        <div className="p-6">
          <CardTitle className="flex items-center gap-2">
            <Image
              src="/instagram.png"
              alt="Instagram"
              width={25}
              height={25}
              className="h-5 w-5 object-contain"
            />
            Instagram Embedded Signup
          </CardTitle>
          <CardDescription className="mt-2">
            Connect your Instagram Professional account to handle direct messages.
          </CardDescription>
        </div>

        <CardContent className="space-y-4">
          {/* Initial State */}
          {step === "initial" && (
            <div className="flex flex-col space-y-4">
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-xs text-blue-800">
                  Login with Facebook to connect your Instagram Business account.
                  Your Instagram must be linked to a Facebook Page.
                </p>
              </div>

              <p className="text-sm text-gray-600 text-center">
                Connect using Facebook to link your Instagram Business account
              </p>

              <Button
                onClick={handleStartSignup}
                className="bg-[#1877f2] hover:bg-[#166fe5] text-white font-semibold px-6 py-2 rounded-lg flex items-center gap-2 w-full justify-center"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
                Connect with Facebook
              </Button>
            </div>
          )}

          {/* Authorizing */}
          {step === "authorizing" && (
            <div className="flex flex-col items-center space-y-4 py-8">
              <Loader className="w-8 h-8 animate-spin text-purple-600" />
              <p className="text-sm text-gray-600">Opening Facebook authorization...</p>
            </div>
          )}

          {/* Connecting */}
          {step === "connecting" && (
            <div className="flex flex-col items-center space-y-4 py-8">
              <Loader className="w-8 h-8 animate-spin text-purple-600" />
              <div className="text-center">
                <p className="font-medium text-gray-900">Connecting Instagram Account</p>
                <p className="text-sm text-gray-600 mt-2">
                  Exchanging credentials and discovering your Instagram Business Account...
                </p>
              </div>
            </div>
          )}

          {/* Complete */}
          {step === "complete" && (
            <div className="flex flex-col space-y-4">
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-green-900">Setup Complete!</p>
                    <p className="text-sm text-green-700 mt-1">
                      Your Instagram channel is now ready to receive and respond to messages.
                    </p>
                    {pageName && (
                      <p className="text-sm text-green-600 mt-2">
                        Connected Page: <strong>{pageName}</strong>
                      </p>
                    )}
                  </div>
                </div>
              </div>
              <Button
                onClick={handleReset}
                variant="outline"
                className="flex items-center gap-2"
              >
                <ArrowRight className="w-4 h-4" />
                Connect Another Account
              </Button>
            </div>
          )}

          {/* Error Display */}
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-red-900">Error</p>
                  <p className="text-sm text-red-700 mt-1">{error}</p>
                  {!isLoading && (
                    <Button
                      onClick={handleReset}
                      variant="outline"
                      size="sm"
                      className="mt-3 text-xs"
                    >
                      Try Again
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Status Message */}
          {statusMessage && !error && (
            <p className="text-sm text-gray-500 italic text-center">{statusMessage}</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default InstagramEmbeddedSignup
