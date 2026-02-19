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

type LoginMethod = "facebook" | "instagram"
type SetupStep = "initial" | "authorizing" | "exchanging" | "creating" | "complete"

interface InstagramEmbeddedSignupProps {
  defaultLoginMethod?: LoginMethod
}

const InstagramEmbeddedSignup = ({ defaultLoginMethod = "facebook" }: InstagramEmbeddedSignupProps) => {
  const organizationId = useActiveOrganizationId()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [loginMethod, setLoginMethod] = useState<LoginMethod>(defaultLoginMethod)
  const [step, setStep] = useState<SetupStep>("initial")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [statusMessage, setStatusMessage] = useState<string>("")
  const [authCode, setAuthCode] = useState<string | null>(null)
  const [accessToken, setAccessToken] = useState<string | null>(null)
  const [accountInfo, setAccountInfo] = useState<{ id: string; username: string } | null>(null)

  // Handle Instagram OAuth callback from URL (for both Facebook and Instagram login methods)
  useEffect(() => {
    const instagramCode = searchParams.get("instagram_code")
    const instagramAuth = searchParams.get("instagram_auth")
    const urlError = searchParams.get("error")

    if (urlError) {
      setError(decodeURIComponent(urlError))
      router.replace(window.location.pathname)
      return
    }

    if (instagramCode && instagramAuth === "success" && !authCode) {
      console.log("Received instagram_code from redirect")
      setAuthCode(instagramCode)
      setStep("exchanging")
      setStatusMessage("Authorization code received. Exchanging for access token...")

      // Build redirect URI for token exchange
      const redirectUri = process.env.NEXT_PUBLIC_INSTAGRAM_REDIRECT_URI ||
        `${window.location.origin}/instagram-redirect`

      // Clear URL params
      router.replace(window.location.pathname)

      // Exchange code based on login method
      // For Facebook login flow (via /instagram-redirect), use Facebook token exchange
      exchangeFacebookCodeForToken(instagramCode, redirectUri)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, router, authCode])

  // Exchange Facebook authorization code for access token
  const exchangeFacebookCodeForToken = async (code: string, redirectUri?: string) => {
    try {
      setIsLoading(true)

      const response = await fetch("/api/facebook/exchange-token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, redirect_uri: redirectUri })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to exchange authorization code")
      }

      if (data.access_token) {
        setAccessToken(data.access_token)
        setStep("creating")
        setStatusMessage("Access token received. Setting up your Instagram channel...")
        await createInstagramChannel(data.access_token, "facebook")
      } else {
        throw new Error("No access token in response")
      }
    } catch (err) {
      console.error("Token exchange error:", err)
      setError(err instanceof Error ? err.message : "Failed to exchange code for token")
      setStep("initial")
    } finally {
      setIsLoading(false)
    }
  }

  // Exchange Instagram authorization code for access token
  const exchangeInstagramCodeForToken = async (code: string) => {
    try {
      setIsLoading(true)

      const response = await fetch("/api/instagram/exchange-token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to exchange authorization code")
      }

      if (data.access_token) {
        setAccessToken(data.access_token)
        setStep("creating")
        setStatusMessage("Access token received. Setting up your Instagram channel...")
        await createInstagramChannel(data.access_token, "instagram")
      } else {
        throw new Error("No access token in response")
      }
    } catch (err) {
      console.error("Token exchange error:", err)
      setError(err instanceof Error ? err.message : "Failed to exchange code for token")
      setStep("initial")
    } finally {
      setIsLoading(false)
    }
  }

  // Create the Instagram channel package
  const createInstagramChannel = async (token: string, method: LoginMethod) => {
    if (!organizationId) {
      setError("Organization ID is required. Please ensure you're in an organization.")
      setStep("initial")
      return
    }

    try {
      setIsLoading(true)
      setStatusMessage("Creating Instagram channel package...")

      let payload: any

      if (method === "facebook") {
        // Fetch pages and Instagram Business Account via Facebook
        const pagesResponse = await fetch(
          `https://graph.facebook.com/v22.0/me/accounts?fields=id,name,access_token,instagram_business_account&access_token=${token}`
        )
        const pagesData = await pagesResponse.json()

        if (!pagesResponse.ok || !pagesData.data || pagesData.data.length === 0) {
          throw new Error("No Facebook Pages found. Please create a Facebook Page and link it to your Instagram account.")
        }

        // Find a page with Instagram Business Account
        const pageWithInstagram = pagesData.data.find((page: any) => page.instagram_business_account)

        if (!pageWithInstagram) {
          throw new Error("No Instagram Business Account found linked to your Facebook Pages.")
        }

        setAccountInfo({
          id: pageWithInstagram.instagram_business_account.id,
          username: pageWithInstagram.name
        })

        payload = {
          choice: "instagram",
          data: {
            page_id: pageWithInstagram.id,
            page_access_token: pageWithInstagram.access_token,
            user_access_token: token,
            instagram_business_account_id: pageWithInstagram.instagram_business_account.id
          },
          organization_id: organizationId
        }
      } else {
        // Instagram direct login - fetch user info
        const userInfoResponse = await fetch("/api/instagram/user-info", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ access_token: token })
        })

        const userInfo = await userInfoResponse.json()

        if (!userInfoResponse.ok) {
          throw new Error(userInfo.error || "Failed to fetch Instagram user info")
        }

        setAccountInfo({
          id: userInfo.instagram_business_account_id,
          username: userInfo.username
        })

        payload = {
          choice: "instagram",
          data: {
            instagram_business_account_id: userInfo.instagram_business_account_id,
            access_token: token,
            user_id: userInfo.user_id,
            username: userInfo.username
          },
          organization_id: organizationId
        }
      }

      const response = await fetch("/api/channels/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || data.detail || "Failed to create Instagram channel")
      }

      setStep("complete")
      setStatusMessage("Instagram channel created successfully!")
    } catch (err) {
      console.error("Channel creation error:", err)
      setError(err instanceof Error ? err.message : "Failed to create Instagram channel")
      setStep("initial")
    } finally {
      setIsLoading(false)
    }
  }

  // Start the signup process with Facebook - redirects to Facebook OAuth
  const handleStartFacebookSignup = useCallback(() => {
    setError(null)
    setStep("authorizing")
    setStatusMessage("Redirecting to Facebook authorization...")
    // This will redirect the user to Facebook
    launchInstagramSignup()
  }, [])

  // Start the signup process with Instagram
  const handleStartInstagramSignup = useCallback(() => {
    setError(null)
    setStep("authorizing")
    setStatusMessage("Redirecting to Instagram...")

    const clientId = process.env.NEXT_PUBLIC_INSTAGRAM_APP_ID
    const redirectUri = process.env.NEXT_PUBLIC_INSTAGRAM_REDIRECT_URI

    if (!clientId || !redirectUri) {
      setError("Instagram app configuration missing")
      setStep("initial")
      return
    }

    const scopes = "instagram_business_basic,instagram_business_manage_messages,instagram_business_manage_comments,instagram_business_content_publish,instagram_business_manage_insights"

    const url = new URL("https://api.instagram.com/oauth/authorize")
    url.searchParams.set("client_id", clientId)
    url.searchParams.set("redirect_uri", redirectUri)
    url.searchParams.set("response_type", "code")
    url.searchParams.set("scope", scopes)

    window.location.assign(url.toString())
  }, [])

  // Reset to start over
  const handleReset = useCallback(() => {
    setStep("initial")
    setError(null)
    setStatusMessage("")
    setAuthCode(null)
    setAccessToken(null)
    setAccountInfo(null)
  }, [])

  return (
    <div className="bg-gradient-to-r from-purple-100 via-pink-100 to-orange-100 p-4 rounded-lg shadow-sm w-full h-full flex items-center justify-center">
      <Card className="w-full max-w-lg mx-auto">
        <div className="p-6">
          <CardTitle className="flex items-center gap-2">
            <Image
              src="/instagram.png"
              alt="Facebook"
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
              <div className="flex gap-2 mb-2">
                <Button
                  variant={loginMethod === "facebook" ? "default" : "outline"}
                  onClick={() => setLoginMethod("facebook")}
                  size="sm"
                  className="flex-1"
                >
                  Facebook Login
                </Button>
                <Button
                  variant={loginMethod === "instagram" ? "default" : "outline"}
                  onClick={() => setLoginMethod("instagram")}
                  size="sm"
                  className="flex-1"
                >
                  Instagram Login
                </Button>
              </div>

              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-xs text-blue-800">
                  {loginMethod === "facebook"
                    ? "✓ Recommended: Login with Facebook if your Instagram is linked to a Facebook Page"
                    : "Use Instagram Login if you have an Instagram Business account"}
                </p>
              </div>

              <p className="text-sm text-gray-600 text-center">
                {loginMethod === "facebook"
                  ? "Connect using Facebook to link your Instagram Business account"
                  : "Connect directly with your Instagram Business credentials"}
              </p>

              {loginMethod === "facebook" ? (
                <Button
                  onClick={handleStartFacebookSignup}
                  className="bg-[#1877f2] hover:bg-[#166fe5] text-white font-semibold px-6 py-2 rounded-lg flex items-center gap-2 w-full justify-center"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                  Connect with Facebook
                </Button>
              ) : (
                <Button
                  onClick={handleStartInstagramSignup}
                  className="bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 hover:from-purple-700 hover:via-pink-700 hover:to-orange-700 text-white font-semibold px-6 py-2 rounded-lg flex items-center gap-2 w-full justify-center"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                  Connect with Instagram
                </Button>
              )}
            </div>
          )}

          {/* Authorizing */}
          {step === "authorizing" && (
            <div className="flex flex-col items-center space-y-4 py-8">
              <Loader className="w-8 h-8 animate-spin text-purple-600" />
              <p className="text-sm text-gray-600">
                {loginMethod === "facebook" ? "Opening Facebook authorization..." : "Redirecting to Instagram..."}
              </p>
            </div>
          )}

          {/* Exchanging Code */}
          {step === "exchanging" && (
            <div className="flex flex-col items-center space-y-4 py-8">
              <Loader className="w-8 h-8 animate-spin text-purple-600" />
              <div className="text-center">
                <p className="font-medium text-gray-900">Authorization Code Received</p>
                <p className="text-sm text-gray-600 mt-2">Exchanging code for access token...</p>
              </div>
            </div>
          )}

          {/* Creating Channel */}
          {step === "creating" && (
            <div className="flex flex-col items-center space-y-4 py-8">
              <Loader className="w-8 h-8 animate-spin text-purple-600" />
              <div className="text-center">
                <p className="font-medium text-gray-900">Setting Up Your Channel</p>
                <p className="text-sm text-gray-600 mt-2">Creating Instagram channel package...</p>
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
                    {accountInfo && (
                      <p className="text-sm text-green-600 mt-2">
                        Connected Account: <strong>@{accountInfo.username}</strong>
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
