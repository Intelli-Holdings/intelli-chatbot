"use client"

import { useCallback, useEffect, useState } from "react"
import { useQueryClient } from "react-query"
import { useSearchParams, useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertCircle, ArrowRight, CheckCircle, Loader, RefreshCcw } from "lucide-react"
import useActiveOrganizationId from "@/hooks/use-organization-id"
import {
  launchMessengerEmbeddedSignup,
} from "@/lib/facebook-sdk"
import {
  ASSISTANTS_STALE_TIME_MS,
  assistantsQueryKey,
  fetchAssistantsForOrg,
} from "@/hooks/use-assistants-cache"
import Image from 'next/image';

type SetupStep = "initial" | "authorizing" | "exchanging" | "creating" | "selectingAssistant" | "creatingAppService" | "complete"

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

const MessengerEmbeddedSignup = () => {
  const queryClient = useQueryClient()
  const router = useRouter()
  const searchParams = useSearchParams()
  const organizationId = useActiveOrganizationId()
  const [step, setStep] = useState<SetupStep>("initial")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [statusMessage, setStatusMessage] = useState<string>("")
  const [authCode, setAuthCode] = useState<string | null>(null)
  const [accessToken, setAccessToken] = useState<string | null>(null)
  const [pageInfo, setPageInfo] = useState<{ id: string; name: string; access_token: string } | null>(null)

  // Package and AppService state
  const [packageResponse, setPackageResponse] = useState<PackageResponse | null>(null)
  const [appServiceResponse, setAppServiceResponse] = useState<any>(null)

  // Assistant state
  const [assistants, setAssistants] = useState<Assistant[]>([])
  const [selectedAssistant, setSelectedAssistant] = useState<Assistant | null>(null)
  const [isFetchingAssistants, setIsFetchingAssistants] = useState(false)
  const [isCreatingAppService, setIsCreatingAppService] = useState(false)
  const [appServiceError, setAppServiceError] = useState<string | null>(null)

  // Check for messenger_code from redirect on component mount
  useEffect(() => {
    const messengerCode = searchParams.get("messenger_code")
    const messengerAuth = searchParams.get("messenger_auth")
    const urlError = searchParams.get("error")

    if (urlError) {
      setError(decodeURIComponent(urlError))
      // Clear URL params
      router.replace(window.location.pathname)
      return
    }

    if (messengerCode && messengerAuth === "success") {
      console.log("Received messenger code from redirect:", messengerCode.substring(0, 20) + "...")
      setAuthCode(messengerCode)
      setStep("exchanging")
      setStatusMessage("Authorization successful. Exchanging code for access token...")

      // Build redirect URI - must match what was used in OAuth start
      const redirectUri = process.env.NEXT_PUBLIC_MESSENGER_REDIRECT_URI ||
        `${window.location.origin}/messenger-redirect`

      console.log("Using redirect_uri for token exchange:", redirectUri)

      // Clear URL params
      router.replace(window.location.pathname)

      // Exchange the code for token - pass the redirect_uri to ensure it matches
      exchangeCodeForToken(messengerCode, redirectUri)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, router])

  // Fetch assistants
  const fetchAssistants = useCallback(async () => {
    if (!organizationId) return

    setIsFetchingAssistants(true)
    try {
      const data = await queryClient.fetchQuery(
        assistantsQueryKey(organizationId),
        () => fetchAssistantsForOrg<Assistant>(organizationId),
        { staleTime: ASSISTANTS_STALE_TIME_MS },
      )
      setAssistants(data)

      if (data.length === 0) {
        setError("No assistants found. Please create an assistant first.")
        setStatusMessage("You need to create an assistant before setting up Messenger.")
      }
    } catch (error) {
      console.error("Error fetching assistants:", error)
      setError(error instanceof Error ? error.message : "Failed to fetch assistants")
      setStatusMessage("Error fetching assistants. Please try again.")
    } finally {
      setIsFetchingAssistants(false)
    }
  }, [organizationId, queryClient])

  // Exchange authorization code for access token
  const exchangeCodeForToken = async (code: string, redirectUri?: string) => {
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
      setPageInfo({ id: page.id, name: page.name, access_token: page.access_token })

      // Create the channel package
      const payload = {
        choice: "messenger",
        data: {
          page_id: page.id,
          page_name: page.name,
          access_token: page.access_token,
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

      // Store package response and move to assistant selection
      setPackageResponse(data)
      setStatusMessage("Package created. Please select an assistant.")
      setStep("selectingAssistant")
      fetchAssistants()
    } catch (err) {
      console.error("Channel creation error:", err)
      setError(err instanceof Error ? err.message : "Failed to create Messenger channel")
      setStep("initial")
    } finally {
      setIsLoading(false)
    }
  }

  // Create AppService
  const createAppService = useCallback(async () => {
    if (!packageResponse || !organizationId || !selectedAssistant || !pageInfo) {
      setAppServiceError("Missing required information to create AppService")
      return
    }

    setIsCreatingAppService(true)
    setAppServiceError(null)
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

      setAppServiceResponse(appsvc)
      setStep("complete")
      setStatusMessage("Setup complete! Your Messenger channel is ready.")
    } catch (e) {
      console.error("Error creating AppService:", e)
      setAppServiceError(e instanceof Error ? e.message : "Error creating AppService")
      setStatusMessage("Error creating AppService. Please try again.")
    } finally {
      setIsCreatingAppService(false)
    }
  }, [organizationId, selectedAssistant, packageResponse, pageInfo])

  // Handle assistant confirmation
  const handleAssistantConfirm = useCallback(() => {
    if (!selectedAssistant || !packageResponse) return
    setStep("creatingAppService")
    createAppService()
  }, [selectedAssistant, packageResponse, createAppService])

  // Start the signup process - redirects to Facebook OAuth
  const handleStartSignup = useCallback(() => {
    setError(null)
    setStep("authorizing")
    setStatusMessage("Redirecting to Facebook authorization...")
    // This will redirect the user to Facebook
    launchMessengerEmbeddedSignup()
  }, [])

  // Reset to start over
  const handleReset = useCallback(() => {
    setStep("initial")
    setError(null)
    setStatusMessage("")
    setAuthCode(null)
    setAccessToken(null)
    setPageInfo(null)
    setPackageResponse(null)
    setAppServiceResponse(null)
    setSelectedAssistant(null)
    setAssistants([])
    setAppServiceError(null)
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
                      No assistants found. Please create an assistant first.
                    </div>
                  ) : (
                    assistants.map((assistant) => (
                      <div
                        key={assistant.id}
                        className={`p-3 border rounded-md cursor-pointer ${
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
                  disabled={isLoading || !selectedAssistant || isFetchingAssistants}
                  className="flex items-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <Loader className="w-4 h-4 animate-spin" /> Processing...
                    </>
                  ) : (
                    <>
                      Continue <ArrowRight className="w-4 h-4" />
                    </>
                  )}
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
