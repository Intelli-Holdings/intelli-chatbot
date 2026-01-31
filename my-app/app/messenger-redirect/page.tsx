"use client"

import { useCallback, useEffect, useState } from "react"
import { useQueryClient } from "react-query"
import { useSearchParams, useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertCircle, ArrowRight, CheckCircle, Loader, RefreshCcw } from "lucide-react"
import useActiveOrganizationId from "@/hooks/use-organization-id"
import {
  ASSISTANTS_STALE_TIME_MS,
  assistantsQueryKey,
  fetchAssistantsForOrg,
} from "@/hooks/use-assistants-cache"
import Image from 'next/image'

type SetupStep = "processing" | "exchanging" | "creating" | "selectingAssistant" | "creatingAppService" | "complete" | "error"

type Assistant = {
  id: number
  name: string
  prompt: string
  assistant_id: string
  organization: string
  organization_id: string
}

type PackageResponse = {
  id: number
  page_id: string
  page_name: string
  [key: string]: any
}

/**
 * Messenger OAuth Redirect Page
 * This page receives the authorization code from Facebook OAuth flow,
 * exchanges it for a token, creates the package, lets user select assistant,
 * creates the appservice, and redirects to conversations
 */
export default function MessengerRedirectPage() {
  const queryClient = useQueryClient()
  const router = useRouter()
  const searchParams = useSearchParams()
  const organizationId = useActiveOrganizationId()

  const [step, setStep] = useState<SetupStep>("processing")
  const [error, setError] = useState<string | null>(null)
  const [statusMessage, setStatusMessage] = useState<string>("Processing authorization...")

  // Token and page info
  const [accessToken, setAccessToken] = useState<string | null>(null)
  const [pageInfo, setPageInfo] = useState<{ id: string; name: string; access_token: string } | null>(null)

  // Package and AppService state
  const [packageResponse, setPackageResponse] = useState<PackageResponse | null>(null)

  // Assistant state
  const [assistants, setAssistants] = useState<Assistant[]>([])
  const [selectedAssistant, setSelectedAssistant] = useState<Assistant | null>(null)
  const [isFetchingAssistants, setIsFetchingAssistants] = useState(false)
  const [isCreatingAppService, setIsCreatingAppService] = useState(false)
  const [appServiceError, setAppServiceError] = useState<string | null>(null)

  // Exchange authorization code for access token
  const exchangeCodeForToken = useCallback(async (code: string, redirectUri: string) => {
    try {
      setStep("exchanging")
      setStatusMessage("Exchanging authorization code for access token...")

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
        return data.access_token
      } else {
        throw new Error("No access token in response")
      }
    } catch (err) {
      console.error("Token exchange error:", err)
      throw err
    }
  }, [])

  // Create the Messenger channel package
  const createMessengerChannel = useCallback(async (token: string, orgId: string) => {
    try {
      setStep("creating")
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
      setPageInfo({ id: page.id, name: page.name, access_token: page.access_token })

      // Create the channel package
      const payload = {
        choice: "messenger",
        data: {
          page_id: page.id,
          page_name: page.name,
          access_token: page.access_token,
        },
        organization_id: orgId
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

      setPackageResponse(data)
      return { package: data, page }
    } catch (err) {
      console.error("Channel creation error:", err)
      throw err
    }
  }, [])

  // Fetch assistants
  const fetchAssistants = useCallback(async (orgId: string) => {
    setIsFetchingAssistants(true)
    try {
      const data = await queryClient.fetchQuery(
        assistantsQueryKey(orgId),
        () => fetchAssistantsForOrg<Assistant>(orgId),
        { staleTime: ASSISTANTS_STALE_TIME_MS },
      )
      setAssistants(data)

      if (data.length === 0) {
        setError("No assistants found. Please create an assistant first.")
        setStatusMessage("You need to create an assistant before setting up Messenger.")
      }
      return data
    } catch (error) {
      console.error("Error fetching assistants:", error)
      throw error
    } finally {
      setIsFetchingAssistants(false)
    }
  }, [queryClient])

  // Create AppService
  const createAppService = useCallback(async () => {
    if (!packageResponse || !organizationId || !selectedAssistant || !pageInfo) {
      setAppServiceError("Missing required information to create AppService")
      return
    }

    setIsCreatingAppService(true)
    setAppServiceError(null)
    setStep("creatingAppService")
    setStatusMessage("Creating AppService...")

    try {
      const data = {
        organization_id: organizationId,
        page_id: pageInfo.id,
        assistant_id: selectedAssistant.assistant_id,
      }
      console.log("Creating Messenger AppService with data:", data)

      const res = await fetch("/api/appservice/create-messenger", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      const appsvc = await res.json()

      if (!res.ok) {
        console.error("AppService creation error:", appsvc)
        throw new Error(appsvc.error || appsvc.detail || "Failed to create AppService")
      }

      setStep("complete")
      setStatusMessage("Setup complete! Redirecting to conversations...")

      // Redirect to conversations after a brief delay
      setTimeout(() => {
        router.push("/dashboard/conversations/messenger")
      }, 2000)
    } catch (e) {
      console.error("Error creating AppService:", e)
      setAppServiceError(e instanceof Error ? e.message : "Error creating AppService")
      setStatusMessage("Error creating AppService. Please try again.")
      setIsCreatingAppService(false)
    }
  }, [organizationId, selectedAssistant, packageResponse, pageInfo, router])

  // Handle assistant confirmation
  const handleAssistantConfirm = useCallback(() => {
    if (!selectedAssistant || !packageResponse) return
    createAppService()
  }, [selectedAssistant, packageResponse, createAppService])

  // Main effect to process the OAuth callback
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

    // Wait for organizationId to be available
    if (!organizationId) {
      setStatusMessage("Loading organization...")
      return
    }

    // Build redirect URI - must match what was used in OAuth start
    const redirectUri = process.env.NEXT_PUBLIC_MESSENGER_REDIRECT_URI ||
      `${window.location.origin}/messenger-redirect`

    // Start the setup process
    const setupMessenger = async () => {
      try {
        // Step 1: Exchange code for token
        const token = await exchangeCodeForToken(code, redirectUri)

        // Step 2: Create channel package
        await createMessengerChannel(token, organizationId)

        // Step 3: Fetch assistants and show selection
        setStep("selectingAssistant")
        setStatusMessage("Please select an assistant for your Messenger channel.")
        await fetchAssistants(organizationId)
      } catch (err) {
        setStep("error")
        setError(err instanceof Error ? err.message : "Setup failed")
      }
    }

    // Only run once when we have the code and org ID
    if (step === "processing") {
      setupMessenger()
    }
  }, [searchParams, organizationId, step, exchangeCodeForToken, createMessengerChannel, fetchAssistants])

  // Go back to channels
  const handleGoToChannels = useCallback(() => {
    router.push("/dashboard/channels")
  }, [router])

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-r from-blue-100 to-indigo-100 p-4">
      <Card className="w-full max-w-lg">
        <div className="p-6">
          <CardTitle className="flex items-center gap-2">
            <Image
              src="/Messenger_logo.png"
              alt="Messenger"
              width={25}
              height={25}
              className="h-5 w-5 object-contain"
            />
            Messenger Setup
          </CardTitle>
          <CardDescription className="mt-2">
            Complete your Facebook Messenger integration.
          </CardDescription>
        </div>

        <CardContent className="space-y-4">
          {/* Processing / Exchanging / Creating */}
          {(step === "processing" || step === "exchanging" || step === "creating") && (
            <div className="flex flex-col items-center space-y-4 py-8">
              <Loader className="w-10 h-10 animate-spin text-blue-600" />
              <div className="text-center">
                <p className="font-medium text-gray-900">
                  {step === "processing" && "Processing Authorization..."}
                  {step === "exchanging" && "Exchanging Code for Token..."}
                  {step === "creating" && "Creating Messenger Channel..."}
                </p>
                <p className="text-sm text-gray-600 mt-2">{statusMessage}</p>
              </div>
            </div>
          )}

          {/* Selecting Assistant */}
          {step === "selectingAssistant" && (
            <div className="flex flex-col space-y-4">
              <div className="p-4 bg-gray-50 rounded-md">
                <p className="font-medium">Select Your Assistant</p>
                <p className="text-sm text-gray-500 mb-4">Choose an assistant to handle Messenger conversations</p>
                {pageInfo && (
                  <div className="mb-4 p-2 bg-blue-50 rounded-md">
                    <p className="text-sm text-blue-600">
                      Connected Page: <strong>{pageInfo.name}</strong>
                    </p>
                  </div>
                )}
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
                            ? "border-blue-500 bg-blue-50"
                            : "border-gray-200 hover:border-blue-300"
                        }`}
                        onClick={() => setSelectedAssistant(assistant)}
                      >
                        <p className="font-medium">{assistant.name}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
              <CardFooter className="flex justify-end pt-0 px-0">
                <Button
                  onClick={handleAssistantConfirm}
                  disabled={!selectedAssistant || isFetchingAssistants}
                  className="flex items-center gap-2"
                >
                  Continue <ArrowRight className="w-4 h-4" />
                </Button>
              </CardFooter>
            </div>
          )}

          {/* Creating AppService */}
          {step === "creatingAppService" && (
            <div className="flex flex-col space-y-4">
              <div className="p-4 bg-gray-50 rounded-md">
                <p className="font-medium">Creating AppService</p>
                {pageInfo && (
                  <p className="text-sm text-gray-500">Page: {pageInfo.name}</p>
                )}
                {selectedAssistant && (
                  <p className="text-sm text-gray-500">Assistant: {selectedAssistant.name}</p>
                )}
              </div>
              <div className="flex items-center justify-center p-4">
                <Loader className="w-6 h-6 animate-spin" />
                <span className="ml-2">Creating AppService...</span>
              </div>
              {appServiceError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-sm text-red-600">{appServiceError}</p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-2 text-xs"
                    onClick={() => {
                      setAppServiceError(null)
                      createAppService()
                    }}
                  >
                    <RefreshCcw className="w-3 h-3 mr-1" /> Try Again
                  </Button>
                </div>
              )}
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
