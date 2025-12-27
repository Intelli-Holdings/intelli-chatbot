"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { useOrganizationList } from "@clerk/nextjs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Loader, PlusCircle } from 'lucide-react'
import { toast } from "sonner"
import Image from "next/image"
import useActiveOrganizationId from "@/hooks/use-organization-id"
import WidgetPreview from "@/components/WidgetPreview"
import { WidgetCommunication } from "@/components/widget-communication"
import { DeploymentDialog } from "@/components/deployment-dialog"
import Widgets from "@/components/Widgets"

interface Assistant {
  id: number
  name: string
  prompt: string
  assistant_id: string
  organization: string
  organization_id: string
  type: string
  created_at: string
  updated_at: string
}

export default function UnifiedWidgets() {
  const [activeTab, setActiveTab] = useState<string>("create")
  const [loading, setLoading] = useState<boolean>(false)
  const [isLoadingAssistants, setIsLoadingAssistants] = useState<boolean>(true)
  const [assistants, setAssistants] = useState<Assistant[]>([])
  const [selectedAssistantId, setSelectedAssistantId] = useState<string>("")
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [showDeploymentDialog, setShowDeploymentDialog] = useState<boolean>(false)
  const [createdWidgetKey, setCreatedWidgetKey] = useState<string>("")
  const [websiteUrl, setWebsiteUrl] = useState<string>("https://yourwebsite.com")
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Use the hook to auto-select organization
  const organizationId = useActiveOrganizationId()
  const [selectedOrganizationId, setSelectedOrganizationId] = useState<string>("")

  const { userMemberships, isLoaded } = useOrganizationList({
    userMemberships: { infinite: true },
  })

  // Widget creation form fields
  const [widgetName, setWidgetName] = useState<string>("Your widget name")
  const [avatarUrl, setAvatarUrl] = useState<string>("/Avatar.png")
  const [brandColor, setBrandColor] = useState<string>("#007fff")
  const [greetingMessage, setGreetingMessage] = useState<string>("Hello! I'm here to help.")
  const [helpText, setHelpText] = useState<string>("Need Help? Chat With US !")
  const [widgetPosition, setWidgetPosition] = useState<string>("bottom-right")
  const [widgetSize, setWidgetSize] = useState<string>("medium")
  const [headerColor, setHeaderColor] = useState<string>("#007fff")
  const [visitorMessageColor, setVisitorMessageColor] = useState<string>("#007fff")
  const [businessMessageColor, setBusinessMessageColor] = useState<string>("#F0F0F0")
  const [buttonText, setButtonText] = useState<string>("Chat with us")
  const [fontFamily, setFontFamily] = useState<string>("Arial, sans-serif")
  const [fontSize, setFontSize] = useState<number>(14)
  const [borderRadius, setBorderRadius] = useState<number>(12)
  const [chatWindowWidth, setChatWindowWidth] = useState<number>(380)
  const [chatWindowHeight, setChatWindowHeight] = useState<number>(600)
  const [enableSound, setEnableSound] = useState<boolean>(true)
  const [showPoweredBy, setShowPoweredBy] = useState<boolean>(true)
  const [animationStyle, setAnimationStyle] = useState<string>("slide")
  const [previewOpen, setPreviewOpen] = useState<boolean>(true)
  const [previewMode, setPreviewMode] = useState<"static" | "live">("static")

  // Auto-select organization when it's loaded
  useEffect(() => {
    if (organizationId) {
      setSelectedOrganizationId(organizationId)
    }
  }, [organizationId])

  // Sync header and visitor message colors with brand color
  useEffect(() => {
    setHeaderColor(brandColor)
    setVisitorMessageColor(brandColor)
  }, [brandColor])

  // Fetch assistants
  const fetchAssistants = useCallback(async () => {
    if (!selectedOrganizationId) return

    setIsLoadingAssistants(true)
    try {
      const response = await fetch(`/api/assistants/${selectedOrganizationId}`)

      if (!response.ok) {
        if (response.status === 404) {
          toast.info("No assistants found. Create one to get started.")
          setAssistants([])
          return
        }
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`)
      }

      const data: Assistant[] = await response.json()

      if (!Array.isArray(data)) {
        throw new Error("Invalid response format: expected array of assistants")
      }

      const validatedAssistants = data.filter((assistant) => {
        const isValid =
          assistant &&
          typeof assistant.id === "number" &&
          typeof assistant.name === "string" &&
          typeof assistant.assistant_id === "string" &&
          typeof assistant.organization === "string" &&
          typeof assistant.prompt === "string"

        if (!isValid) {
          console.warn("[UnifiedWidgets] Invalid assistant object:", assistant)
        }

        return isValid
      })

      setAssistants(validatedAssistants)

      // Auto-select the first assistant if available
      if (validatedAssistants.length > 0 && !selectedAssistantId) {
        setSelectedAssistantId(validatedAssistants[0].assistant_id)
      }

      if (validatedAssistants.length === 0) {
        toast.info("No valid assistants found. Create one to get started.")
      }
    } catch (error) {
      console.error("[UnifiedWidgets] Error fetching assistants:", error)
      toast.error(`Failed to fetch assistants: ${error instanceof Error ? error.message : "Unknown error"}`)
      setAssistants([])
    } finally {
      setIsLoadingAssistants(false)
    }
  }, [selectedOrganizationId, selectedAssistantId])

  useEffect(() => {
    fetchAssistants()
  }, [fetchAssistants])

  const handleAvatarUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file && (file.type === "image/jpeg" || file.type === "image/png")) {
      setAvatarFile(file)
      const reader = new FileReader()
      reader.onload = (e) => {
        setAvatarUrl(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedOrganizationId) {
      toast.error("Organization is required. Please wait for it to load.")
      return
    }

    if (!selectedAssistantId) {
      toast.error("Please select an assistant.")
      return
    }

    if (!widgetName.trim()) {
      toast.error("Widget name is required.")
      return
    }

    if (!websiteUrl.trim()) {
      toast.error("Website URL is required.")
      return
    }

    setLoading(true)

    const formData = new FormData()
    formData.append("organization_id", selectedOrganizationId)
    formData.append("assistant_id", selectedAssistantId)
    formData.append("widget_name", widgetName)
    formData.append("website_url", websiteUrl)
    formData.append("brand_color", brandColor)
    formData.append("greeting_message", greetingMessage)

    // Enhanced styling fields
    formData.append("help_text", helpText)
    formData.append("widget_position", widgetPosition)
    formData.append("widget_size", widgetSize)
    formData.append("header_color", headerColor)
    formData.append("visitor_message_color", visitorMessageColor)
    formData.append("business_message_color", businessMessageColor)
    formData.append("button_text", buttonText)
    formData.append("font_family", fontFamily)
    formData.append("font_size", fontSize.toString())
    formData.append("border_radius", borderRadius.toString())
    formData.append("chat_window_width", chatWindowWidth.toString())
    formData.append("chat_window_height", chatWindowHeight.toString())
    formData.append("enable_sound", enableSound.toString())
    formData.append("show_powered_by", showPoweredBy.toString())
    formData.append("animation_style", animationStyle)

    if (avatarFile) {
      formData.append("avatar_url", avatarFile)
    }

    try {
      const response = await fetch("/api/widgets", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      setCreatedWidgetKey(data.widget_key)
      setWebsiteUrl(websiteUrl)
      toast.success("Website Widget created successfully! Test it out and deploy when ready.")

      // Switch to live preview mode
      setPreviewMode("live")
    } catch (error) {
      console.error("[UnifiedWidgets] Error submitting widget:", error)
      toast.error(`Failed to create widget: ${error instanceof Error ? error.message : "Unknown error"}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="create" className="flex items-center gap-2">
            <PlusCircle className="h-4 w-4" />
            Create Widget
          </TabsTrigger>
          <TabsTrigger value="manage">My Widgets</TabsTrigger>
        </TabsList>

        <TabsContent value="create" className="mt-6">
          <div className="flex flex-col md:flex-row gap-4 p-2 border border-dotted border-2 rounded-lg">
            {/* Left Side: Form */}
            <div className="md:w-1/2 bg-white shadow-md p-6 rounded-lg border border-gray-200 rounded-xl">
              <form onSubmit={handleSubmit} className="space-y-4">
                <h2 className="text-xl font-semibold mb-4">Create a Website Widget</h2>

                {!selectedOrganizationId && (
                  <div className="bg-blue-50 border border-blue-200 rounded-md p-3 mb-4">
                    <div className="flex items-center space-x-2">
                      <Loader className="animate-spin h-4 w-4 text-blue-600" />
                      <span className="text-sm text-blue-600">Loading organization...</span>
                    </div>
                  </div>
                )}

                <Tabs defaultValue="basic" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="basic">Basic</TabsTrigger>
                    <TabsTrigger value="styling">Styling</TabsTrigger>
                    <TabsTrigger value="advanced">Advanced</TabsTrigger>
                  </TabsList>

                  <TabsContent value="basic" className="space-y-4 mt-4">
                    {userMemberships?.data && userMemberships.data.length > 1 && (
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-1">
                          Organization
                        </label>
                        <Select
                          value={selectedOrganizationId}
                          onValueChange={setSelectedOrganizationId}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select an organization" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectGroup>
                              {userMemberships.data.map((membership) => (
                                <SelectItem
                                  key={membership.organization.id}
                                  value={membership.organization.id}
                                >
                                  {membership.organization.name}
                                </SelectItem>
                              ))}
                            </SelectGroup>
                          </SelectContent>
                        </Select>
                      </div>
                    )}

                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1">
                        Assistant
                      </label>
                      <Select
                        value={selectedAssistantId}
                        onValueChange={setSelectedAssistantId}
                        disabled={isLoadingAssistants}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder={isLoadingAssistants ? "Loading assistants..." : "Choose an assistant"} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            {assistants.map((assistant) => (
                              <SelectItem key={assistant.assistant_id} value={assistant.assistant_id}>
                                {assistant.name}
                              </SelectItem>
                            ))}
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    </div>

                    <InputField
                      label="Widget Name"
                      value={widgetName}
                      onChange={setWidgetName}
                    />

                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1">
                        Avatar
                      </label>
                      <div className="flex items-center space-x-4">
                        <div className="relative w-12 h-12 rounded-full overflow-hidden">
                          <Image
                            src={avatarUrl}
                            alt="Assistant Avatar"
                            fill
                            className="object-cover"
                          />
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => fileInputRef.current?.click()}
                        >
                          Upload Avatar
                        </Button>
                        <input
                          type="file"
                          ref={fileInputRef}
                          className="hidden"
                          accept="image/jpeg,image/png"
                          onChange={handleAvatarUpload}
                        />
                      </div>
                    </div>

                    <InputField
                      label="Website URL"
                      value={websiteUrl}
                      onChange={setWebsiteUrl}
                    />

                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1">
                        Brand Color
                      </label>
                      <div className="flex items-center space-x-2">
                        <Input
                          type="color"
                          value={brandColor}
                          onChange={(e) => setBrandColor(e.target.value)}
                          className="w-12 h-10 p-1 border border-rounded-xl border-gray-300 rounded-md cursor-pointer"
                          title="Pick a color"
                        />
                        <Input
                          type="text"
                          value={brandColor}
                          onChange={(e) => setBrandColor(e.target.value)}
                          placeholder="#007fff"
                          title="Enter color code"
                          className="flex-1"
                        />
                      </div>
                    </div>

                    <InputField
                      label="Greeting Message"
                      value={greetingMessage}
                      onChange={setGreetingMessage}
                    />
                  </TabsContent>

                  <TabsContent value="styling" className="space-y-4 mt-4">
                    <div>
                      <Label>Widget Position</Label>
                      <Select value={widgetPosition} onValueChange={setWidgetPosition}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="bottom-right">Bottom Right</SelectItem>
                          <SelectItem value="bottom-left">Bottom Left</SelectItem>
                          <SelectItem value="top-right">Top Right</SelectItem>
                          <SelectItem value="top-left">Top Left</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label>Widget Size</Label>
                      <Select value={widgetSize} onValueChange={setWidgetSize}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="small">Small</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="large">Large</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label>Header Color</Label>
                      <div className="flex items-center space-x-2">
                        <Input
                          type="color"
                          value={headerColor}
                          onChange={(e) => setHeaderColor(e.target.value)}
                          className="w-12 h-10 p-1 border border-gray-300 rounded-md cursor-pointer"
                        />
                        <Input
                          type="text"
                          value={headerColor}
                          onChange={(e) => setHeaderColor(e.target.value)}
                          placeholder="#007fff"
                          className="flex-1"
                        />
                      </div>
                    </div>

                    <div>
                      <Label>Visitor Message Color</Label>
                      <div className="flex items-center space-x-2">
                        <Input
                          type="color"
                          value={visitorMessageColor}
                          onChange={(e) => setVisitorMessageColor(e.target.value)}
                          className="w-12 h-10 p-1 border border-gray-300 rounded-md cursor-pointer"
                        />
                        <Input
                          type="text"
                          value={visitorMessageColor}
                          onChange={(e) => setVisitorMessageColor(e.target.value)}
                          placeholder="#007fff"
                          className="flex-1"
                        />
                      </div>
                    </div>

                    <div>
                      <Label>Business Message Color</Label>
                      <div className="flex items-center space-x-2">
                        <Input
                          type="color"
                          value={businessMessageColor}
                          onChange={(e) => setBusinessMessageColor(e.target.value)}
                          className="w-12 h-10 p-1 border border-gray-300 rounded-md cursor-pointer"
                        />
                        <Input
                          type="text"
                          value={businessMessageColor}
                          onChange={(e) => setBusinessMessageColor(e.target.value)}
                          placeholder="#F0F0F0"
                          className="flex-1"
                        />
                      </div>
                    </div>

                    <div>
                      <Label>Font Family</Label>
                      <Select value={fontFamily} onValueChange={setFontFamily}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Arial, sans-serif">Arial</SelectItem>
                          <SelectItem value="'Times New Roman', serif">Times New Roman</SelectItem>
                          <SelectItem value="'Courier New', monospace">Courier New</SelectItem>
                          <SelectItem value="Georgia, serif">Georgia</SelectItem>
                          <SelectItem value="'Segoe UI', Tahoma, sans-serif">Segoe UI</SelectItem>
                          <SelectItem value="'Roboto', sans-serif">Roboto</SelectItem>
                          <SelectItem value="'Open Sans', sans-serif">Open Sans</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </TabsContent>

                  <TabsContent value="advanced" className="space-y-4 mt-4">
                    <InputField
                      label="Help Text"
                      value={helpText}
                      onChange={setHelpText}
                    />

                    <InputField
                      label="Button Text"
                      value={buttonText}
                      onChange={setButtonText}
                    />

                    <div>
                      <Label>Font Size (px)</Label>
                      <Input
                        type="number"
                        value={fontSize}
                        onChange={(e) => setFontSize(parseInt(e.target.value))}
                        min={10}
                        max={24}
                      />
                    </div>

                    <div>
                      <Label>Border Radius (px)</Label>
                      <Input
                        type="number"
                        value={borderRadius}
                        onChange={(e) => setBorderRadius(parseInt(e.target.value))}
                        min={0}
                        max={30}
                      />
                    </div>

                    <div>
                      <Label>Chat Window Width (px)</Label>
                      <Input
                        type="number"
                        value={chatWindowWidth}
                        onChange={(e) => setChatWindowWidth(parseInt(e.target.value))}
                        min={300}
                        max={600}
                      />
                    </div>

                    <div>
                      <Label>Chat Window Height (px)</Label>
                      <Input
                        type="number"
                        value={chatWindowHeight}
                        onChange={(e) => setChatWindowHeight(parseInt(e.target.value))}
                        min={400}
                        max={800}
                      />
                    </div>

                    <div>
                      <Label>Animation Style</Label>
                      <Select value={animationStyle} onValueChange={setAnimationStyle}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="slide">Slide</SelectItem>
                          <SelectItem value="fade">Fade</SelectItem>
                          <SelectItem value="bounce">Bounce</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="enableSound"
                        checked={enableSound}
                        onChange={(e) => setEnableSound(e.target.checked)}
                        className="w-4 h-4"
                      />
                      <Label htmlFor="enableSound">Enable Sound Notifications</Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="showPoweredBy"
                        checked={showPoweredBy}
                        onChange={(e) => setShowPoweredBy(e.target.checked)}
                        className="w-4 h-4"
                      />
                      <Label htmlFor="showPoweredBy">Show "Powered by IntelliConcierge"</Label>
                    </div>
                  </TabsContent>
                </Tabs>

                <Button
                  type="submit"
                  className="w-full bg-blue-600 bg-blue-600 hover:bg-blue-700 mt-4"
                  disabled={loading || !selectedOrganizationId || !selectedAssistantId || isLoadingAssistants}
                >
                  {loading ? (
                    <div className="flex items-center justify-center space-x-2">
                      <Loader className="animate-spin h-5 w-5" />
                      <span>Creating Widget...</span>
                    </div>
                  ) : isLoadingAssistants ? (
                    <div className="flex items-center justify-center space-x-2">
                      <Loader className="animate-spin h-5 w-5" />
                      <span>Loading Assistants...</span>
                    </div>
                  ) : !selectedOrganizationId ? (
                    "Waiting for Organization..."
                  ) : !selectedAssistantId ? (
                    "Select an Assistant"
                  ) : (
                    "Create Widget"
                  )}
                </Button>
              </form>
            </div>

            {/* Right Side: Live Preview */}
            <div className="md:w-1/2 flex flex-col items-center justify-center space-y-4">
              {createdWidgetKey && (
                <div className="w-full">
                  <div className="flex justify-center gap-2">
                    <Button
                      variant={previewMode === "static" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setPreviewMode("static")}
                    >
                      Preview
                    </Button>
                    <Button
                      variant={previewMode === "live" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setPreviewMode("live")}
                    >
                      Live Test
                    </Button>
                    <Button
                      onClick={() => setShowDeploymentDialog(true)}
                      className="bg-green-600 hover:bg-green-700 text-white"
                      size="sm"
                    >
                      Deploy
                    </Button>
                  </div>
                </div>
              )}

              {previewMode === "live" && createdWidgetKey ? (
                <WidgetCommunication
                  widgetKey={createdWidgetKey}
                  widgetName={widgetName}
                  avatarUrl={avatarUrl}
                  brandColor={brandColor}
                  greetingMessage={greetingMessage}
                />
              ) : (
                <div className="w-full">
                  <div className="mb-4 flex items-center justify-between bg-white p-4 rounded-lg shadow-sm border">
                    <Label className="text-sm font-semibold">Preview Widget State</Label>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">Closed</span>
                      <button
                        type="button"
                        onClick={() => setPreviewOpen(!previewOpen)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          previewOpen ? "bg-blue-600" : "bg-gray-200"
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            previewOpen ? "translate-x-6" : "translate-x-1"
                          }`}
                        />
                      </button>
                      <span className="text-xs text-muted-foreground">Open</span>
                    </div>
                  </div>
                  <WidgetPreview
                    widget={{
                      widget_name: widgetName,
                      avatar_url: avatarUrl,
                      brand_color: brandColor,
                      greeting_message: greetingMessage,
                      help_text: helpText,
                      button_text: buttonText,
                      widget_position: widgetPosition as any,
                      widget_size: widgetSize as any,
                      header_color: headerColor,
                      visitor_message_color: visitorMessageColor,
                      business_message_color: businessMessageColor,
                      font_family: fontFamily,
                      font_size: fontSize,
                      border_radius: borderRadius,
                      chat_window_width: chatWindowWidth,
                      chat_window_height: chatWindowHeight,
                      enable_sound: enableSound,
                      show_powered_by: showPoweredBy,
                      animation_style: animationStyle
                    }}
                    isOpen={previewOpen}
                  />
                </div>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="manage" className="mt-6">
          <Widgets />
        </TabsContent>
      </Tabs>

      {showDeploymentDialog && (
        <DeploymentDialog
          onClose={() => setShowDeploymentDialog(false)}
          widgetKey={createdWidgetKey}
          websiteUrl={websiteUrl}
        />
      )}
    </div>
  )
}

function InputField({ label, value, onChange, type = "text" }: any) {
  return (
    <div>
      <label className="block text-sm font-medium text-foreground mb-1">
        {label}
      </label>
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        type={type}
        placeholder={`Enter ${label.toLowerCase()}`}
      />
    </div>
  )
}
