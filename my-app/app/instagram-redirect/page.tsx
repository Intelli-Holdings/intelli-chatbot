"use client"

import { Suspense, useCallback, useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertCircle, ArrowRight, CheckCircle, Loader, RefreshCcw } from "lucide-react"
import { useOrganization } from "@clerk/nextjs"
import Image from 'next/image'
import { logger } from "@/lib/logger"

type SetupStep = "loading" | "selectingAssistant" | "connecting" | "complete" | "error"

type Assistant = {
  id: number
  name: string
  prompt: string
  assistant_id: string
  organization: string
  organization_id: string
}

/**
 * Instagram OAuth Redirect Page
 *
 * Flow:
 * 1. Receives ?code= from Facebook OAuth
 * 2. Fetches assistants, lets user pick one
 * 3. Sends code + assistant_id to backend in a single call
 *    (backend handles token exchange + account discovery + AppService creation)
 * 4. Redirects to conversations
 */
export default function InstagramRedirectPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-r from-purple-100 via-pink-100 to-orange-100 p-4">
        <div className="w-10 h-10 animate-spin rounded-full border-4 border-purple-600 border-t-transparent" />
      </div>
    }>
      <InstagramRedirectContent />
    </Suspense>
  )
}

function InstagramRedirectContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { organization } = useOrganization()
  const organizationId = organization?.id

  const [step, setStep] = useState<SetupStep>("loading")
  const [error, setError] = useState<string | null>(null)
  const [statusMessage, setStatusMessage] = useState<string>("Loading...")
  const [hasStarted, setHasStarted] = useState(false)

  // OAuth params captured from URL
  const [authCode, setAuthCode] = useState<string | null>(null)

  // Backend response
  const [connectResponse, setConnectResponse] = useState<Record<string, any> | null>(null)

  // Assistant state
  const [assistants, setAssistants] = useState<Assistant[]>([])
  const [selectedAssistant, setSelectedAssistant] = useState<Assistant | null>(null)
  const [isFetchingAssistants, setIsFetchingAssistants] = useState(false)
  const [connectError, setConnectError] = useState<string | null>(null)

  // Fetch assistants
  const fetchAssistants = useCallback(async (orgId: string) => {
    setIsFetchingAssistants(true)
    try {
      const response = await fetch(`/api/assistants/org/${orgId}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch assistants")
      }

      setAssistants(data)
      return data
    } catch (error) {
      logger.error("Error fetching assistants", { error: error instanceof Error ? error.message : String(error) })
      throw error
    } finally {
      setIsFetchingAssistants(false)
    }
  }, [])

  // Send auth code + assistant to backend
  const connectInstagram = useCallback(async (code: string, orgId: string, assistantId?: string) => {
    setConnectError(null)
    setStep("connecting")
    setStatusMessage("Connecting your Instagram account...")

    const redirectUri = process.env.NEXT_PUBLIC_INSTAGRAM_REDIRECT_URI ||
      `${window.location.origin}/instagram-redirect`

    try {
      const payload: Record<string, string> = {
        organization_id: orgId,
        code,
        redirect_uri: redirectUri,
      }
      if (assistantId) {
        payload.assistant_id = assistantId
      }

      const response = await fetch("/api/appservice/connect/instagram", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || data.detail || "Failed to connect Instagram account")
      }

      setConnectResponse(data)
      setStep("complete")
      setStatusMessage("Setup complete! Redirecting to conversations...")

      setTimeout(() => {
        router.push("/dashboard/conversations/instagram")
      }, 2000)
    } catch (err) {
      logger.error("Instagram connect error", { error: err instanceof Error ? err.message : String(err) })
      setConnectError(err instanceof Error ? err.message : "Failed to connect Instagram account")
      // Go back to assistant selection so user can retry
      setStep("selectingAssistant")
    }
  }, [router])

  // Handle assistant confirmation
  const handleAssistantConfirm = useCallback(() => {
    if (!authCode || !organizationId) return
    connectInstagram(authCode, organizationId, selectedAssistant?.assistant_id)
  }, [authCode, organizationId, selectedAssistant, connectInstagram])

  // Main effect: capture code from URL and fetch assistants
  useEffect(() => {
    const code = searchParams.get("code")
    const urlError = searchParams.get("error")
    const errorDescription = searchParams.get("error_description")

    if (urlError) {
      setStep("error")
      setError(errorDescription || urlError)
      return
    }

    if (!code) {
      setStep("error")
      setError("No authorization code received from Facebook")
      return
    }

    if (!organizationId) {
      setStatusMessage("Loading organization...")
      return
    }

    if (hasStarted) return
    setHasStarted(true)
    setAuthCode(code)

    const setup = async () => {
      try {
        setStep("selectingAssistant")
        setStatusMessage("Select an assistant for your Instagram channel.")
        await fetchAssistants(organizationId)
      } catch (err) {
        setStep("error")
        setError(err instanceof Error ? err.message : "Failed to load assistants")
      }
    }

    setup()
  }, [searchParams, organizationId, hasStarted, fetchAssistants])

  const handleGoToChannels = useCallback(() => {
    router.push("/dashboard/channels")
  }, [router])

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-r from-purple-100 via-pink-100 to-orange-100 p-4">
      <Card className="w-full max-w-lg">
        <div className="p-6">
          <CardTitle className="flex items-center gap-2">
            <Image
              src="/instagram.png"
              alt="Instagram"
              width={25}
              height={25}
              className="h-5 w-5 object-contain"
            />
            Instagram Setup
          </CardTitle>
          <CardDescription className="mt-2">
            Complete your Instagram Business integration.
          </CardDescription>
        </div>

        <CardContent className="space-y-4">
          {/* Loading */}
          {step === "loading" && (
            <div className="flex flex-col items-center space-y-4 py-8">
              <Loader className="w-10 h-10 animate-spin text-purple-600" />
              <p className="text-sm text-gray-600">{statusMessage}</p>
            </div>
          )}

          {/* Selecting Assistant */}
          {step === "selectingAssistant" && (
            <div className="flex flex-col space-y-4">
              <div className="p-4 bg-gray-50 rounded-md">
                <p className="font-medium">Select Your Assistant</p>
                <p className="text-sm text-gray-500 mb-4">Choose an assistant to handle Instagram conversations</p>
                <div className="mt-2 space-y-2">
                  {isFetchingAssistants ? (
                    <div className="flex items-center justify-center p-4">
                      <Loader className="w-4 h-4 animate-spin" />
                      <span className="ml-2">Loading assistants...</span>
                    </div>
                  ) : assistants.length === 0 ? (
                    <div className="p-4 text-center text-gray-500">
                      <p>No assistants found.</p>
                      <Button
                        variant="link"
                        className="mt-2"
                        onClick={() => router.push("/dashboard/assistants")}
                      >
                        Create an Assistant
                      </Button>
                    </div>
                  ) : (
                    assistants.map((assistant) => (
                      <div
                        key={assistant.id}
                        className={`p-3 border rounded-md cursor-pointer transition-colors ${
                          selectedAssistant?.id === assistant.id
                            ? "border-purple-500 bg-purple-50"
                            : "border-gray-200 hover:border-purple-300"
                        }`}
                        onClick={() => setSelectedAssistant(assistant)}
                      >
                        <p className="font-medium">{assistant.name}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
              {connectError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-sm text-red-600">{connectError}</p>
                </div>
              )}
              <CardFooter className="flex justify-end pt-0 px-0">
                <Button
                  onClick={handleAssistantConfirm}
                  disabled={!selectedAssistant || isFetchingAssistants}
                  className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                >
                  Continue <ArrowRight className="w-4 h-4" />
                </Button>
              </CardFooter>
            </div>
          )}

          {/* Connecting */}
          {step === "connecting" && (
            <div className="flex flex-col items-center space-y-4 py-8">
              <Loader className="w-10 h-10 animate-spin text-purple-600" />
              <div className="text-center">
                <p className="font-medium text-gray-900">Connecting Instagram Account</p>
                <p className="text-sm text-gray-600 mt-2">
                  Exchanging credentials and setting up your channel...
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
                      Your Instagram channel is now ready to receive messages.
                    </p>
                    {connectResponse?.instagram_page_name && (
                      <p className="text-sm text-green-600 mt-2">
                        Connected Page: <strong>{connectResponse.instagram_page_name}</strong>
                      </p>
                    )}
                    {selectedAssistant && (
                      <p className="text-sm text-green-600">
                        Assistant: <strong>{selectedAssistant.name}</strong>
                      </p>
                    )}
                  </div>
                </div>
              </div>
              <p className="text-sm text-gray-500 text-center">Redirecting to conversations...</p>
            </div>
          )}

          {/* Error State */}
          {step === "error" && (
            <div className="flex flex-col space-y-4">
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-red-900">Setup Failed</p>
                    <p className="text-sm text-red-700 mt-1">{error}</p>
                  </div>
                </div>
              </div>
              <Button
                onClick={handleGoToChannels}
                variant="outline"
                className="flex items-center gap-2"
              >
                <ArrowRight className="w-4 h-4" />
                Go to Channels
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
