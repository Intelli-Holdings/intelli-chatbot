"use client"

import type React from "react"

import { useEffect, useCallback, useState } from "react"
import { useQueryClient } from "react-query"
import { CardDescription, CardTitle, Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowRight, Loader, RefreshCcw, AlertCircle, CheckCircle } from "lucide-react"
import useActiveOrganizationId from "@/hooks/use-organization-id"
import {
  ASSISTANTS_STALE_TIME_MS,
  assistantsQueryKey,
  fetchAssistantsForOrg,
} from "@/hooks/use-assistants-cache"
import type { FacebookAuthResponse } from "@/lib/facebook-sdk"
import { logger } from "@/lib/logger"

// WhatsApp-specific Facebook login params (extends the base SDK)
interface WhatsAppFacebookLoginParams {
  config_id?: string
  response_type: string
  override_default_response_type: boolean
  scope?: string
  extras?: {
    setup: Record<string, unknown>
    featureType: string
    sessionInfoVersion: string
    version: string
  }
}

type WhatsAppSessionInfo = {
  phone_number_id: string
  waba_id: string
}

type AppServiceResponse = { id: number; is_coexistence?: boolean; [key: string]: any }

type SyncResponse = {
  messaging_product: string
  request_id: string
}

type Assistant = {
  id: number
  name: string
  prompt: string
  assistant_id: string
  organization: string
  organization_id: string
}

type Step =
  | "initial"
  | "sdkComplete"
  | "selectingAssistant"
  | "connecting"
  | "syncingContacts"
  | "syncingHistory"
  | "complete"

const EmbeddedSignup = () => {
  const queryClient = useQueryClient()
  const organizationId = useActiveOrganizationId()

  // SDK state
  const [sdkCode, setSdkCode] = useState<string | null>(null)
  const [sessionInfo, setSessionInfo] = useState<WhatsAppSessionInfo | null>(null)
  const [isBusinessAppOnboarding, setIsBusinessAppOnboarding] = useState(false)

  // Flow state
  const [step, setStep] = useState<Step>("initial")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [statusMessage, setStatusMessage] = useState("")

  // Assistant selection
  const [assistants, setAssistants] = useState<Assistant[]>([])
  const [selectedAssistant, setSelectedAssistant] = useState<Assistant | null>(null)
  const [isFetchingAssistants, setIsFetchingAssistants] = useState(false)

  // Result state
  const [appServiceResponse, setAppServiceResponse] = useState<AppServiceResponse | null>(null)

  // Coexistence sync state
  const [contactsSyncResponse, setContactsSyncResponse] = useState<SyncResponse | null>(null)
  const [historySyncResponse, setHistorySyncResponse] = useState<SyncResponse | null>(null)
  const [isSyncingContacts, setIsSyncingContacts] = useState(false)
  const [isSyncingHistory, setIsSyncingHistory] = useState(false)
  const [syncError, setSyncError] = useState<string | null>(null)

  // Debug
  const [debugMode, setDebugMode] = useState(false)

  // -------------------------------------------------------------------------
  // 1) FB SDK initialization
  // -------------------------------------------------------------------------
  const initializeFacebookSDK = useCallback(() => {
    if (window.FB) return
    window.fbAsyncInit = () => {
      window.FB?.init({
        appId: process.env.NEXT_PUBLIC_FACEBOOK_APP_ID!,
        cookie: true,
        xfbml: true,
        version: "v22.0",
      })
      window.FB?.AppEvents?.logPageView()
    }
    const script = document.createElement("script")
    script.src = "https://connect.facebook.net/en_US/sdk.js"
    script.async = true
    script.defer = true
    script.crossOrigin = "anonymous"
    document.body.appendChild(script)
  }, [])

  // -------------------------------------------------------------------------
  // 2) Handle FB login callback -- receives the OAuth code
  // -------------------------------------------------------------------------
  const handleFBLogin = useCallback((response: FacebookAuthResponse) => {
    if (response.authResponse?.code) {
      setSdkCode(response.authResponse.code)
      // If session info is already set (from message event), go to assistant selection
      // Otherwise wait for the message event
      setStatusMessage("Authorization code received.")
    }
  }, [])

  // -------------------------------------------------------------------------
  // 3) Launch FB login to start embedded WhatsApp signup
  // -------------------------------------------------------------------------
  const launchWhatsAppSignup = useCallback(() => {
    if (!window.FB) return
    ;(window.FB.login as any)(handleFBLogin, {
      config_id: process.env.NEXT_PUBLIC_FACEBOOK_CONFIG_ID!,
      response_type: "code",
      override_default_response_type: true,
      extras: {
        setup: {},
        version: "v3",
        featureType: "whatsapp_business_app_onboarding",
        sessionInfoVersion: "3",
      },
    } as WhatsAppFacebookLoginParams)
  }, [handleFBLogin])

  // -------------------------------------------------------------------------
  // 4) Listen for WA signup messages (session info + code)
  // -------------------------------------------------------------------------
  useEffect(() => {
    initializeFacebookSDK()
    const handleMessage = (event: MessageEvent) => {
      if (!["https://www.facebook.com", "https://web.facebook.com"].includes(event.origin)) return
      try {
        const data = JSON.parse(event.data)

        if (data.type === "WA_EMBEDDED_SIGNUP" && data.event === "FINISH_WHATSAPP_BUSINESS_APP_ONBOARDING") {
          setSessionInfo({ phone_number_id: data.data.phone_number_id, waba_id: data.data.waba_id })
          setIsBusinessAppOnboarding(true)
          setStep("sdkComplete")
          setStatusMessage("WhatsApp Business App connected. Select an assistant to continue.")
        } else if (data.type === "WA_EMBEDDED_SIGNUP" && data.event === "FINISH") {
          setSessionInfo({ phone_number_id: data.data.phone_number_id, waba_id: data.data.waba_id })
          setIsBusinessAppOnboarding(false)
          setStep("sdkComplete")
          setStatusMessage("WhatsApp setup complete. Select an assistant to continue.")
        }
      } catch {
        // Non-JSON messages from other origins; ignore
      }
    }
    window.addEventListener("message", handleMessage)
    return () => window.removeEventListener("message", handleMessage)
  }, [initializeFacebookSDK])

  // Auto-advance: once we have both sdkCode + sessionInfo, fetch assistants
  useEffect(() => {
    if (step === "sdkComplete" && sdkCode && sessionInfo) {
      fetchAssistants()
    }
  }, [step, sdkCode, sessionInfo])

  // -------------------------------------------------------------------------
  // 5) Fetch assistants for selection
  // -------------------------------------------------------------------------
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
      setStep("selectingAssistant")

      if (data.length === 0) {
        setError("No assistants found. Please create an assistant first.")
      }
    } catch (err) {
      logger.error("Error fetching assistants:", { error: err instanceof Error ? err.message : String(err) })
      setError(err instanceof Error ? err.message : "Failed to fetch assistants")
    } finally {
      setIsFetchingAssistants(false)
    }
  }, [organizationId, queryClient])

  // -------------------------------------------------------------------------
  // 6) Connect WhatsApp -- single backend call handles everything
  //    (code exchange, long-lived token, WABA discovery, phone registration,
  //     package creation, AppService creation)
  // -------------------------------------------------------------------------
  const connectWhatsApp = useCallback(async () => {
    if (!sdkCode || !organizationId || !selectedAssistant) return

    setIsLoading(true)
    setError(null)
    setStep("connecting")
    setStatusMessage("Setting up your WhatsApp Business account...")

    try {
      const payload: Record<string, any> = {
        organization_id: organizationId,
        code: sdkCode,
        is_coexistence: isBusinessAppOnboarding,
        assistant_id: selectedAssistant.assistant_id,
      }

      // Pass SDK session hints if available
      if (sessionInfo?.waba_id) {
        payload.waba_id = sessionInfo.waba_id
      }
      if (sessionInfo?.phone_number_id) {
        payload.phone_number_id = sessionInfo.phone_number_id
      }

      logger.info("Connecting WhatsApp via backend:", {
        organization_id: organizationId,
        is_coexistence: isBusinessAppOnboarding,
        has_waba_hint: !!sessionInfo?.waba_id,
        has_phone_hint: !!sessionInfo?.phone_number_id,
      })

      const response = await fetch("/api/appservice/connect/whatsapp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      const data = await response.json()

      if (!response.ok) {
        const errorMsg = data.error || data.detail || "Failed to connect WhatsApp"
        throw new Error(errorMsg)
      }

      setAppServiceResponse(data)
      logger.info("WhatsApp connected successfully:", { appServiceId: data.id, isCoexistence: data.is_coexistence })

      // For coexistence mode, start data synchronization
      if (isBusinessAppOnboarding && sessionInfo) {
        setStep("syncingContacts")
        setStatusMessage("WhatsApp connected. Starting data synchronization...")
        setTimeout(() => initiateContactsSync(), 1000)
      } else {
        setStep("complete")
        setStatusMessage("Setup complete! Your WhatsApp business account is ready.")
      }
    } catch (err) {
      logger.error("Error connecting WhatsApp:", { error: err instanceof Error ? err.message : String(err) })
      setError(err instanceof Error ? err.message : "Error connecting WhatsApp")
      setStatusMessage("Error connecting WhatsApp. Please try again.")
      setStep("selectingAssistant")
    } finally {
      setIsLoading(false)
    }
  }, [sdkCode, organizationId, selectedAssistant, isBusinessAppOnboarding, sessionInfo])

  // -------------------------------------------------------------------------
  // 7) Coexistence sync: contacts then history
  // -------------------------------------------------------------------------
  const initiateHistorySync = useCallback(async () => {
    if (!sessionInfo?.phone_number_id || !appServiceResponse) return

    setIsSyncingHistory(true)
    setSyncError(null)
    setStep("syncingHistory")
    setStatusMessage("Synchronizing message history...")

    try {
      // Use the access token from the created AppService
      const accessToken = appServiceResponse.access_token
      if (!accessToken) {
        logger.warn("No access token on AppService response, skipping history sync")
        setStep("complete")
        setStatusMessage("Setup complete! Your WhatsApp Business app is connected.")
        return
      }

      const url = `https://graph.facebook.com/v22.0/${sessionInfo.phone_number_id}/smb_app_data`
      const response = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          sync_type: "history",
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error?.message || "Failed to initiate history synchronization")
      }

      setHistorySyncResponse(data)
      setStatusMessage("History sync initiated. Completing setup...")

      setTimeout(() => {
        setStep("complete")
        setStatusMessage("Setup complete! Your WhatsApp Business app is connected and data synchronization is in progress.")
      }, 2000)
    } catch (err) {
      logger.error("Error initiating history sync:", { error: err instanceof Error ? err.message : String(err) })
      setSyncError(err instanceof Error ? err.message : "Error initiating history sync")
      // Non-fatal: proceed to complete
      setTimeout(() => {
        setStep("complete")
        setStatusMessage("Setup complete! History sync could not be initiated but your account is ready.")
      }, 2000)
    } finally {
      setIsSyncingHistory(false)
    }
  }, [sessionInfo, appServiceResponse])

  const initiateContactsSync = useCallback(async () => {
    if (!sessionInfo?.phone_number_id || !appServiceResponse) return

    setIsSyncingContacts(true)
    setSyncError(null)
    setStatusMessage("Synchronizing contacts from WhatsApp Business app...")

    try {
      const accessToken = appServiceResponse.access_token
      if (!accessToken) {
        logger.warn("No access token on AppService response, skipping contacts sync")
        setStep("complete")
        setStatusMessage("Setup complete! Your WhatsApp Business app is connected.")
        return
      }

      const url = `https://graph.facebook.com/v22.0/${sessionInfo.phone_number_id}/smb_app_data`
      const response = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          sync_type: "smb_app_state_sync",
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error?.message || "Failed to initiate contacts synchronization")
      }

      setContactsSyncResponse(data)
      setStatusMessage("Contacts sync initiated. Now synchronizing message history...")

      setTimeout(() => initiateHistorySync(), 1000)
    } catch (err) {
      logger.error("Error initiating contacts sync:", { error: err instanceof Error ? err.message : String(err) })
      setSyncError(err instanceof Error ? err.message : "Error initiating contacts sync")
      // Non-fatal: still try history sync
      setTimeout(() => initiateHistorySync(), 1000)
    } finally {
      setIsSyncingContacts(false)
    }
  }, [sessionInfo, appServiceResponse, initiateHistorySync])

  // -------------------------------------------------------------------------
  // Reset
  // -------------------------------------------------------------------------
  const resetFlow = useCallback(() => {
    setSdkCode(null)
    setSessionInfo(null)
    setIsBusinessAppOnboarding(false)
    setStep("initial")
    setIsLoading(false)
    setError(null)
    setStatusMessage("")
    setAssistants([])
    setSelectedAssistant(null)
    setAppServiceResponse(null)
    setContactsSyncResponse(null)
    setHistorySyncResponse(null)
    setSyncError(null)
  }, [])

  // -------------------------------------------------------------------------
  // Render step content
  // -------------------------------------------------------------------------
  const renderStepContent = () => {
    switch (step) {
      case "initial":
        return (
          <div className="flex flex-col items-center space-y-4">
            <Button onClick={launchWhatsAppSignup} className="bg-[#1877f2] hover:bg-[#166fe5]">
              Login with Facebook
            </Button>
          </div>
        )

      case "sdkComplete":
        return (
          <div className="flex flex-col space-y-4">
            <div className="p-4 bg-green-50 rounded-md">
              <p className="font-medium text-green-700">
                {isBusinessAppOnboarding ? "Business App Connected" : "WhatsApp Setup Complete"}
              </p>
              <p className="text-sm text-green-600">
                {isBusinessAppOnboarding
                  ? "Your existing WhatsApp Business app is connected. Loading assistants..."
                  : "WhatsApp configuration received. Loading assistants..."}
              </p>
            </div>
            {isFetchingAssistants && (
              <div className="flex items-center justify-center p-4">
                <Loader size={16} className="animate-spin" />
                <span className="ml-2">Loading assistants...</span>
              </div>
            )}
          </div>
        )

      case "selectingAssistant":
        return (
          <div className="flex flex-col space-y-4">
            <div className="p-4 bg-gray-50 rounded-md">
              <p className="font-medium">Select Your Assistant</p>
              <p className="text-sm text-gray-500 mb-4">Choose an assistant for your WhatsApp integration</p>
              {isBusinessAppOnboarding && (
                <div className="mb-4 p-2 bg-blue-50 rounded-md">
                  <p className="text-sm text-blue-600">
                    This will be connected to your existing WhatsApp Business app (coexistence mode)
                  </p>
                </div>
              )}
              <div className="mt-2 space-y-2">
                {assistants.length === 0 ? (
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
            <CardFooter className="flex justify-end pt-0">
              <Button
                onClick={connectWhatsApp}
                disabled={isLoading || !selectedAssistant}
                className="flex items-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader size={16} className="animate-spin" /> Connecting...
                  </>
                ) : (
                  <>
                    Connect WhatsApp <ArrowRight size={16} />
                  </>
                )}
              </Button>
            </CardFooter>
          </div>
        )

      case "connecting":
        return (
          <div className="flex flex-col space-y-4">
            <div className="p-4 bg-gray-50 rounded-md">
              <p className="font-medium">Setting Up WhatsApp</p>
              <p className="text-sm text-gray-500">
                Exchanging credentials, configuring your account, and creating your integration...
              </p>
            </div>
            <div className="flex items-center justify-center p-4">
              <Loader size={24} className="animate-spin" />
              <span className="ml-2">Connecting to WhatsApp...</span>
            </div>
          </div>
        )

      case "syncingContacts":
        return (
          <div className="flex flex-col space-y-4">
            <div className="p-4 bg-blue-50 rounded-md">
              <p className="font-medium text-blue-700">Synchronizing Contacts</p>
              <p className="text-sm text-blue-600">
                Importing your WhatsApp Business app contacts. This may take a few moments...
              </p>
              {contactsSyncResponse && (
                <div className="mt-2 p-2 bg-white rounded-md">
                  <p className="text-xs text-gray-600">Request ID: {contactsSyncResponse.request_id}</p>
                </div>
              )}
            </div>
            <div className="flex items-center justify-center p-4">
              <Loader size={24} className="animate-spin" />
              <span className="ml-2">Synchronizing contacts...</span>
            </div>
            {syncError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-600">{syncError}</p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-2 text-xs"
                  onClick={() => {
                    setSyncError(null)
                    initiateContactsSync()
                  }}
                >
                  <RefreshCcw size={12} className="mr-1" /> Retry Sync
                </Button>
              </div>
            )}
          </div>
        )

      case "syncingHistory":
        return (
          <div className="flex flex-col space-y-4">
            <div className="p-4 bg-blue-50 rounded-md">
              <p className="font-medium text-blue-700">Synchronizing Message History</p>
              <p className="text-sm text-blue-600">
                Importing your WhatsApp Business app message history. This process may take several minutes...
              </p>
              {historySyncResponse && (
                <div className="mt-2 p-2 bg-white rounded-md">
                  <p className="text-xs text-gray-600">Request ID: {historySyncResponse.request_id}</p>
                </div>
              )}
            </div>
            <div className="flex items-center justify-center p-4">
              <Loader size={24} className="animate-spin" />
              <span className="ml-2">Synchronizing message history...</span>
            </div>
            {syncError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-600">{syncError}</p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-2 text-xs"
                  onClick={() => {
                    setSyncError(null)
                    initiateHistorySync()
                  }}
                >
                  <RefreshCcw size={12} className="mr-1" /> Retry Sync
                </Button>
              </div>
            )}
          </div>
        )

      case "complete":
        return (
          <div className="flex flex-col space-y-4">
            <div className="p-4 bg-green-50 rounded-md">
              <p className="font-medium text-green-700">Setup Complete</p>
              <p className="text-sm text-green-600">
                {isBusinessAppOnboarding
                  ? "Your WhatsApp Business app is now connected and synchronized. You can continue using your WhatsApp Business app alongside our platform."
                  : "Your WhatsApp business account is ready."}
              </p>

              {isBusinessAppOnboarding && (
                <div className="mt-3 space-y-2">
                  <div className="flex items-center space-x-2">
                    <CheckCircle size={16} className="text-green-500" />
                    <span className="text-sm text-green-600">WhatsApp Business app connected</span>
                  </div>
                  {contactsSyncResponse && (
                    <div className="flex items-center space-x-2">
                      <CheckCircle size={16} className="text-green-500" />
                      <span className="text-sm text-green-600">Contacts synchronization initiated</span>
                    </div>
                  )}
                  {historySyncResponse && (
                    <div className="flex items-center space-x-2">
                      <CheckCircle size={16} className="text-green-500" />
                      <span className="text-sm text-green-600">Message history synchronization initiated</span>
                    </div>
                  )}
                  <div className="mt-3 p-2 bg-yellow-50 rounded-md">
                    <p className="text-xs text-yellow-600">
                      <strong>Note:</strong> Synchronization will continue in the background. You&apos;ll receive webhooks as your data is processed.
                    </p>
                  </div>
                </div>
              )}
            </div>

            <Button onClick={resetFlow} className="flex items-center gap-2">
              <ArrowRight size={16} />
              Start Again
            </Button>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="bg-gradient-to-r from-teal-100 to-blue-100 p-4 rounded-lg shadow-sm w-full h-full flex items-center justify-center">
      <Card className="w-full max-w-lg mx-auto">
        <div className="p-6">
          <CardTitle>WhatsApp Business Setup</CardTitle>
          <CardDescription className="mt-1">
            Connect your WhatsApp Business account
            {isBusinessAppOnboarding && (
              <span className="block mt-1 text-blue-600 font-medium">
                Business App Integration Mode (Coexistence)
              </span>
            )}
          </CardDescription>
        </div>

        <CardContent>
          {renderStepContent()}

          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <div className="flex items-start">
                <AlertCircle size={16} className="text-red-500 mt-0.5 mr-2 flex-shrink-0" />
                <div>
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              </div>
              {!isLoading && (
                <Button variant="outline" size="sm" className="mt-2 text-xs" onClick={() => setError(null)}>
                  <RefreshCcw size={12} className="mr-1" /> Dismiss
                </Button>
              )}
            </div>
          )}

          {statusMessage && (
            <p className="text-sm italic text-gray-500 mt-4">{statusMessage}</p>
          )}

          {debugMode && (
            <div className="mt-4 space-y-2">
              <div className="p-3 bg-gray-50 border border-gray-200 rounded-md">
                <p className="text-xs font-medium mb-1">Debug: Flow Info</p>
                <pre className="text-xs overflow-auto max-h-40">
                  {JSON.stringify(
                    {
                      step,
                      isBusinessAppOnboarding,
                      sessionInfo,
                      hasSdkCode: !!sdkCode,
                      selectedAssistant: selectedAssistant?.name || null,
                      appServiceResponseId: appServiceResponse?.id || null,
                      contactsSynced: !!contactsSyncResponse,
                      historySynced: !!historySyncResponse,
                    },
                    null,
                    2,
                  )}
                </pre>
              </div>
            </div>
          )}
        </CardContent>

        <CardFooter className="justify-end">
          <Button variant="ghost" size="sm" onClick={() => setDebugMode(!debugMode)} className="text-xs text-gray-400">
            {debugMode ? "Hide Debug" : "Debug"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}

export default EmbeddedSignup
