"use client"

import { useState, useEffect } from "react"
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
import { AlertTriangle, Bot, Loader2, MessageSquare, Pause, Play, Settings2, Workflow } from "lucide-react"
import { toast } from "sonner"
import { logger } from "@/lib/logger"

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
  const { appServices, loading: loadingAppServices, selectedAppService, setSelectedAppService } = useAppServices()

  const [settings, setSettings] = useState<AutomationSettings | null>(null)
  const [loadingSettings, setLoadingSettings] = useState(false)
  const [saving, setSaving] = useState(false)
  const [toggling, setToggling] = useState(false)

  const [mode, setMode] = useState<string>("manual")
  const [selectedAssistantId, setSelectedAssistantId] = useState<string>("")
  const [selectedChatbotFlowIds, setSelectedChatbotFlowIds] = useState<string[]>([])
  const [autoFallback, setAutoFallback] = useState(true)

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
        setMode(data.automation_mode === "paused" ? "manual" : data.automation_mode)
        setSelectedAssistantId(data.assistant?.id?.toString() || "")
        const enabledFlowIds = data.active_chatbot_flows?.map((f: ChatbotFlowInfo) => f.id) ||
          data.available_chatbot_flows?.filter((f: ChatbotFlowInfo) => f.is_enabled).map((f: ChatbotFlowInfo) => f.id) ||
          (data.chatbot_flow ? [data.chatbot_flow.id] : [])
        setSelectedChatbotFlowIds(enabledFlowIds)
        setAutoFallback(data.auto_fallback)
      } catch (error) {
        logger.error("Error fetching automation settings", { error: error instanceof Error ? error.message : String(error) })
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
      logger.error("Error updating automation settings", { error: error instanceof Error ? error.message : String(error) })
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
      logger.error("Error toggling pause", { error: error instanceof Error ? error.message : String(error) })
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
        return "No automation — all messages require a human agent"
      default:
        return ""
    }
  }

  const needsAssistant = mode === "ai_only" || mode === "chatbot_with_fallback"
  const needsChatbot = mode === "chatbot_only" || mode === "chatbot_with_fallback"

  return (
    <>
      {/* Page header */}
      <div className="mb-golden-xl">
        <h2 className="text-golden-heading font-semibold tracking-tight">Automation</h2>
        <p className="mt-golden-3xs text-golden-body-sm text-muted-foreground">
          Configure how your WhatsApp messages are handled automatically
        </p>
      </div>

      <div className="flex flex-col gap-golden-lg">
        {/* WhatsApp Number selector */}
        <section>
          <h3 className="mb-golden-sm px-golden-3xs text-golden-label font-medium uppercase tracking-wide text-muted-foreground">
            WhatsApp Number
          </h3>
          <div className="rounded-squircle-md border border-border/60 bg-card px-golden-lg py-golden-md">
            {loadingAppServices ? (
              <Skeleton className="h-[34px] w-full" />
            ) : appServices.length === 0 ? (
              <p className="text-golden-body-sm text-muted-foreground">
                No WhatsApp services configured. Set up a WhatsApp Business account first.
              </p>
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
        </section>

        {selectedAppService && (
          <>
            {loadingSettings ? (
              <div className="flex flex-col gap-golden-md">
                <Skeleton className="h-48 w-full rounded-squircle-md" />
                <Skeleton className="h-32 w-full rounded-squircle-md" />
              </div>
            ) : settings ? (
              <>
                {/* Pause banner */}
                {settings.automation_paused && (
                  <div className="flex items-center justify-between rounded-squircle-md border border-amber-500/40 bg-amber-500/8 px-golden-lg py-golden-md">
                    <div className="flex items-center gap-golden-sm">
                      <Pause className="size-4 text-amber-600" />
                      <span className="text-golden-body-sm text-amber-600 font-medium">Automation is currently paused</span>
                    </div>
                    <Button size="sm" variant="outline" onClick={handleTogglePause} disabled={toggling}>
                      {toggling ? <Loader2 className="mr-golden-3xs size-4 animate-spin" /> : <Play className="mr-golden-3xs size-4" />}
                      Resume
                    </Button>
                  </div>
                )}

                {/* Current Status */}
                <section>
                  <h3 className="mb-golden-sm px-golden-3xs text-golden-label font-medium uppercase tracking-wide text-muted-foreground">
                    Status
                  </h3>
                  <div className="rounded-squircle-md border border-border/60 bg-card px-golden-lg py-golden-md">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-golden-sm">
                        <Settings2 className="size-4 text-muted-foreground" />
                        <span className="text-golden-body-sm font-medium">Current Mode</span>
                      </div>
                      <div className="flex items-center gap-golden-xs">
                        {settings.automation_paused || settings.automation_mode === "paused" ? (
                          <Badge variant="outline" className="border-amber-500 text-amber-600 bg-amber-50 dark:bg-amber-950/30">Paused</Badge>
                        ) : settings.automation_mode === "manual" ? (
                          <Badge variant="outline">Live Chat</Badge>
                        ) : settings.automation_mode === "ai_only" ? (
                          <Badge variant="outline" className="border-blue-500 text-blue-600 bg-blue-50 dark:bg-blue-950/30">AI Only</Badge>
                        ) : settings.automation_mode === "chatbot_only" ? (
                          <Badge variant="outline" className="border-teal-500 text-teal-600 bg-teal-50 dark:bg-teal-950/30">Chatbot Only</Badge>
                        ) : settings.automation_mode === "chatbot_with_fallback" ? (
                          <Badge variant="outline" className="border-purple-500 text-purple-600 bg-purple-50 dark:bg-purple-950/30">Chatbot + AI</Badge>
                        ) : (
                          <Badge variant="outline">{settings.automation_mode}</Badge>
                        )}
                        {!settings.automation_paused && settings.automation_mode !== "manual" && settings.automation_mode !== "paused" && (
                          <Button size="icon" variant="ghost" className="size-7" onClick={handleTogglePause} disabled={toggling}>
                            {toggling ? <Loader2 className="size-3.5 animate-spin" /> : <Pause className="size-3.5" />}
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </section>

                {/* Automation Mode — macOS grouped radio list */}
                <section>
                  <h3 className="mb-golden-sm px-golden-3xs text-golden-label font-medium uppercase tracking-wide text-muted-foreground">
                    Automation Mode
                  </h3>
                  <div className="rounded-squircle-md border border-border/60 bg-card overflow-hidden">
                    <RadioGroup value={mode} onValueChange={setMode}>
                      <label htmlFor="ai_only" className="flex items-start gap-golden-md px-golden-lg py-golden-md border-b border-border/40 cursor-pointer transition-colors hover:bg-accent/40">
                        <RadioGroupItem value="ai_only" id="ai_only" className="mt-0.5" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-golden-sm">
                            <span className="text-golden-body-sm font-medium">AI Assistant Only</span>
                            <Bot className="size-3.5 text-blue-500" />
                          </div>
                          <p className="mt-golden-3xs text-golden-label text-muted-foreground">{getModeDescription("ai_only")}</p>
                        </div>
                      </label>

                      <label htmlFor="chatbot_only" className="flex items-start gap-golden-md px-golden-lg py-golden-md border-b border-border/40 cursor-pointer transition-colors hover:bg-accent/40">
                        <RadioGroupItem value="chatbot_only" id="chatbot_only" className="mt-0.5" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-golden-sm">
                            <span className="text-golden-body-sm font-medium">Chatbot Flow Only</span>
                            <Workflow className="size-3.5 text-teal-500" />
                          </div>
                          <p className="mt-golden-3xs text-golden-label text-muted-foreground">{getModeDescription("chatbot_only")}</p>
                        </div>
                      </label>

                      <label htmlFor="chatbot_with_fallback" className="flex items-start gap-golden-md px-golden-lg py-golden-md border-b border-border/40 cursor-pointer transition-colors hover:bg-accent/40 bg-purple-500/[0.03]">
                        <RadioGroupItem value="chatbot_with_fallback" id="chatbot_with_fallback" className="mt-0.5" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-golden-sm flex-wrap">
                            <span className="text-golden-body-sm font-medium">Chatbot + AI Fallback</span>
                            <Workflow className="size-3.5 text-purple-500" />
                            <Bot className="size-3.5 text-purple-500" />
                            <Badge variant="secondary" className="text-golden-caption">Recommended</Badge>
                          </div>
                          <p className="mt-golden-3xs text-golden-label text-muted-foreground">{getModeDescription("chatbot_with_fallback")}</p>
                        </div>
                      </label>

                      <label htmlFor="manual" className="flex items-start gap-golden-md px-golden-lg py-golden-md cursor-pointer transition-colors hover:bg-accent/40">
                        <RadioGroupItem value="manual" id="manual" className="mt-0.5" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-golden-sm">
                            <span className="text-golden-body-sm font-medium">Live Chat</span>
                            <MessageSquare className="size-3.5 text-muted-foreground" />
                          </div>
                          <p className="mt-golden-3xs text-golden-label text-muted-foreground">{getModeDescription("manual")}</p>
                        </div>
                      </label>
                    </RadioGroup>
                  </div>
                </section>

                {/* Configuration */}
                {(needsAssistant || needsChatbot) && (
                  <section>
                    <h3 className="mb-golden-sm px-golden-3xs text-golden-label font-medium uppercase tracking-wide text-muted-foreground">
                      Configuration
                    </h3>
                    <div className="rounded-squircle-md border border-border/60 bg-card overflow-hidden divide-y divide-border/40">
                      {needsAssistant && (
                        <div className="px-golden-lg py-golden-md">
                          <Label className="text-golden-body-sm font-medium">AI Assistant</Label>
                          <div className="mt-golden-sm">
                            {settings.available_assistants.length === 0 ? (
                              <p className="text-golden-label text-muted-foreground">No AI assistants available. Create one in the Assistants section.</p>
                            ) : (
                              <Select value={selectedAssistantId} onValueChange={setSelectedAssistantId}>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select an AI assistant" />
                                </SelectTrigger>
                                <SelectContent>
                                  {settings.available_assistants.map((assistant) => (
                                    <SelectItem key={assistant.id} value={assistant.id.toString()}>{assistant.name}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            )}
                          </div>
                        </div>
                      )}

                      {needsChatbot && (
                        <div className="px-golden-lg py-golden-md">
                          <Label className="text-golden-body-sm font-medium">Chatbot Flows</Label>
                          <p className="mt-golden-3xs text-golden-label text-muted-foreground">Select flows — each triggers on its own keywords</p>
                          <div className="mt-golden-sm">
                            {settings.available_chatbot_flows.length === 0 ? (
                              <p className="text-golden-label text-muted-foreground">No chatbot flows available. Create one in the Chatbots section.</p>
                            ) : (
                              <div className="flex flex-col gap-golden-3xs">
                                {settings.available_chatbot_flows.map((flow) => (
                                  <label key={flow.id} htmlFor={`flow-${flow.id}`} className="flex items-start gap-golden-sm rounded-squircle-xs p-golden-xs cursor-pointer hover:bg-accent/40 transition-colors">
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
                                    <div className="flex-1 min-w-0">
                                      <span className="text-golden-body-sm font-medium">{flow.name}</span>
                                      {flow.trigger_keywords && flow.trigger_keywords.length > 0 && (
                                        <div className="mt-golden-3xs flex flex-wrap gap-golden-3xs">
                                          {flow.trigger_keywords.slice(0, 5).map((keyword, idx) => (
                                            <Badge key={idx} variant="outline" className="text-golden-caption">{keyword}</Badge>
                                          ))}
                                          {flow.trigger_keywords.length > 5 && (
                                            <Badge variant="outline" className="text-golden-caption">+{flow.trigger_keywords.length - 5} more</Badge>
                                          )}
                                        </div>
                                      )}
                                    </div>
                                  </label>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {mode === "chatbot_with_fallback" && (
                        <label htmlFor="auto_fallback" className="flex items-center gap-golden-md px-golden-lg py-golden-md cursor-pointer">
                          <Checkbox id="auto_fallback" checked={autoFallback} onCheckedChange={(checked) => setAutoFallback(checked === true)} />
                          <div className="flex-1 min-w-0">
                            <span className="text-golden-body-sm font-medium">Auto-fallback to AI</span>
                            <p className="text-golden-label text-muted-foreground">Automatically use AI when chatbot has no matching trigger</p>
                          </div>
                        </label>
                      )}
                    </div>
                  </section>
                )}

                {/* Chatbot Warnings */}
                {settings.chatbot_warnings.length > 0 && needsChatbot && (
                  <Alert className="border-amber-500/40 bg-amber-500/8">
                    <AlertTriangle className="size-4 text-amber-600" />
                    <AlertDescription>
                      <p className="text-golden-body-sm font-medium text-amber-600">Chatbot Flow Warnings</p>
                      <ul className="mt-golden-xs list-inside list-disc text-golden-label text-amber-600 flex flex-col gap-golden-3xs">
                        {settings.chatbot_warnings.map((warning, index) => (
                          <li key={index}>{warning}</li>
                        ))}
                      </ul>
                    </AlertDescription>
                  </Alert>
                )}

                {/* Save */}
                <div className="flex justify-end">
                  <Button onClick={handleSave} disabled={saving}>
                    {saving && <Loader2 className="mr-golden-xs size-4 animate-spin" />}
                    Save Changes
                  </Button>
                </div>
              </>
            ) : (
              <Alert>
                <AlertDescription>Failed to load automation settings. Please try again.</AlertDescription>
              </Alert>
            )}
          </>
        )}
      </div>
    </>
  )
}
