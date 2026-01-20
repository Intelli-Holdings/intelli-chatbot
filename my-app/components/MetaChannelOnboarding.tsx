"use client"

import { useCallback, useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { AlertCircle, ArrowRight, Loader, RefreshCcw } from "lucide-react"
import useActiveOrganizationId from "@/hooks/use-organization-id"

type MetaChannel = "facebook" | "instagram"

type MetaPage = {
  id: string
  name: string
  access_token?: string
  instagram_business_account?: { id: string }
}

type FacebookLoginResponse = {
  authResponse: {
    code: string | null
  } | null
  status?: string
}

interface MetaChannelOnboardingProps {
  channel: MetaChannel
}

const API_VERSION = "v21.0"

const scopeByChannel: Record<MetaChannel, string> = {
  facebook:
    "pages_messaging,pages_show_list,manage_pages,instagram_business_basic,instagram_business_manage_messages,instagram_business_manage_comments,instagram_business_content_publish,instagram_business_manage_insights",
  instagram:
    "instagram_business_basic,instagram_business_manage_messages,instagram_business_manage_comments,instagram_business_content_publish,instagram_business_manage_insights,pages_show_list,manage_pages",
}

const labelByChannel: Record<MetaChannel, { title: string; description: string }> = {
  facebook: {
    title: "Facebook Messenger Setup",
    description: "Connect your Facebook Page to start receiving Messenger conversations.",
  },
  instagram: {
    title: "Instagram Messaging Setup",
    description: "Connect your Instagram Professional account to handle DMs.",
  },
}

const MetaChannelOnboarding = ({ channel }: MetaChannelOnboardingProps) => {
  const organizationId = useActiveOrganizationId()
  const [sdkCode, setSdkCode] = useState<string | null>(null)
  const [accessToken, setAccessToken] = useState<string | null>(null)
  const [pages, setPages] = useState<MetaPage[]>([])
  const [selectedPage, setSelectedPage] = useState<MetaPage | null>(null)
  const [step, setStep] = useState<"initial" | "codeReceived" | "tokenReceived" | "selectingPage" | "creatingPackage" | "complete">("initial")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [statusMessage, setStatusMessage] = useState<string>("")
  const [manualPageId, setManualPageId] = useState<string>("")
  const [manualPageToken, setManualPageToken] = useState<string>("")
  const [manualInstagramId, setManualInstagramId] = useState<string>("")

  const initializeFacebookSDK = useCallback(() => {
    if (window.FB) return
    window.fbAsyncInit = () => {
      window.FB?.init({
        appId: process.env.NEXT_PUBLIC_FACEBOOK_APP_ID!,
        autoLogAppEvents: true,
        xfbml: true,
        version: "v22.0",
      })
    }
    const script = document.createElement("script")
    script.src = "https://connect.facebook.net/en_US/sdk.js"
    script.async = true
    script.defer = true
    script.crossOrigin = "anonymous"
    document.body.appendChild(script)
  }, [])

  useEffect(() => {
    initializeFacebookSDK()
  }, [initializeFacebookSDK])

  const handleFBLogin = useCallback((response: FacebookLoginResponse) => {
    if (response.authResponse?.code) {
      setSdkCode(response.authResponse.code)
      setStep("codeReceived")
      setStatusMessage("Code received. Click Continue to exchange for access token.")
    }
  }, [])

  const launchLogin = useCallback(() => {
    if (!window.FB) return
    window.FB.login(handleFBLogin, {
      response_type: "code",
      override_default_response_type: true,
      scope: scopeByChannel[channel],
    })
  }, [channel, handleFBLogin])

  const exchangeCodeForToken = useCallback(async () => {
    if (!sdkCode) return

    setIsLoading(true)
    setError(null)
    setStatusMessage("Exchanging code for access token...")

    try {
      const response = await fetch("/api/facebook/exchange-token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: sdkCode }),
      })

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || "Failed to exchange code")
      }

      if (data.access_token) {
        setAccessToken(data.access_token)
        setStep("tokenReceived")
        setStatusMessage("Access token acquired. Fetch your Pages to continue.")
      } else {
        throw new Error("No access token in response")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error exchanging code")
      setStatusMessage("Error exchanging code. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }, [sdkCode])

  const fetchPages = useCallback(async () => {
    if (!accessToken) return

    setIsLoading(true)
    setError(null)
    setStatusMessage("Fetching Pages from Meta...")

    try {
      const url = `https://graph.facebook.com/${API_VERSION}/me/accounts?fields=id,name,access_token,instagram_business_account&access_token=${accessToken}`
      const response = await fetch(url, { method: "GET" })
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error?.message || "Failed to fetch Pages")
      }

      const fetchedPages = Array.isArray(data?.data) ? data.data : []
      if (fetchedPages.length === 0) {
        throw new Error("No Facebook Pages found for this account")
      }

      setPages(fetchedPages)
      setStep("selectingPage")
      setStatusMessage("Select a Page to complete setup.")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error fetching Pages")
      setStatusMessage("Error fetching Pages. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }, [accessToken])

  const createChannelPackage = useCallback(async () => {
    if (!organizationId) {
      setError("Organization is required to continue.")
      return
    }

    const pageId = selectedPage?.id || manualPageId
    const pageAccessToken = selectedPage?.access_token || manualPageToken
    const instagramBusinessAccountId =
      channel === "instagram" ? selectedPage?.instagram_business_account?.id || manualInstagramId : undefined

    if (!pageId || !pageAccessToken) {
      setError("Page ID and Page Access Token are required.")
      return
    }

    if (channel === "instagram" && !instagramBusinessAccountId) {
      setError("Instagram Business Account ID is required for Instagram setup.")
      return
    }

    setIsLoading(true)
    setError(null)
    setStatusMessage("Creating channel package...")
    setStep("creatingPackage")

    try {
      const payload = {
        choice: channel === "facebook" ? "facebook_messenger" : "instagram",
        data: {
          page_id: pageId,
          page_access_token: pageAccessToken,
          user_access_token: accessToken,
          instagram_business_account_id: instagramBusinessAccountId,
        },
        organization_id: organizationId,
      }

      const response = await fetch("/api/channels/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || data.detail || "Failed to create channel package")
      }

      setStatusMessage("Setup complete! Your channel is ready.")
      setStep("complete")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error creating channel package")
      setStatusMessage("Error creating channel package. Please try again.")
      setStep("selectingPage")
    } finally {
      setIsLoading(false)
    }
  }, [
    accessToken,
    channel,
    manualInstagramId,
    manualPageId,
    manualPageToken,
    organizationId,
    selectedPage,
  ])

  const renderPageSelector = () => (
    <div className="space-y-3">
      {pages.map((page) => (
        <div
          key={page.id}
          className={`p-3 border rounded-md cursor-pointer ${
            selectedPage?.id === page.id ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:border-blue-300"
          }`}
          onClick={() => setSelectedPage(page)}
        >
          <p className="text-sm font-medium text-gray-900">{page.name}</p>
          <p className="text-xs text-gray-500">Page ID: {page.id}</p>
          {channel === "instagram" && !page.instagram_business_account?.id && (
            <p className="text-xs text-orange-600">No Instagram Business Account linked.</p>
          )}
        </div>
      ))}
    </div>
  )

  const renderManualFallback = () => (
    <div className="space-y-3">
      <Input
        name="pageId"
        placeholder="Facebook Page ID"
        value={manualPageId}
        onChange={(e) => setManualPageId(e.target.value)}
      />
      <Input
        name="pageAccessToken"
        placeholder="Page Access Token"
        value={manualPageToken}
        onChange={(e) => setManualPageToken(e.target.value)}
      />
      {channel === "instagram" && (
        <Input
          name="instagramBusinessAccountId"
          placeholder="Instagram Business Account ID"
          value={manualInstagramId}
          onChange={(e) => setManualInstagramId(e.target.value)}
        />
      )}
    </div>
  )

  const { title, description } = labelByChannel[channel]

  return (
    <div className="bg-gradient-to-r from-teal-100 to-blue-100 p-4 rounded-lg shadow-sm w-full h-full flex items-center justify-center">
      <Card className="w-full max-w-lg mx-auto">
        <div className="p-6">
          <CardTitle>{title}</CardTitle>
          <CardDescription className="mt-1">{description}</CardDescription>
        </div>

        <CardContent>
          {step === "initial" && (
            <div className="flex flex-col items-center space-y-4">
              <Button onClick={launchLogin} className="bg-[#1877f2] hover:bg-[#166fe5]">
                Login with Facebook
              </Button>
            </div>
          )}

          {step === "codeReceived" && (
            <div className="flex flex-col space-y-4">
              <div className="p-4 bg-gray-50 rounded-md">
                <p className="font-medium">SDK Code Received</p>
                <p className="text-sm text-gray-500 truncate">{sdkCode}</p>
              </div>
              <CardFooter className="flex justify-end pt-0">
                <Button onClick={exchangeCodeForToken} disabled={isLoading} className="flex items-center gap-2">
                  {isLoading ? (
                    <>
                      <Loader size={16} className="animate-spin" /> Processing...
                    </>
                  ) : (
                    <>
                      Continue <ArrowRight size={16} />
                    </>
                  )}
                </Button>
              </CardFooter>
            </div>
          )}

          {step === "tokenReceived" && (
            <div className="flex flex-col space-y-4">
              <div className="p-4 bg-gray-50 rounded-md">
                <p className="font-medium">User Access Token</p>
                <p className="text-sm text-gray-500 truncate">{accessToken}</p>
              </div>
              <CardFooter className="flex justify-end pt-0">
                <Button onClick={fetchPages} disabled={isLoading} className="flex items-center gap-2">
                  {isLoading ? (
                    <>
                      <Loader size={16} className="animate-spin" /> Processing...
                    </>
                  ) : (
                    <>
                      Fetch Pages <ArrowRight size={16} />
                    </>
                  )}
                </Button>
              </CardFooter>
            </div>
          )}

          {step === "selectingPage" && (
            <div className="flex flex-col space-y-4">
              {pages.length > 0 ? renderPageSelector() : renderManualFallback()}
              {pages.length > 0 && (
                <div className="border-t pt-4">
                  <p className="text-xs text-gray-500 mb-2">Or enter details manually if needed.</p>
                  {renderManualFallback()}
                </div>
              )}
              <CardFooter className="flex justify-end pt-0">
                <Button onClick={createChannelPackage} disabled={isLoading} className="flex items-center gap-2">
                  {isLoading ? (
                    <>
                      <Loader size={16} className="animate-spin" /> Processing...
                    </>
                  ) : (
                    <>
                      Create Channel <ArrowRight size={16} />
                    </>
                  )}
                </Button>
              </CardFooter>
            </div>
          )}

          {step === "creatingPackage" && (
            <div className="flex items-center justify-center p-4">
              <Loader size={24} className="animate-spin" />
              <span className="ml-2">Creating channel package...</span>
            </div>
          )}

          {step === "complete" && (
            <div className="flex flex-col space-y-4">
              <div className="p-4 bg-green-50 rounded-md">
                <p className="font-medium text-green-700">Setup Complete</p>
                <p className="text-sm text-green-600">
                  {channel === "instagram"
                    ? "Your Instagram messaging channel is ready."
                    : "Your Facebook Messenger channel is ready."}
                </p>
              </div>
              <Button
                onClick={() => {
                  setSdkCode(null)
                  setAccessToken(null)
                  setPages([])
                  setSelectedPage(null)
                  setManualPageId("")
                  setManualPageToken("")
                  setManualInstagramId("")
                  setStatusMessage("")
                  setError(null)
                  setStep("initial")
                }}
                className="flex items-center gap-2"
              >
                <ArrowRight size={16} />
                Start Again
              </Button>
            </div>
          )}

          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <div className="flex items-start">
                <AlertCircle size={16} className="text-red-500 mt-0.5 mr-2 flex-shrink-0" />
                <div>
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              </div>
              {isLoading ? null : (
                <Button variant="outline" size="sm" className="mt-2 text-xs" onClick={() => setError(null)}>
                  <RefreshCcw size={12} className="mr-1" /> Try Again
                </Button>
              )}
            </div>
          )}

          {statusMessage && <p className="text-sm italic text-gray-500 mt-4">{statusMessage}</p>}
        </CardContent>
      </Card>
    </div>
  )
}

export default MetaChannelOnboarding
