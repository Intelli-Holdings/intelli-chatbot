"use client"

import { useState, useEffect } from "react"
import { usePathname } from "next/navigation"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { SettingsSearch } from "@/components/settings-search"
import { useAppServices } from "@/hooks/use-app-services"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { AlertTriangle, Bot, Cpu, Loader2, MessageSquare, Pause, Play, Settings2 } from "lucide-react"
import { toast } from "sonner"

const settingsNavigation = [
  {
    title: "General",
    href: "/dashboard/settings",
  },
  {
    title: "Automation",
    href: "/dashboard/settings/automation",
  },
  {
    title: "Custom Fields",
    href: "/dashboard/settings/custom-fields",
  },
  {
    title: "Escalation Events",
    href: "/dashboard/settings/escalation-events",
  },
  {
    title: "Webhooks",
    href: "/dashboard/settings/webhooks",
  },
]

interface ChatbotFlowInfo {
  id: string
  name: string
  is_active: boolean
  is_enabled?: boolean
  trigger_keywords?: string[]
}

interface AutomationSettings {
  automation_mode: string
  assistant: { id: number; name: string; assistant_id: string } | null
  chatbot_flow: { id: string; name: string; is_active: boolean; is_published: boolean } | null
  active_chatbot_flows: ChatbotFlowInfo[]
  auto_fallback: boolean
  automation_paused: boolean
  available_assistants: { id: number; name: string }[]
  available_chatbot_flows: ChatbotFlowInfo[]
  chatbot_warnings: string[]
}

export default function AutomationSettingsPage() {
  const pathname = usePathname()
  const { appServices, loading: loadingAppServices, selectedAppService, setSelectedAppService } = useAppServices()

  const [settings, setSettings] = useState<AutomationSettings | null>(null)
  const [loadingSettings, setLoadingSettings] = useState(false)
  const [saving, setSaving] = useState(false)
  const [toggling, setToggling] = useState(false)

  // Form state
  const [mode, setMode] = useState<string>("manual")
  const [selectedAssistantId, setSelectedAssistantId] = useState<string>("")
  const [selectedChatbotFlowIds, setSelectedChatbotFlowIds] = useState<string[]>([])
  const [autoFallback, setAutoFallback] = useState(true)

  // Fetch automation settings when app service changes
  useEffect(() => {
    const fetchSettings = async () => {
      if (!selectedAppService?.id) return

      setLoadingSettings(true)
      try {
        const response = await fetch(
          `/api/appservice/${selectedAppService.id}/automation`
        )

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || `Failed to fetch automation settings (${response.status})`)
        }

        setSettings(data as AutomationSettings)

        // Initialize form state from settings
        setMode(data.automation_mode === "paused" ? "manual" : data.automation_mode)
        setSelectedAssistantId(data.assistant?.id?.toString() || "")
        // Get enabled flow IDs from active_chatbot_flows or available_chatbot_flows
        const enabledFlowIds = data.active_chatbot_flows?.map((f: ChatbotFlowInfo) => f.id) ||
          data.available_chatbot_flows?.filter((f: ChatbotFlowInfo) => f.is_enabled).map((f: ChatbotFlowInfo) => f.id) ||
          (data.chatbot_flow ? [data.chatbot_flow.id] : [])
        setSelectedChatbotFlowIds(enabledFlowIds)
        setAutoFallback(data.auto_fallback)
      } catch (error) {
        console.error("Error fetching automation settings:", error)
        const errorMessage = error instanceof Error ? error.message : "Failed to load automation settings"
        toast.error(errorMessage)
      } finally {
        setLoadingSettings(false)
      }
    }

    fetchSettings()
  }, [selectedAppService?.id])

  const handleSave = async () => {
    if (!selectedAppService?.id) return

    setSaving(true)
    try {
      const payload = {
        mode,
        assistant_id: mode === "ai_only" || mode === "chatbot_with_fallback"
          ? (selectedAssistantId ? parseInt(selectedAssistantId) : null)
          : null,
        chatbot_flow_ids: mode === "chatbot_only" || mode === "chatbot_with_fallback"
          ? selectedChatbotFlowIds
          : [],
        auto_fallback: mode === "chatbot_with_fallback" ? autoFallback : false,
      }

      const response = await fetch(
        `/api/appservice/${selectedAppService.id}/automation`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      )

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to update settings")
      }

      const data = await response.json()
      setSettings(prev => prev ? { ...prev, ...data } : null)
      toast.success("Automation settings updated successfully")
    } catch (error) {
      console.error("Error updating automation settings:", error)
      toast.error(error instanceof Error ? error.message : "Failed to update settings")
    } finally {
      setSaving(false)
    }
  }

  const handleTogglePause = async () => {
    if (!selectedAppService?.id) return

    setToggling(true)
    try {
      const response = await fetch(
        `/api/appservice/${selectedAppService.id}/automation/toggle-pause`,
        { method: "POST" }
      )

      if (!response.ok) {
        throw new Error("Failed to toggle automation pause")
      }

      const data = await response.json()
      setSettings(prev => prev ? { ...prev, automation_paused: data.automation_paused } : null)
      toast.success(data.automation_paused ? "Automation paused" : "Automation resumed")
    } catch (error) {
      console.error("Error toggling pause:", error)
      toast.error("Failed to toggle automation pause")
    } finally {
      setToggling(false)
    }
  }

  const getModeDescription = (modeValue: string) => {
    switch (modeValue) {
      case "ai_only":
        return "AI assistant handles all incoming messages automatically"
      case "chatbot_only":
        return "Chatbot flow handles messages that match trigger keywords"
      case "chatbot_with_fallback":
        return "Chatbot flow first, then AI assistant if no match or handoff"
      case "manual":
        return "No automation - all messages require manual handling"
      default:
        return ""
    }
  }

  const needsAssistant = mode === "ai_only" || mode === "chatbot_with_fallback"
  const needsChatbot = mode === "chatbot_only" || mode === "chatbot_with_fallback"

  return (
    <div className="flex min-h-screen bg-background">
      {/* Left Sidebar Navigation */}
      <aside className="w-64 border-r border-border bg-card">
        <div className="sticky top-0 flex h-screen flex-col">
          {/* Header */}
          <div className="border-b border-border p-6">
            <h1 className="text-2xl font-bold">Settings</h1>
            <Link
              href="/dashboard"
              className="mt-2 flex items-center text-sm text-muted-foreground hover:text-foreground"
            >
              <span>← Go to Dashboard</span>
            </Link>
          </div>

          {/* Search */}
          <div className="border-b border-border p-4">
            <SettingsSearch />
          </div>

          {/* Navigation Items */}
          <nav className="flex-1 space-y-1 overflow-y-auto p-4">
            {settingsNavigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "block rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  pathname === item.href
                    ? "bg-primary text-primary-foreground"
                    : "text-foreground hover:bg-accent hover:text-accent-foreground",
                )}
              >
                {item.title}
              </Link>
            ))}
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8">
        <div className="mx-auto max-w-3xl">
          <div className="mb-8">
            <h2 className="text-3xl font-bold">Automation</h2>
            <p className="mt-2 text-muted-foreground">
              Configure how your WhatsApp messages are handled automatically
            </p>
          </div>

          {/* App Service Selector */}
          <div className="mb-6">
            <Label className="mb-2 block text-sm font-medium">WhatsApp Number</Label>
            {loadingAppServices ? (
              <Skeleton className="h-10 w-full" />
            ) : appServices.length === 0 ? (
              <Alert>
                <AlertDescription>
                  No WhatsApp services configured. Please set up a WhatsApp Business account first.
                </AlertDescription>
              </Alert>
            ) : (
              <Select
                value={selectedAppService?.id?.toString() || ""}
                onValueChange={(value) => {
                  const service = appServices.find(s => s.id.toString() === value)
                  setSelectedAppService(service || null)
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a WhatsApp number" />
                </SelectTrigger>
                <SelectContent>
                  {appServices.map((service) => (
                    <SelectItem key={service.id} value={service.id.toString()}>
                      {service.phone_number}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          {selectedAppService && (
            <>
              {loadingSettings ? (
                <div className="space-y-4">
                  <Skeleton className="h-48 w-full" />
                  <Skeleton className="h-32 w-full" />
                </div>
              ) : settings ? (
                <div className="space-y-6">
                  {/* Pause/Resume Toggle */}
                  {settings.automation_paused && (
                    <Alert className="border-yellow-500/50 bg-yellow-500/10">
                      <Pause className="size-4 text-yellow-600" />
                      <AlertDescription className="flex items-center justify-between">
                        <span className="text-yellow-600">Automation is currently paused</span>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={handleTogglePause}
                          disabled={toggling}
                        >
                          {toggling ? (
                            <Loader2 className="mr-2 size-4 animate-spin" />
                          ) : (
                            <Play className="mr-2 size-4" />
                          )}
                          Resume
                        </Button>
                      </AlertDescription>
                    </Alert>
                  )}

                  {/* Current Status */}
                  <div className="rounded-lg border border-border bg-card p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Settings2 className="size-5 text-muted-foreground" />
                        <span className="font-medium">Current Status</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {settings.automation_mode === "paused" ? (
                          <Badge variant="secondary">Paused</Badge>
                        ) : settings.automation_mode === "manual" ? (
                          <Badge variant="outline">Manual</Badge>
                        ) : settings.automation_mode === "ai_only" ? (
                          <Badge className="bg-blue-500">AI Only</Badge>
                        ) : settings.automation_mode === "chatbot_only" ? (
                          <Badge className="bg-green-500">Chatbot Only</Badge>
                        ) : settings.automation_mode === "chatbot_with_fallback" ? (
                          <Badge className="bg-purple-500">Chatbot + AI</Badge>
                        ) : (
                          <Badge variant="outline">{settings.automation_mode}</Badge>
                        )}
                        {!settings.automation_paused && settings.automation_mode !== "manual" && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={handleTogglePause}
                            disabled={toggling}
                          >
                            {toggling ? (
                              <Loader2 className="size-4 animate-spin" />
                            ) : (
                              <Pause className="size-4" />
                            )}
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Automation Mode Selection */}
                  <div className="rounded-lg border border-border bg-card p-6">
                    <h3 className="mb-4 text-lg font-semibold">Automation Mode</h3>

                    <RadioGroup value={mode} onValueChange={setMode} className="space-y-4">
                      <div className="flex items-start space-x-3 rounded-lg border border-border p-4 transition-colors hover:bg-accent/50">
                        <RadioGroupItem value="ai_only" id="ai_only" className="mt-1" />
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <Label htmlFor="ai_only" className="cursor-pointer font-medium">
                              AI Assistant Only
                            </Label>
                            <Cpu className="size-4 text-blue-500" />
                          </div>
                          <p className="mt-1 text-sm text-muted-foreground">
                            {getModeDescription("ai_only")}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start space-x-3 rounded-lg border border-border p-4 transition-colors hover:bg-accent/50">
                        <RadioGroupItem value="chatbot_only" id="chatbot_only" className="mt-1" />
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <Label htmlFor="chatbot_only" className="cursor-pointer font-medium">
                              Chatbot Flow Only
                            </Label>
                            <Bot className="size-4 text-green-500" />
                          </div>
                          <p className="mt-1 text-sm text-muted-foreground">
                            {getModeDescription("chatbot_only")}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start space-x-3 rounded-lg border border-purple-500/50 bg-purple-500/5 p-4 transition-colors hover:bg-purple-500/10">
                        <RadioGroupItem value="chatbot_with_fallback" id="chatbot_with_fallback" className="mt-1" />
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <Label htmlFor="chatbot_with_fallback" className="cursor-pointer font-medium">
                              Chatbot + AI Fallback
                            </Label>
                            <Bot className="size-4 text-purple-500" />
                            <Badge variant="secondary" className="text-xs">Recommended</Badge>
                          </div>
                          <p className="mt-1 text-sm text-muted-foreground">
                            {getModeDescription("chatbot_with_fallback")}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start space-x-3 rounded-lg border border-border p-4 transition-colors hover:bg-accent/50">
                        <RadioGroupItem value="manual" id="manual" className="mt-1" />
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <Label htmlFor="manual" className="cursor-pointer font-medium">
                              Manual Only
                            </Label>
                            <MessageSquare className="size-4 text-muted-foreground" />
                          </div>
                          <p className="mt-1 text-sm text-muted-foreground">
                            {getModeDescription("manual")}
                          </p>
                        </div>
                      </div>
                    </RadioGroup>
                  </div>

                  {/* Configuration Based on Mode */}
                  {(needsAssistant || needsChatbot) && (
                    <div className="rounded-lg border border-border bg-card p-6">
                      <h3 className="mb-4 text-lg font-semibold">Configuration</h3>

                      <div className="space-y-4">
                        {/* Assistant Selection */}
                        {needsAssistant && (
                          <div>
                            <Label className="mb-2 block text-sm font-medium">
                              AI Assistant
                            </Label>
                            {settings.available_assistants.length === 0 ? (
                              <Alert>
                                <AlertDescription>
                                  No AI assistants available. Create one in the Assistants section.
                                </AlertDescription>
                              </Alert>
                            ) : (
                              <Select
                                value={selectedAssistantId}
                                onValueChange={setSelectedAssistantId}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select an AI assistant" />
                                </SelectTrigger>
                                <SelectContent>
                                  {settings.available_assistants.map((assistant) => (
                                    <SelectItem key={assistant.id} value={assistant.id.toString()}>
                                      {assistant.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            )}
                          </div>
                        )}

                        {/* Chatbot Flow Selection - Multiple */}
                        {needsChatbot && (
                          <div>
                            <Label className="mb-2 block text-sm font-medium">
                              Chatbot Flows
                            </Label>
                            <p className="mb-3 text-xs text-muted-foreground">
                              Select multiple flows - each will trigger on its own keywords
                            </p>
                            {settings.available_chatbot_flows.length === 0 ? (
                              <Alert>
                                <AlertDescription>
                                  No chatbot flows available. Create one in the Chatbots section.
                                </AlertDescription>
                              </Alert>
                            ) : (
                              <div className="space-y-2 rounded-lg border border-border p-3">
                                {settings.available_chatbot_flows.map((flow) => (
                                  <div
                                    key={flow.id}
                                    className="flex items-start space-x-3 rounded-md p-2 hover:bg-accent/50"
                                  >
                                    <Checkbox
                                      id={`flow-${flow.id}`}
                                      checked={selectedChatbotFlowIds.includes(flow.id)}
                                      onCheckedChange={(checked) => {
                                        if (checked) {
                                          setSelectedChatbotFlowIds([...selectedChatbotFlowIds, flow.id])
                                        } else {
                                          setSelectedChatbotFlowIds(selectedChatbotFlowIds.filter(id => id !== flow.id))
                                        }
                                      }}
                                    />
                                    <div className="flex-1">
                                      <Label
                                        htmlFor={`flow-${flow.id}`}
                                        className="cursor-pointer font-medium"
                                      >
                                        {flow.name}
                                      </Label>
                                      {flow.trigger_keywords && flow.trigger_keywords.length > 0 && (
                                        <div className="mt-1 flex flex-wrap gap-1">
                                          {flow.trigger_keywords.slice(0, 5).map((keyword, idx) => (
                                            <Badge key={idx} variant="outline" className="text-xs">
                                              {keyword}
                                            </Badge>
                                          ))}
                                          {flow.trigger_keywords.length > 5 && (
                                            <Badge variant="outline" className="text-xs">
                                              +{flow.trigger_keywords.length - 5} more
                                            </Badge>
                                          )}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )}

                        {/* Auto Fallback Option */}
                        {mode === "chatbot_with_fallback" && (
                          <div className="flex items-center space-x-2 rounded-lg border border-border p-4">
                            <Checkbox
                              id="auto_fallback"
                              checked={autoFallback}
                              onCheckedChange={(checked) => setAutoFallback(checked === true)}
                            />
                            <div className="flex-1">
                              <Label htmlFor="auto_fallback" className="cursor-pointer font-medium">
                                Auto-fallback to AI
                              </Label>
                              <p className="text-sm text-muted-foreground">
                                Automatically use AI assistant when chatbot has no matching trigger
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Chatbot Warnings */}
                  {settings.chatbot_warnings.length > 0 && needsChatbot && (
                    <Alert className="border-yellow-500/50 bg-yellow-500/10">
                      <AlertTriangle className="size-4 text-yellow-600" />
                      <AlertDescription>
                        <div className="font-medium text-yellow-600">Chatbot Flow Warnings</div>
                        <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-yellow-600">
                          {settings.chatbot_warnings.map((warning, index) => (
                            <li key={index}>{warning}</li>
                          ))}
                        </ul>
                      </AlertDescription>
                    </Alert>
                  )}

                  {/* Save Button */}
                  <div className="flex justify-end gap-3">
                    <Button
                      onClick={handleSave}
                      disabled={saving}
                    >
                      {saving && <Loader2 className="mr-2 size-4 animate-spin" />}
                      Save Changes
                    </Button>
                  </div>
                </div>
              ) : (
                <Alert>
                  <AlertDescription>
                    Failed to load automation settings. Please try again.
                  </AlertDescription>
                </Alert>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  )
}
