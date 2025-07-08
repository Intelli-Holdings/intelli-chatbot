"use client"

import type React from "react"

import { useEffect, useCallback, useState } from "react"
import { CardDescription, CardTitle, Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ArrowRight, Loader, RefreshCcw, AlertCircle, Info } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import useActiveOrganizationId from "@/hooks/use-organization-id"

declare global {
  interface Window {
    FB?: FacebookSDK
    fbAsyncInit?: () => void
  }
}

// Define type for WhatsApp embedded signup message
interface WhatsAppSignupMessage {
  type: string
  event: "FINISH" | "CANCEL" | "ERROR"
  data: {
    phone_number_id?: string
    waba_id?: string
    current_step?: string
    error_message?: string
  }
}

// Define types for Facebook SDK
interface FacebookSDK {
  init: (params: {
    appId: string
    autoLogAppEvents: boolean
    xfbml: boolean
    version: string
  }) => void
  login: (callback: (response: FacebookLoginResponse) => void, params: FacebookLoginParams) => void
}

interface FacebookLoginResponse {
  authResponse: {
    code: string | null
  } | null
  status?: string
}

interface FacebookLoginParams {
  config_id: string
  response_type: string
  override_default_response_type: boolean
  extras: {
    setup: Record<string, unknown>
    featureType: string
    sessionInfoVersion: string
  }
}

type WhatsAppSessionInfo = {
  phone_number_id: string
  waba_id: string
}

type RegisterResponse = { success: boolean; [key: string]: any }
type PackageResponse = { id: number; [key: string]: any }
type AppServiceResponse = { id: number; [key: string]: any }
type PhoneNumberResponse = {
  data: Array<{
    id: string
    display_phone_number: string
    verified_name: string
    status: string
    quality_rating: string
    search_visibility: string
    platform_type: string
    code_verification_status: string
  }>
}

type Assistant = {
  id: number
  name: string
  prompt: string
  assistant_id: string
  organization: string
  organization_id: string
}

const EmbeddedSignup = () => {
  const organizationId = useActiveOrganizationId()
  const [sessionInfo, setSessionInfo] = useState<WhatsAppSessionInfo | null>(null)
  const [sdkCode, setSdkCode] = useState<string | null>(null)
  const [accessToken, setAccessToken] = useState<string | null>(null)
  const [pin, setPin] = useState<string>("")
  const [registerResponse, setRegisterResponse] = useState<RegisterResponse | null>(null)
  const [packageResponse, setPackageResponse] = useState<PackageResponse | null>(null)
  const [appServiceResponse, setAppServiceResponse] = useState<AppServiceResponse | null>(null)
  const [statusMessage, setStatusMessage] = useState<string>("")
  const [step, setStep] = useState<"initial" | "codeReceived" | "tokenReceived" | "registered" | "fetchingPhone" | "confirmingPhone" | "selectingAssistant" | "creatingAppService" | "creatingPackage" | "complete">("initial")
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [debugMode, setDebugMode] = useState<boolean>(false)
  const [directRegisterResponse, setDirectRegisterResponse] = useState<any>(null)
  const [phoneNumbers, setPhoneNumbers] = useState<PhoneNumberResponse | null>(null)
  const [selectedPhoneNumber, setSelectedPhoneNumber] = useState<string | null>(null)
  const [isCreatingPackage, setIsCreatingPackage] = useState<boolean>(false)
  const [isCreatingAppService, setIsCreatingAppService] = useState<boolean>(false)
  const [packageError, setPackageError] = useState<string | null>(null)
  const [appServiceError, setAppServiceError] = useState<string | null>(null)
  const [isSubscribing, setIsSubscribing] = useState<boolean>(false)
  const [assistants, setAssistants] = useState<Assistant[]>([])
  const [selectedAssistant, setSelectedAssistant] = useState<Assistant | null>(null)
  const [isFetchingAssistants, setIsFetchingAssistants] = useState<boolean>(false)

  // 1) FB SDK initialization
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

  // 2) Handle FB login to get the code
  const handleFBLogin = useCallback((response: FacebookLoginResponse) => {
    if (response.authResponse?.code) {
      setSdkCode(response.authResponse.code)
      setStep("codeReceived")
      setStatusMessage("Code received. Click Continue to exchange for access token.")
    }
    document.getElementById("sdk-response")!.textContent = JSON.stringify(response, null, 2)
  }, [])

  // 3) Launch FB login to start embedded WhatsApp signup
  const launchWhatsAppSignup = useCallback(() => {
    if (!window.FB) return
    window.FB.login(handleFBLogin, {
      config_id: process.env.NEXT_PUBLIC_FACEBOOK_CONFIG_ID!,
      response_type: "code",
      override_default_response_type: true,
      extras: { setup: {}, featureType: "", sessionInfoVersion: "2" },
    })
  }, [handleFBLogin])

  // 4) Exchange code for access token (user initiated) - Using server-side proxy
  const exchangeCodeForToken = useCallback(async () => {
    if (!sdkCode) return

    setIsLoading(true)
    setError(null)
    setStatusMessage("Exchanging code for access token...")

    try {
      // Call our server-side proxy endpoint instead of Facebook directly
      const response = await fetch("/api/facebook/exchange-token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: sdkCode }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to exchange code")
      }

      console.log("Token response:", data)

      if (data.access_token) {
        setAccessToken(data.access_token)
        setStep("tokenReceived")
        setStatusMessage("Access token acquired. Click Next to continue with WhatsApp registration.")
      } else {
        throw new Error("No access token in response")
      }
    } catch (err) {
      console.error("Error exchanging code:", err)
      setError(err instanceof Error ? err.message : "Error exchanging code")
      setStatusMessage("Error exchanging code. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }, [sdkCode])

  // Subscribe app to WhatsApp Business Account
  const subscribeApp = useCallback(async () => {
    if (!sessionInfo?.waba_id || !accessToken) return

    setIsSubscribing(true)
    setError(null)
    setStatusMessage("Subscribing app to WhatsApp Business Account...")

    try {
      const url = `https://graph.facebook.com/v22.0/${sessionInfo.waba_id}/subscribed_apps`
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ access_token: accessToken }),
      })

      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error?.message || "Failed to subscribe app")
      }

      if (data.success) {
        setStatusMessage("App subscribed successfully. Fetching phone numbers...")
        fetchPhoneNumbers()
      } else {
        throw new Error("Failed to subscribe app")
      }
    } catch (err) {
      console.error("Error subscribing app:", err)
      setError(err instanceof Error ? err.message : "Error subscribing app")
      setStatusMessage("Error subscribing app. Please try again.")
    } finally {
      setIsSubscribing(false)
    }
  }, [sessionInfo, accessToken])

  // Fetch phone numbers from Meta
  const fetchPhoneNumbers = useCallback(async () => {
    if (!sessionInfo?.waba_id || !accessToken) {
      setError("Missing required information")
      return
    }

    setIsLoading(true)
    setError(null)
    setStatusMessage("Fetching phone numbers from Meta...")

    try {
      const url = `https://graph.facebook.com/v22.0/${sessionInfo.waba_id}/phone_numbers?fields=id,cc,country_dial_code,display_phone_number,verified_name,status,quality_rating,search_visibility,platform_type,code_verification_status&access_token=${accessToken}`
      
      console.log("Fetching phone numbers from:", url)
      
      const response = await fetch(url, {
        method: "GET",
        headers: { "Content-Type": "application/json" }
      })

      const data = await response.json()
      console.log("Phone numbers response:", data)
      
      if (!response.ok) {
        throw new Error(data.error?.message || "Failed to fetch phone numbers")
      }

      if (!data.data || data.data.length === 0) {
        throw new Error("No phone numbers found for this WhatsApp Business Account")
      }

      setPhoneNumbers(data)
      setStep("confirmingPhone")
      setStatusMessage("Please confirm your phone number")
    } catch (err) {
      console.error("Error fetching phone numbers:", err)
      setError(err instanceof Error ? err.message : "Error fetching phone numbers")
      setStatusMessage("Error fetching phone numbers. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }, [sessionInfo, accessToken])

  // Fetch assistants
  const fetchAssistants = useCallback(async () => {
    if (!organizationId) return

    setIsFetchingAssistants(true)
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/get/assistants/${organizationId}/`)
      if (!response.ok) {
        throw new Error("Failed to fetch assistants")
      }

      const data: Assistant[] = await response.json()
      setAssistants(data)

      if (data.length === 0) {
        throw new Error("No assistants found. Please create an assistant first.")
      }
    } catch (error) {
      console.error("Error fetching assistants:", error)
      setError(error instanceof Error ? error.message : "Failed to fetch assistants")
      setStatusMessage("Error fetching assistants. Please try again.")
    } finally {
      setIsFetchingAssistants(false)
    }
  }, [organizationId])

  const createAppService = useCallback(async (pkg: PackageResponse) => {
    if (!pkg || !organizationId || !selectedAssistant) return;
  
    setIsCreatingAppService(true);
    setAppServiceError(null);
    setStatusMessage("Creating AppService...");
  
    try {
  
      const sanitizedPhoneNumber = (pkg.phone_number || "").replace(/\+/g, '');
  
      const data = {
        organization_id: organizationId,
        phone_number: sanitizedPhoneNumber,
        assistant_id: selectedAssistant.assistant_id,
      };
      console.log("Creating AppService with data:", data);
  
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/appservice/create-appservice/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
  
      const appsvc = await res.json();
  
      if (!res.ok) {
        console.error("AppService creation error:", appsvc);
        throw new Error(appsvc.error || appsvc.detail || "Failed to create AppService");
      }
  
      setAppServiceResponse(appsvc);
      setStep("complete");
      setStatusMessage("Setup complete! Your WhatsApp business account is ready.");
    } catch (e) {
      console.error("Error creating AppService:", e);
      setAppServiceError(e instanceof Error ? e.message : "Error creating AppService");
      setStatusMessage("Error creating AppService. Please try again.");
    } finally {
      setIsCreatingAppService(false);
    }
  }, [organizationId, selectedAssistant]);

  const createWhatsAppPackage = useCallback(async () => {
    if (!sessionInfo || !selectedPhoneNumber || !accessToken || !organizationId) return
  
    setIsCreatingPackage(true)
    setPackageError(null)
    setStatusMessage("Creating WhatsApp package...")
  
    try {
      // Sanitize phone number by removing '+' character
     const sanitizedPhoneNumber = selectedPhoneNumber.replace(/[\s+]/g, '');
  
      const payload = {
        choice: "whatsapp",
        data: {
          whatsapp_business_account_id: sessionInfo.waba_id,
          phone_number: sanitizedPhoneNumber,
          phone_number_id: sessionInfo.phone_number_id,
          access_token: accessToken,
        },
        organization_id: organizationId,
      };
  
      // Log payload for debugging
      console.log("WhatsApp package payload:", { ...payload, data: { ...payload.data, access_token: "[REDACTED]" } });
  
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/channels/create/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
  
      const pkg = await res.json();
  
      if (!res.ok) {
        console.error("WhatsApp package creation error:", pkg);
        throw new Error(pkg.error || pkg.detail || "Failed to create WhatsApp package");
      }
  
      setPackageResponse(pkg);
      setStatusMessage("Package created. Please select an assistant.");
      setStep("selectingAssistant");
      fetchAssistants();
    } catch (e) {
      console.error("Error creating package:", e);
      setPackageError(e instanceof Error ? e.message : "Error creating package");
      setStatusMessage("Error creating package. Please try again.");
    } finally {
      setIsCreatingPackage(false);
    }
  }, [sessionInfo, selectedPhoneNumber, accessToken, organizationId, fetchAssistants]);

  const handleAssistantConfirm = useCallback(() => {
    if (!selectedAssistant || !packageResponse) return;
    setStep("creatingAppService");
    createAppService(packageResponse);
  }, [selectedAssistant, packageResponse, createAppService]);

  // Handle phone number confirmation
  const handlePhoneNumberConfirm = useCallback(() => {
    if (!selectedPhoneNumber) return;
    setStep("creatingPackage");
    createWhatsAppPackage();
  }, [selectedPhoneNumber, createWhatsAppPackage]);

  // 5) Register phone with 2FA PIN - Direct implementation
  const directRegisterPhone = useCallback(async () => {
    if (!sessionInfo || !accessToken || !pin) {
      setError("Missing required information. Please ensure you have entered your PIN and have a valid token.")
      return
    }

    setIsLoading(true)
    setError(null)
    setStatusMessage("Registering phone with PIN...")

    try {
      const response = await fetch("/api/facebook/direct-register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone_number_id: sessionInfo.phone_number_id,
          pin,
          access_token: accessToken,
        }),
      })

      const data = await response.json()
      setDirectRegisterResponse(data)
      console.log("Direct registration response:", data)

      if (data.success) {
        setRegisterResponse(data)
        setStep("registered")
        setStatusMessage("Phone registered successfully!")
      } else if (data.error) {
        throw new Error(`Registration failed: ${data.error.message || JSON.stringify(data)}`)
      } else {
        throw new Error("Registration failed with unknown error")
      }
    } catch (err) {
      console.error("Error in direct registration:", err)
      setError(err instanceof Error ? err.message : "Error registering phone")
      setStatusMessage("Error registering phone. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }, [sessionInfo, accessToken, pin])

  // Listen for WA signup messages
  useEffect(() => {
    initializeFacebookSDK()
    const handleMessage = (event: MessageEvent) => {
      if (!["https://www.facebook.com", "https://web.facebook.com"].includes(event.origin)) return
      try {
        const data = JSON.parse(event.data)
        if (data.type === "WA_EMBEDDED_SIGNUP" && data.event === "FINISH") {
          setSessionInfo({ phone_number_id: data.data.phone_number_id, waba_id: data.data.waba_id })
          setStatusMessage("WhatsApp session finished. Please enter your PIN when ready.")
        }
        document.getElementById("session-info-response")!.textContent = JSON.stringify(data, null, 2)
      } catch {}
    }
    window.addEventListener("message", handleMessage)
    return () => window.removeEventListener("message", handleMessage)
  }, [initializeFacebookSDK])

  // Helper to format phone number
  const phoneNumberCleaner = (info: WhatsAppSessionInfo) => info.phone_number_id

  // Toggle debug mode
  const toggleDebugMode = () => setDebugMode(!debugMode)

  // Render different UI based on current step
  const renderStepContent = () => {
    switch (step) {
      case "initial":
        return (
          <div className="flex flex-col items-center space-y-4">
            <Button onClick={launchWhatsAppSignup} className="bg-[#1877f2] hover:bg-[#166fe5]">
              Login with Facebook
            </Button>
          </div>
        ); // Ensure this case has a proper return statement

      case "codeReceived":
        return (
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
        )

      case "tokenReceived":
        return (
          <div className="flex flex-col space-y-4">
            {sessionInfo ? (
              <div className="p-4 bg-gray-50 rounded-md">
                <p className="font-medium">WhatsApp Session Info</p>
                <p className="text-sm text-gray-500">Phone Number ID: {sessionInfo.phone_number_id}</p>
                <p className="text-sm text-gray-500">WABA ID: {sessionInfo.waba_id}</p>
              </div>
            ) : (
              <div className="p-4 bg-yellow-50 rounded-md">
                <p className="text-sm text-yellow-600">
                  Waiting for WhatsApp session info. Please ensure you&apos;ve completed the Facebook login process.
                </p>
              </div>
            )}

            <div className="p-4 bg-gray-50 rounded-md">
              <div className="flex items-center justify-between">
                <p className="font-medium">User Access Token</p>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info size={16} className="text-gray-400" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="w-80 text-xs">
                        This token will be used to register your phone number and manage your WhatsApp Business account.
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <p className="text-sm text-gray-500 truncate">{accessToken}</p>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium">Enter 2FA PIN:</p>
              <Input
                type="text"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                placeholder="Enter 6-digit PIN"
                maxLength={6}
              />
            </div>

            <CardFooter className="flex justify-between pt-0">
              <Button variant="outline" size="sm" onClick={toggleDebugMode} className="text-xs">
                {debugMode ? "Hide Debug" : "Show Debug"}
              </Button>

              <Button
                onClick={directRegisterPhone}
                disabled={isLoading || !pin || pin.length !== 6 || !sessionInfo || !accessToken}
                className="flex items-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader size={16} className="animate-spin" /> Processing...
                  </>
                ) : (
                  <>
                    Register <ArrowRight size={16} />
                  </>
                )}
              </Button>
            </CardFooter>
          </div>
        )

      case "registered":
        return (
          <div className="flex flex-col space-y-4">
            <div className="p-4 bg-green-50 rounded-md">
              <p className="font-medium text-green-700">Registration Successful</p>
              <p className="text-sm text-green-600">Registration complete. Let&apos;s subscribe your app and fetch your phone numbers.</p>
            </div>
            <Button 
              onClick={subscribeApp} 
              disabled={isLoading || isSubscribing} 
              className="flex items-center gap-2"
            >
              {isLoading || isSubscribing ? (
                <>
                  <Loader size={16} className="animate-spin" /> 
                  {isSubscribing ? "Subscribing App..." : "Processing..."}
                </>
              ) : (
                <>
                  Continue <ArrowRight size={16} />
                </>
              )}
            </Button>
            {error && (
              <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-600">{error}</p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-2 text-xs" 
                  onClick={() => {
                    setError(null)
                    subscribeApp()
                  }}
                >
                  <RefreshCcw size={12} className="mr-1" /> Try Again
                </Button>
              </div>
            )}
          </div>
        )

      case "confirmingPhone":
        return (
          <div className="flex flex-col space-y-4">
            <div className="p-4 bg-gray-50 rounded-md">
              <p className="font-medium">Select Your Phone Number</p>
              <div className="mt-2 space-y-2">
                {phoneNumbers?.data.map((phone) => (
                  <div
                    key={phone.id}
                    className={`p-3 border rounded-md cursor-pointer ${
                      selectedPhoneNumber === phone.display_phone_number
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 hover:border-blue-300"
                    }`}
                    onClick={() => setSelectedPhoneNumber(phone.display_phone_number)}
                  >
                    {phone.display_phone_number}
                  </div>
                ))}
              </div>
            </div>
            <CardFooter className="flex justify-end pt-0">
              <Button onClick={handlePhoneNumberConfirm} disabled={isLoading || !selectedPhoneNumber} className="flex items-center gap-2">
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
        )

      case "selectingAssistant":
        return (
          <div className="flex flex-col space-y-4">
            <div className="p-4 bg-gray-50 rounded-md">
              <p className="font-medium">Select Your Assistant</p>
              <p className="text-sm text-gray-500 mb-4">Choose an assistant to create your WhatsApp package</p>
              <div className="mt-2 space-y-2">
                {isFetchingAssistants ? (
                  <div className="flex items-center justify-center p-4">
                    <Loader size={16} className="animate-spin" />
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
            <CardFooter className="flex justify-end pt-0">
              <Button 
                onClick={handleAssistantConfirm} 
                disabled={isLoading || !selectedAssistant || isFetchingAssistants} 
                className="flex items-center gap-2"
              >
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
        )

      case "creatingAppService":
        return (
          <div className="flex flex-col space-y-4">
            <div className="p-4 bg-gray-50 rounded-md">
              <p className="font-medium">Create AppService</p>
              {packageResponse && (
                <p className="text-sm text-gray-500">Selected Phone Number: {selectedPhoneNumber}</p>
              )}
            </div>
            <CardFooter className="flex justify-end pt-0">
              <Button 
                onClick={() => {
                  setStep("creatingPackage")
                  createWhatsAppPackage()
                }}
                disabled={isLoading || !selectedPhoneNumber || !packageResponse} 
                className="flex items-center gap-2"
              >
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
        )

      case "creatingPackage":
        return (
          <div className="flex flex-col space-y-4">
            <div className="p-4 bg-gray-50 rounded-md">
              <p className="font-medium">Create WhatsApp Package</p>
              {selectedPhoneNumber && (
                <p className="text-sm text-gray-500">Selected Phone Number: {selectedPhoneNumber}</p>
              )}
            </div>
            <CardFooter className="flex justify-end pt-0">
              <Button onClick={createWhatsAppPackage} disabled={isLoading || !selectedPhoneNumber} className="flex items-center gap-2">
                {isLoading ? (
                  <>
                    <Loader size={16} className="animate-spin" /> Processing...
                  </>
                ) : (
                  <>
                    Create WhatsApp Package <ArrowRight size={16} />
                  </>
                )}
              </Button>
            </CardFooter>
          </div>
        )

      case "complete":
        return (
          <div className="flex flex-col space-y-4">
            <div className="p-4 bg-green-50 rounded-md">
              <p className="font-medium text-green-700">Setup Complete</p>
              <p className="text-sm text-green-600">Your WhatsApp business account is ready.</p>
            </div>
            <Button 
              onClick={() => {
                setSessionInfo(null)
                setSdkCode(null)
                setAccessToken(null)
                setPin("")
                setRegisterResponse(null)
                setPackageResponse(null)
                setAppServiceResponse(null)
                setStatusMessage("")
                setStep("initial")
              }}
              className="flex items-center gap-2"
            >
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
        <CardDescription className="mt-1">Connect your WhatsApp Business account</CardDescription>
      </div>

      <CardContent>
        {renderStepContent()}

        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <div className="flex items-start">
              <AlertCircle size={16} className="text-red-500 mt-0.5 mr-2 flex-shrink-0" />
              <div>
                <p className="text-sm text-red-600">{error}</p>
                {error.includes("Missing Permission") && (
                  <p className="text-xs text-red-500 mt-1">
                    This error typically means your token doesn&apos;t have the necessary permissions for WhatsApp Business
                    API operations. Try using a System Token instead.
                  </p>
                )}
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

        {debugMode && directRegisterResponse && (
          <div className="mt-4 p-3 bg-gray-50 border border-gray-200 rounded-md">
            <p className="text-xs font-medium mb-1">Debug: Direct Registration Response</p>
            <pre className="text-xs overflow-auto max-h-40">{JSON.stringify(directRegisterResponse, null, 2)}</pre>
          </div>
        )}
      </CardContent>

      <div className="hidden">
        <pre id="session-info-response" />
        <pre id="sdk-response" />
      </div>
    </Card>
     </div>
  )
}

export default EmbeddedSignup