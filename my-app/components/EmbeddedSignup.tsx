"use client"

import type React from "react"

import { useEffect, useCallback, useState } from "react"
import { useQueryClient } from "react-query"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
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

type SyncTracker = {
  id: number
  sync_type: 'contacts' | 'history'
  status: 'pending' | 'in_progress' | 'completed' | 'failed'
  items_synced: number
  request_id: string | null
  error_message: string | null
  started_at: string
  completed_at: string | null
  updated_at: string
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
  const [syncTrackers, setSyncTrackers] = useState<SyncTracker[]>([])
  const [isSyncing, setIsSyncing] = useState(false)
  const [syncError, setSyncError] = useState<string | null>(null)


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

  // Auto-advance: once we have both sdkCode + sessionInfo, fetch assistants
  useEffect(() => {
    if (step === "sdkComplete" && sdkCode && sessionInfo) {
      fetchAssistants()
    }
  }, [step, sdkCode, sessionInfo, fetchAssistants])

  // -------------------------------------------------------------------------
  // 6) Coexistence sync: initiate via backend + poll for progress
  // -------------------------------------------------------------------------
  const initiateSync = useCallback(async (appserviceId: number) => {
    setIsSyncing(true)
    setSyncError(null)
    setStep("syncingContacts")
    setStatusMessage("Starting data synchronization...")

    try {
      const response = await fetch(`/api/appservice/${appserviceId}/coexistence/sync`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to initiate sync")
      }

      setSyncTrackers(data)
      logger.info("Coexistence sync initiated:", { trackers: data })
    } catch (err) {
      logger.error("Error initiating sync:", { error: err instanceof Error ? err.message : String(err) })
      setSyncError(err instanceof Error ? err.message : "Error initiating sync")
      setIsSyncing(false)
    }
  }, [])

  // Poll sync status while syncing
  useEffect(() => {
    if (!isSyncing || !appServiceResponse?.id || syncTrackers.length === 0) return

    const pollInterval = setInterval(async () => {
      try {
        const response = await fetch(`/api/appservice/${appServiceResponse.id}/coexistence/sync/status`)
        if (!response.ok) return

        const data: SyncTracker[] = await response.json()
        setSyncTrackers(data)

        const contactsTracker = data.find(t => t.sync_type === 'contacts')
        const historyTracker = data.find(t => t.sync_type === 'history')

        // Update step based on progress
        if (contactsTracker?.status === 'in_progress' || contactsTracker?.status === 'pending') {
          setStep("syncingContacts")
          const count = contactsTracker.items_synced || 0
          setStatusMessage(count > 0
            ? `Synchronizing contacts... (${count} synced)`
            : "Synchronizing contacts...")
        } else if (historyTracker?.status === 'in_progress' || historyTracker?.status === 'pending') {
          setStep("syncingHistory")
          const count = historyTracker.items_synced || 0
          setStatusMessage(count > 0
            ? `Synchronizing message history... (${count} messages)`
            : "Synchronizing message history...")
        }

        // Check if all done
        const allDone = data.every(t => t.status === 'completed' || t.status === 'failed')
        if (allDone) {
          clearInterval(pollInterval)
          setIsSyncing(false)
          setStep("complete")
          setStatusMessage("Setup complete! Your WhatsApp Business app is connected and synchronized.")
        }
      } catch (err) {
        logger.error("Error polling sync status:", { error: err instanceof Error ? err.message : String(err) })
      }
    }, 3000)

    return () => clearInterval(pollInterval)
  }, [isSyncing, appServiceResponse?.id, syncTrackers.length])

  // -------------------------------------------------------------------------
  // 7) Connect WhatsApp -- single backend call handles everything
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

      if (isBusinessAppOnboarding && sessionInfo) {
        initiateSync(data.id)
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
  }, [sdkCode, organizationId, selectedAssistant, isBusinessAppOnboarding, sessionInfo, initiateSync])

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
    setSyncTrackers([])
    setIsSyncing(false)
    setSyncError(null)
  }, [])

  // -------------------------------------------------------------------------
  // Render step content
  // -------------------------------------------------------------------------
  const renderStepContent = () => {
    switch (step) {
      case "initial":
        return (
          <div className="flex flex-col items-center justify-center space-y-4 min-h-[200px]">
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
            {isBusinessAppOnboarding && (
              <div className="p-2.5 bg-blue-50 rounded-md text-center">
                <p className="text-sm text-blue-600">
                  Coexistence mode — your existing WhatsApp Business app will keep working alongside our platform.
                </p>
              </div>
            )}
            <div className="text-center">
              <p className="font-medium mb-1">Select an assistant</p>
              <p className="text-xs text-muted-foreground">This assistant will handle conversations on your WhatsApp number.</p>
            </div>
            <div className="max-h-64 overflow-y-auto px-1">
              {assistants.length === 0 ? (
                <div className="p-6 text-center text-muted-foreground text-sm">
                  No assistants found. Please create an assistant first.
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  {assistants.map((assistant) => (
                    <div
                      key={assistant.id}
                      className={`px-3 py-2.5 border rounded-lg cursor-pointer transition-all text-sm text-center truncate ${
                        selectedAssistant?.id === assistant.id
                          ? "border-blue-500 bg-blue-50 font-medium ring-1 ring-blue-500"
                          : "border-gray-200 hover:border-blue-300 hover:bg-gray-50"
                      }`}
                      onClick={() => setSelectedAssistant(assistant)}
                      title={assistant.name}
                    >
                      {assistant.name}
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="flex justify-center pt-2">
              <Button
                onClick={connectWhatsApp}
                disabled={isLoading || !selectedAssistant}
                className="flex items-center gap-2 px-6"
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
            </div>
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
      case "syncingHistory": {
        const contactsTracker = syncTrackers.find(t => t.sync_type === 'contacts')
        const historyTracker = syncTrackers.find(t => t.sync_type === 'history')
        const isOnContacts = step === "syncingContacts"

        return (
          <div className="flex flex-col space-y-4">
            {/* Contacts sync progress */}
            <div className={`p-4 rounded-md ${isOnContacts ? 'bg-blue-50' : 'bg-green-50'}`}>
              <div className="flex items-center justify-between">
                <p className={`font-medium ${isOnContacts ? 'text-blue-700' : 'text-green-700'}`}>
                  {isOnContacts ? 'Synchronizing Contacts' : 'Contacts Synchronized'}
                </p>
                {contactsTracker && contactsTracker.items_synced > 0 && (
                  <span className="text-sm font-mono text-gray-600">
                    {contactsTracker.items_synced} synced
                  </span>
                )}
              </div>
              {isOnContacts && (
                <p className="text-sm text-blue-600 mt-1">
                  Importing your WhatsApp Business app contacts...
                </p>
              )}
              {!isOnContacts && contactsTracker && (
                <div className="flex items-center space-x-1 mt-1">
                  <CheckCircle size={14} className="text-green-500" />
                  <span className="text-sm text-green-600">
                    {contactsTracker.items_synced} contacts synced
                  </span>
                </div>
              )}
            </div>

            {/* History sync progress */}
            {!isOnContacts && (
              <div className="p-4 bg-blue-50 rounded-md">
                <div className="flex items-center justify-between">
                  <p className="font-medium text-blue-700">Synchronizing Message History</p>
                  {historyTracker && historyTracker.items_synced > 0 && (
                    <span className="text-sm font-mono text-gray-600">
                      {historyTracker.items_synced} messages
                    </span>
                  )}
                </div>
                <p className="text-sm text-blue-600 mt-1">
                  Importing your WhatsApp Business app message history...
                </p>
              </div>
            )}

            {/* Spinner */}
            <div className="flex items-center justify-center p-4">
              <Loader size={24} className="animate-spin" />
              <span className="ml-2">{statusMessage}</span>
            </div>

            {/* Error */}
            {syncError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-600">{syncError}</p>
                {appServiceResponse && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-2 text-xs"
                    onClick={() => {
                      setSyncError(null)
                      initiateSync(appServiceResponse.id)
                    }}
                  >
                    <RefreshCcw size={12} className="mr-1" /> Retry Sync
                  </Button>
                )}
              </div>
            )}
          </div>
        )
      }

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
                  {syncTrackers.map((tracker) => (
                    <div key={tracker.id} className="flex items-center space-x-2">
                      {tracker.status === 'completed' ? (
                        <CheckCircle size={16} className="text-green-500" />
                      ) : tracker.status === 'failed' ? (
                        <AlertCircle size={16} className="text-red-500" />
                      ) : (
                        <Loader size={16} className="animate-spin text-blue-500" />
                      )}
                      <span className={`text-sm ${tracker.status === 'failed' ? 'text-red-600' : 'text-green-600'}`}>
                        {tracker.sync_type === 'contacts' ? 'Contacts' : 'Message history'} sync
                        {tracker.status === 'completed' && ` completed (${tracker.items_synced} ${tracker.sync_type === 'contacts' ? 'contacts' : 'messages'})`}
                        {tracker.status === 'failed' && `: ${tracker.error_message || 'failed'}`}
                        {(tracker.status === 'in_progress' || tracker.status === 'pending') && ' in progress...'}
                      </span>
                    </div>
                  ))}
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
    <Card className="w-full shadow-sm flex flex-col h-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold">WhatsApp Business Setup</CardTitle>
        <CardDescription className="text-xs">
          Connect your WhatsApp Business account
          {isBusinessAppOnboarding && (
            <span className="block mt-1 text-blue-600 font-medium">
              Business App Integration Mode (Coexistence)
            </span>
          )}
        </CardDescription>
      </CardHeader>

      <CardContent className="flex-1">
        {renderStepContent()}

        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <div className="flex items-start">
              <AlertCircle size={16} className="text-red-500 mt-0.5 mr-2 flex-shrink-0" />
              <p className="text-sm text-red-600">{error}</p>
            </div>
            {!isLoading && (
              <Button variant="outline" size="sm" className="mt-2 text-xs" onClick={() => setError(null)}>
                <RefreshCcw size={12} className="mr-1" /> Dismiss
              </Button>
            )}
          </div>
        )}

        {statusMessage && (
          <p className="text-xs italic text-muted-foreground mt-3">{statusMessage}</p>
        )}

      </CardContent>
    </Card>
  )
}

export default EmbeddedSignup
