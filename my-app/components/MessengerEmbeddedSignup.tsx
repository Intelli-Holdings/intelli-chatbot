"use client"

import { useCallback, useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertCircle, ArrowRight, CheckCircle, Loader } from "lucide-react"
import useActiveOrganizationId from "@/hooks/use-organization-id"
import {
  initializeFacebookSDK,
  launchMessengerEmbeddedSignup,
  checkLoginStatus,
  type FacebookAuthResponse
} from "@/lib/facebook-sdk"
import Image from 'next/image';

type SetupStep = "initial" | "authorizing" | "exchanging" | "creating" | "complete"

const MessengerEmbeddedSignup = () => {
  const organizationId = useActiveOrganizationId()
  const [step, setStep] = useState<SetupStep>("initial")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [statusMessage, setStatusMessage] = useState<string>("")
  const [authCode, setAuthCode] = useState<string | null>(null)
  const [accessToken, setAccessToken] = useState<string | null>(null)
  const [pageInfo, setPageInfo] = useState<{ id: string; name: string } | null>(null)

  // Initialize Facebook SDK on component mount
  useEffect(() => {
    initializeFacebookSDK().catch((err) => {
      console.error("Failed to initialize Facebook SDK:", err)
      setError("Failed to load Facebook SDK. Please refresh the page.")
    })
  }, [])

  // Handle the login response
  const handleLoginResponse = useCallback(async (response: FacebookAuthResponse) => {
    console.log("Facebook Login Response:", response)

    if (response.status === 'connected' && response.authResponse) {
      const code = response.authResponse.code

      if (code) {
        setAuthCode(code)
        setStep("exchanging")
        setStatusMessage("Authorization successful. Exchanging code for access token...")

        // Exchange code for token
        await exchangeCodeForToken(code)
      } else if (response.authResponse.accessToken) {
        // If we got an access token directly
        setAccessToken(response.authResponse.accessToken)
        setStep("creating")
        setStatusMessage("Access token received. Setting up your Messenger channel...")
        await createMessengerChannel(response.authResponse.accessToken)
      }
    } else if (response.status === 'not_authorized') {
      setError("You need to authorize the app to continue.")
      setStep("initial")
    } else {
      setError("Login was cancelled or failed. Please try again.")
      setStep("initial")
    }
  }, [])

  // Exchange authorization code for access token
  const exchangeCodeForToken = async (code: string) => {
    try {
      setIsLoading(true)

      const response = await fetch("/api/facebook/exchange-token", {
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
        setStatusMessage("Access token received. Setting up your Messenger channel...")
        await createMessengerChannel(data.access_token)
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

  // Create the Messenger channel package
  const createMessengerChannel = async (token: string) => {
    if (!organizationId) {
      setError("Organization ID is required. Please ensure you're in an organization.")
      setStep("initial")
      return
    }

    try {
      setIsLoading(true)
      setStatusMessage("Creating Messenger channel package...")

      // First, fetch the user's pages
      const pagesResponse = await fetch(
        `https://graph.facebook.com/v22.0/me/accounts?access_token=${token}`
      )
      const pagesData = await pagesResponse.json()

      if (!pagesResponse.ok || !pagesData.data || pagesData.data.length === 0) {
        throw new Error("No Facebook Pages found. Please create a Facebook Page first.")
      }

      // Use the first page for now
      const page = pagesData.data[0]
      setPageInfo({ id: page.id, name: page.name })

      // Create the channel package
      const payload = {
        choice: "facebook_messenger",
        data: {
          page_id: page.id,
          page_access_token: page.access_token,
          user_access_token: token
        },
        organization_id: organizationId
      }

      const response = await fetch("/api/channels/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || data.detail || "Failed to create Messenger channel")
      }

      setStep("complete")
      setStatusMessage("Messenger channel created successfully!")
    } catch (err) {
      console.error("Channel creation error:", err)
      setError(err instanceof Error ? err.message : "Failed to create Messenger channel")
      setStep("initial")
    } finally {
      setIsLoading(false)
    }
  }

  // Start the signup process
  const handleStartSignup = useCallback(() => {
    setError(null)
    setStep("authorizing")
    setStatusMessage("Opening Facebook authorization...")
    launchMessengerEmbeddedSignup(handleLoginResponse)
  }, [handleLoginResponse])

  // Reset to start over
  const handleReset = useCallback(() => {
    setStep("initial")
    setError(null)
    setStatusMessage("")
    setAuthCode(null)
    setAccessToken(null)
    setPageInfo(null)
  }, [])

  return (
    <div className="bg-gradient-to-r from-blue-100 to-indigo-100 p-4 rounded-lg shadow-sm w-full h-full flex items-center justify-center">
      <Card className="w-full max-w-lg mx-auto">
        <div className="p-6">
          <CardTitle className="flex items-center gap-2">
            <Image
                        src="/Messenger_logo.png"
                        alt="Facebook"
                        width={25}
                        height={25}
                        className="h-5 w-5 object-contain"
                      />
            Messenger Signup
          </CardTitle>
          <CardDescription className="mt-2">
            Connect your Facebook Page to start receiving and responding to Messenger conversations.
          </CardDescription>
        </div>

        <CardContent className="space-y-4">
          {/* Initial State */}
          {step === "initial" && (
            <div className="flex flex-col items-center space-y-4">
              <p className="text-sm text-gray-600 text-center">
                Click the button below to connect your Facebook Page using Embedded Signup.
              </p>
              <Button
                onClick={handleStartSignup}
                className="bg-[#1877f2] hover:bg-[#166fe5] text-white font-semibold px-6 py-2 rounded-lg flex items-center gap-2"
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
              <Loader className="w-8 h-8 animate-spin text-blue-600" />
              <p className="text-sm text-gray-600">Opening Facebook authorization...</p>
            </div>
          )}

          {/* Exchanging Code */}
          {step === "exchanging" && (
            <div className="flex flex-col items-center space-y-4 py-8">
              <Loader className="w-8 h-8 animate-spin text-blue-600" />
              <div className="text-center">
                <p className="font-medium text-gray-900">Authorization Code Received</p>
                <p className="text-sm text-gray-600 mt-2">Exchanging code for access token...</p>
              </div>
            </div>
          )}

          {/* Creating Channel */}
          {step === "creating" && (
            <div className="flex flex-col items-center space-y-4 py-8">
              <Loader className="w-8 h-8 animate-spin text-blue-600" />
              <div className="text-center">
                <p className="font-medium text-gray-900">Setting Up Your Channel</p>
                <p className="text-sm text-gray-600 mt-2">Creating Messenger channel package...</p>
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
                      Your Facebook Messenger channel is now ready to receive messages.
                    </p>
                    {pageInfo && (
                      <p className="text-sm text-green-600 mt-2">
                        Connected Page: <strong>{pageInfo.name}</strong>
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
                Connect Another Page
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

export default MessengerEmbeddedSignup
