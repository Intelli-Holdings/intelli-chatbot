"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { useQueryClient } from "react-query"
import { useOrganizationList } from "@clerk/nextjs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Loader,
  PlusCircle,
  Palette,
  Settings,
  Rocket,
  Eye,
  Code,
  CheckCircle2,
  Upload as UploadIcon,
  Sparkles,
  Layout
} from 'lucide-react'
import { toast } from "sonner"
import Image from "next/image"
import useActiveOrganizationId from "@/hooks/use-organization-id"
import {
  ASSISTANTS_STALE_TIME_MS,
  assistantsQueryKey,
  fetchAssistantsForOrg,
} from "@/hooks/use-assistants-cache"
import WidgetPreview from "@/components/WidgetPreview"
import { WidgetCommunication } from "@/components/widget-communication"
import { DeploymentDialog } from "@/components/deployment-dialog"
import Widgets from "@/components/Widgets"

import { logger } from "@/lib/logger";
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
  [key: string]: unknown
}

export default function UnifiedWidgets() {
  const queryClient = useQueryClient()
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
  const [previewMode, setPreviewMode] = useState<"static" | "demo" | "live">("static")

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
      const data = await queryClient.fetchQuery(
        assistantsQueryKey(selectedOrganizationId),
        () => fetchAssistantsForOrg<Assistant>(selectedOrganizationId),
        { staleTime: ASSISTANTS_STALE_TIME_MS },
      )

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
          logger.warn("[UnifiedWidgets] Invalid assistant object:", { data: assistant })
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
      logger.error("[UnifiedWidgets] Error fetching assistants:", { error: error instanceof Error ? error.message : String(error) })
      toast.error(`Failed to fetch assistants: ${error instanceof Error ? error.message : "Unknown error"}`)
      setAssistants([])
    } finally {
      setIsLoadingAssistants(false)
    }
  }, [queryClient, selectedOrganizationId, selectedAssistantId])

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
      logger.error("[UnifiedWidgets] Error submitting widget:", { error: error instanceof Error ? error.message : String(error) })
      toast.error(`Failed to create widget: ${error instanceof Error ? error.message : "Unknown error"}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="h-9 rounded-full border border-[#e9edef] bg-[#f0f2f5] text-[#667781]">
          <TabsTrigger
            value="create"
            className="flex items-center gap-2 px-4 text-xs data-[state=active]:bg-white data-[state=active]:text-[#111b21]"
          >
            <PlusCircle className="h-4 w-4" />
            <span>Create Widget</span>
          </TabsTrigger>
          <TabsTrigger
            value="manage"
            className="flex items-center gap-2 px-4 text-xs data-[state=active]:bg-white data-[state=active]:text-[#111b21]"
          >
            <Layout className="h-4 w-4" />
            <span>My Widgets</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="create" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Side: Configuration Form */}
            <div className="space-y-6">
              <Card className="border-2">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Sparkles className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle>Widget Configuration</CardTitle>
                      <CardDescription>Customize your chat widget appearance and behavior</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {!selectedOrganizationId && (
                      <Card className="bg-blue-50 border-blue-200">
                        <CardContent className="p-4">
                          <div className="flex items-center space-x-3">
                            <Loader className="animate-spin h-5 w-5 text-blue-600" />
                            <span className="text-sm text-blue-700 font-medium">Loading organization...</span>
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    <Tabs defaultValue="basic" className="w-full">
                      <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="basic" className="gap-2">
                          <Settings className="h-4 w-4" />
                          Basic
                        </TabsTrigger>
                        <TabsTrigger value="styling" className="gap-2">
                          <Palette className="h-4 w-4" />
                          Styling
                        </TabsTrigger>
                        <TabsTrigger value="advanced" className="gap-2">
                          <Rocket className="h-4 w-4" />
                          Advanced
                        </TabsTrigger>
                      </TabsList>

                      <TabsContent value="basic" className="space-y-4 mt-4">
                        {userMemberships?.data && userMemberships.data.length > 1 && (
                          <div className="space-y-2">
                            <Label className="text-sm font-semibold">Organization</Label>
                            <Select
                              value={selectedOrganizationId}
                              onValueChange={setSelectedOrganizationId}
                            >
                              <SelectTrigger className="h-10">
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

                        <div className="space-y-2">
                          <Label className="text-sm font-semibold">
                            Assistant <Badge variant="secondary" className="ml-2">Required</Badge>
                          </Label>
                          <Select
                            value={selectedAssistantId}
                            onValueChange={setSelectedAssistantId}
                            disabled={isLoadingAssistants}
                          >
                            <SelectTrigger className="h-10">
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
                          <p className="text-xs text-muted-foreground">Select which AI assistant powers this widget</p>
                        </div>

                        <div className="space-y-2">
                          <Label className="text-sm font-semibold">Widget Name</Label>
                          <Input
                            value={widgetName}
                            onChange={(e) => setWidgetName(e.target.value)}
                            placeholder="Enter widget name"
                            className="h-10"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label className="text-sm font-semibold">Avatar</Label>
                          <div className="flex items-center gap-4 p-4 border rounded-lg bg-muted/30">
                            <div className="relative w-16 h-16 rounded-full overflow-hidden ring-2 ring-primary/20">
                              <Image
                                src={avatarUrl}
                                alt="Assistant Avatar"
                                fill
                                className="object-cover"
                              />
                            </div>
                            <div className="flex-1">
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => fileInputRef.current?.click()}
                                className="gap-2"
                              >
                                <UploadIcon className="h-4 w-4" />
                                Upload Avatar
                              </Button>
                              <p className="text-xs text-muted-foreground mt-1">JPG or PNG, max 5MB</p>
                            </div>
                            <input
                              type="file"
                              ref={fileInputRef}
                              className="hidden"
                              accept="image/jpeg,image/png"
                              onChange={handleAvatarUpload}
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label className="text-sm font-semibold">Website URL</Label>
                          <Input
                            value={websiteUrl}
                            onChange={(e) => setWebsiteUrl(e.target.value)}
                            placeholder="https://yourwebsite.com"
                            type="url"
                            className="h-10"
                          />
                          <p className="text-xs text-muted-foreground">Where will this widget be deployed?</p>
                        </div>

                        <div className="space-y-2">
                          <Label className="text-sm font-semibold">Brand Color</Label>
                          <div className="flex items-center gap-3">
                            <div className="relative">
                              <Input
                                type="color"
                                value={brandColor}
                                onChange={(e) => setBrandColor(e.target.value)}
                                className="w-16 h-10 p-1 cursor-pointer"
                                title="Pick a color"
                              />
                            </div>
                            <Input
                              type="text"
                              value={brandColor}
                              onChange={(e) => setBrandColor(e.target.value)}
                              placeholder="#007fff"
                              className="flex-1 h-10 font-mono"
                            />
                          </div>
                          <p className="text-xs text-muted-foreground">Primary color for your widget</p>
                        </div>

                        <div className="space-y-2">
                          <Label className="text-sm font-semibold">Greeting Message</Label>
                          <Input
                            value={greetingMessage}
                            onChange={(e) => setGreetingMessage(e.target.value)}
                            placeholder="Hello! I'm here to help."
                            className="h-10"
                          />
                        </div>
                      </TabsContent>

                      <TabsContent value="styling" className="space-y-4 mt-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label className="text-sm font-semibold">Widget Position</Label>
                            <Select value={widgetPosition} onValueChange={setWidgetPosition}>
                              <SelectTrigger className="h-10">
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

                          <div className="space-y-2">
                            <Label className="text-sm font-semibold">Widget Size</Label>
                            <Select value={widgetSize} onValueChange={setWidgetSize}>
                              <SelectTrigger className="h-10">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="small">Small</SelectItem>
                                <SelectItem value="medium">Medium</SelectItem>
                                <SelectItem value="large">Large</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label className="text-sm font-semibold">Header Color</Label>
                          <div className="flex items-center gap-3">
                            <Input
                              type="color"
                              value={headerColor}
                              onChange={(e) => setHeaderColor(e.target.value)}
                              className="w-16 h-10 p-1 cursor-pointer"
                            />
                            <Input
                              type="text"
                              value={headerColor}
                              onChange={(e) => setHeaderColor(e.target.value)}
                              placeholder="#007fff"
                              className="flex-1 h-10 font-mono"
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label className="text-sm font-semibold">Visitor Message Color</Label>
                          <div className="flex items-center gap-3">
                            <Input
                              type="color"
                              value={visitorMessageColor}
                              onChange={(e) => setVisitorMessageColor(e.target.value)}
                              className="w-16 h-10 p-1 cursor-pointer"
                            />
                            <Input
                              type="text"
                              value={visitorMessageColor}
                              onChange={(e) => setVisitorMessageColor(e.target.value)}
                              placeholder="#007fff"
                              className="flex-1 h-10 font-mono"
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label className="text-sm font-semibold">Business Message Color</Label>
                          <div className="flex items-center gap-3">
                            <Input
                              type="color"
                              value={businessMessageColor}
                              onChange={(e) => setBusinessMessageColor(e.target.value)}
                              className="w-16 h-10 p-1 cursor-pointer"
                            />
                            <Input
                              type="text"
                              value={businessMessageColor}
                              onChange={(e) => setBusinessMessageColor(e.target.value)}
                              placeholder="#F0F0F0"
                              className="flex-1 h-10 font-mono"
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label className="text-sm font-semibold">Font Family</Label>
                          <Select value={fontFamily} onValueChange={setFontFamily}>
                            <SelectTrigger className="h-10">
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
                        <div className="space-y-2">
                          <Label className="text-sm font-semibold">Help Text</Label>
                          <Input
                            value={helpText}
                            onChange={(e) => setHelpText(e.target.value)}
                            placeholder="Need Help? Chat With US !"
                            className="h-10"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label className="text-sm font-semibold">Button Text</Label>
                          <Input
                            value={buttonText}
                            onChange={(e) => setButtonText(e.target.value)}
                            placeholder="Chat with us"
                            className="h-10"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label className="text-sm font-semibold">Font Size (px)</Label>
                            <Input
                              type="number"
                              value={fontSize}
                              onChange={(e) => setFontSize(parseInt(e.target.value))}
                              min={10}
                              max={24}
                              className="h-10"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label className="text-sm font-semibold">Border Radius (px)</Label>
                            <Input
                              type="number"
                              value={borderRadius}
                              onChange={(e) => setBorderRadius(parseInt(e.target.value))}
                              min={0}
                              max={30}
                              className="h-10"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label className="text-sm font-semibold">Window Width (px)</Label>
                            <Input
                              type="number"
                              value={chatWindowWidth}
                              onChange={(e) => setChatWindowWidth(parseInt(e.target.value))}
                              min={300}
                              max={600}
                              className="h-10"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label className="text-sm font-semibold">Window Height (px)</Label>
                            <Input
                              type="number"
                              value={chatWindowHeight}
                              onChange={(e) => setChatWindowHeight(parseInt(e.target.value))}
                              min={400}
                              max={800}
                              className="h-10"
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label className="text-sm font-semibold">Animation Style</Label>
                          <Select value={animationStyle} onValueChange={setAnimationStyle}>
                            <SelectTrigger className="h-10">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="slide">Slide</SelectItem>
                              <SelectItem value="fade">Fade</SelectItem>
                              <SelectItem value="bounce">Bounce</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-3 pt-2">
                          <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                            <div className="flex items-center gap-3">
                              <input
                                type="checkbox"
                                id="enableSound"
                                checked={enableSound}
                                onChange={(e) => setEnableSound(e.target.checked)}
                                className="w-4 h-4 rounded border-gray-300"
                              />
                              <Label htmlFor="enableSound" className="cursor-pointer font-medium">Enable Sound Notifications</Label>
                            </div>
                          </div>

                          <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                            <div className="flex items-center gap-3">
                              <input
                                type="checkbox"
                                id="showPoweredBy"
                                checked={showPoweredBy}
                                onChange={(e) => setShowPoweredBy(e.target.checked)}
                                className="w-4 h-4 rounded border-gray-300"
                              />
                              <Label htmlFor="showPoweredBy" className="cursor-pointer font-medium">Show &quot;Powered by Intelli&quot;</Label>
                            </div>
                          </div>
                        </div>
                      </TabsContent>
                    </Tabs>

                    <Button
                      type="submit"
                      className="w-full h-11 bg-primary hover:bg-primary/90 gap-2"
                      disabled={loading || !selectedOrganizationId || !selectedAssistantId || isLoadingAssistants}
                    >
                      {loading ? (
                        <>
                          <Loader className="animate-spin h-5 w-5" />
                          <span>Creating Widget...</span>
                        </>
                      ) : isLoadingAssistants ? (
                        <>
                          <Loader className="animate-spin h-5 w-5" />
                          <span>Loading Assistants...</span>
                        </>
                      ) : !selectedOrganizationId ? (
                        "Waiting for Organization..."
                      ) : !selectedAssistantId ? (
                        "Select an Assistant"
                      ) : (
                        <>
                          <CheckCircle2 className="h-5 w-5" />
                          Create Widget
                        </>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>

            {/* Right Side: Live Preview */}
            <div className="w-full">
              <Card className="border-2">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <Eye className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">Live Preview</CardTitle>
                        <CardDescription>See your widget in action</CardDescription>
                      </div>
                    </div>
                    {createdWidgetKey && (
                      <div className="flex gap-2">
                        <Button
                          variant={previewMode === "static" ? "default" : "outline"}
                          size="sm"
                          onClick={() => setPreviewMode("static")}
                        >
                          Preview
                        </Button>
                        <Button
                          variant={previewMode === "demo" ? "default" : "outline"}
                          size="sm"
                          onClick={() => setPreviewMode("demo")}
                        >
                          Demo
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
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  {previewMode !== "static" && createdWidgetKey ? (
                    <WidgetCommunication
                      key={`${previewMode}-${createdWidgetKey}`}
                      widgetKey={createdWidgetKey}
                      widgetName={widgetName}
                      avatarUrl={avatarUrl}
                      brandColor={brandColor}
                      greetingMessage={greetingMessage}
                      forceDemoMode={previewMode === "demo"}
                    />
                  ) : (
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
                      onToggleOpen={() => setPreviewOpen(!previewOpen)}
                    />
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="manage" className="mt-6">
          <Widgets onCreateWidget={() => setActiveTab("create")} />
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
