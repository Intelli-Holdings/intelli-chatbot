"use client"

import { useState, useEffect, useCallback } from "react"
import { usePathname } from "next/navigation"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { SettingsSearch } from "@/components/settings-search"
import useActiveOrganizationId from "@/hooks/use-organization-id"
import { useAppServices } from "@/hooks/use-app-services"
import { useWhatsAppTemplates } from "@/hooks/use-whatsapp-templates"
import { WebhookService } from "@/services/webhook"
import {
  WebhookDestinationListItem,
  InboundWebhookListItem,
  InboundWebhookLogListItem,
  InboundWebhook,
} from "@/types/webhook"
import { ChatbotAutomationService } from "@/services/chatbot-automation"

import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Switch } from "@/components/ui/switch"
import {
  ArrowDownToLine,
  ArrowUpFromLine,
  CheckCircle,
  Copy,
  Eye,
  Key,
  Loader2,
  MoreHorizontal,
  Play,
  Plus,
  RefreshCw,
  Settings2,
  Trash2,
  XCircle,
  Webhook,
} from "lucide-react"
import { toast } from "sonner"
import { logger } from "@/lib/logger"

const settingsNavigation = [
  { title: "General", href: "/dashboard/settings" },
  { title: "Automation", href: "/dashboard/settings/automation" },
  { title: "Custom Fields", href: "/dashboard/settings/custom-fields" },
  { title: "Escalation Events", href: "/dashboard/settings/escalation-events" },
  { title: "Webhooks", href: "/dashboard/settings/webhooks" },
]

const LOG_STATUS_COLORS: Record<string, string> = {
  success: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  failed: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  auth_error: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  validation_error: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  contact_not_found: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400",
  flow_inactive: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400",
}

interface ChatbotFlowOption {
  id: string
  name: string
  is_active: boolean
}

interface VariableMapping {
  key: string
  value: string
}

const FORMATTERS = [
  { value: "", label: "None", description: "Use raw value" },
  { value: "strip_plus", label: "Strip +", description: "Remove leading + from phone" },
  { value: "add_plus", label: "Add +", description: "Add leading + to phone" },
  { value: "digits_only", label: "Digits only", description: "Keep only digits" },
  { value: "lowercase", label: "Lowercase", description: "Convert to lowercase" },
  { value: "uppercase", label: "Uppercase", description: "Convert to uppercase" },
  { value: "first_name", label: "First name", description: "Extract first word" },
  { value: "trim", label: "Trim", description: "Strip whitespace" },
]

export default function WebhooksSettingsPage() {
  const pathname = usePathname()
  const organizationId = useActiveOrganizationId()

  // App services for WhatsApp
  const { appServices, loading: loadingAppServices, selectedAppService, setSelectedAppService } = useAppServices()

  // Templates (depends on selected app service)
  const { templates, loading: loadingTemplates } = useWhatsAppTemplates(selectedAppService)

  // State for destinations (outbound webhooks)
  const [destinations, setDestinations] = useState<WebhookDestinationListItem[]>([])
  const [loadingDestinations, setLoadingDestinations] = useState(false)

  // State for inbound webhooks
  const [inboundWebhooks, setInboundWebhooks] = useState<InboundWebhookListItem[]>([])
  const [loadingInbound, setLoadingInbound] = useState(false)

  // State for available flows
  const [availableFlows, setAvailableFlows] = useState<ChatbotFlowOption[]>([])

  // Dialog states
  const [showCreateDestination, setShowCreateDestination] = useState(false)
  const [showCreateInbound, setShowCreateInbound] = useState(false)
  const [testingId, setTestingId] = useState<string | null>(null)

  // API key display dialog (shown after creation)
  const [createdWebhook, setCreatedWebhook] = useState<InboundWebhook | null>(null)

  // Logs dialog
  const [logsWebhookId, setLogsWebhookId] = useState<string | null>(null)
  const [logsWebhookName, setLogsWebhookName] = useState("")
  const [logs, setLogs] = useState<InboundWebhookLogListItem[]>([])
  const [loadingLogs, setLoadingLogs] = useState(false)

  // Form states for create destination dialog
  const [destName, setDestName] = useState("")
  const [destUrl, setDestUrl] = useState("")
  const [destMethod, setDestMethod] = useState<"POST" | "GET" | "PUT" | "PATCH">("POST")
  const [destSigningSecret, setDestSigningSecret] = useState("")
  const [savingDest, setSavingDest] = useState(false)

  // Form states for create inbound webhook dialog
  const [inboundName, setInboundName] = useState("")
  const [inboundActionType, setInboundActionType] = useState<"start_flow" | "send_template">("start_flow")
  const [inboundFlowId, setInboundFlowId] = useState("")
  const [inboundTemplateId, setInboundTemplateId] = useState("")
  const [inboundTemplateName, setInboundTemplateName] = useState("")
  const [inboundAppServiceId, setInboundAppServiceId] = useState<number | null>(null)
  const [inboundRequireAuth, setInboundRequireAuth] = useState(false)
  const [savingInbound, setSavingInbound] = useState(false)

  // Configure mapping dialog
  const [configWebhook, setConfigWebhook] = useState<InboundWebhook | null>(null)
  const [configPayloadKeys, setConfigPayloadKeys] = useState<string[]>([])
  const [configMappings, setConfigMappings] = useState<VariableMapping[]>([])
  const [configContactField, setConfigContactField] = useState("")
  const [configContactFormatter, setConfigContactFormatter] = useState("")
  const [configCreateContact, setConfigCreateContact] = useState(true)
  const [configLoading, setConfigLoading] = useState(false)
  const [configSaving, setConfigSaving] = useState(false)

  // Fetch destinations
  useEffect(() => {
    const fetchDestinations = async () => {
      if (!organizationId) return
      setLoadingDestinations(true)
      try {
        const data = await WebhookService.getDestinations(organizationId)
        setDestinations(data)
      } catch (error) {
        logger.error("Error fetching webhook destinations", { error: error instanceof Error ? error.message : String(error) })
        toast.error("Failed to load webhook destinations")
      } finally {
        setLoadingDestinations(false)
      }
    }
    fetchDestinations()
  }, [organizationId])

  // Fetch inbound webhooks
  useEffect(() => {
    const fetchInbound = async () => {
      if (!organizationId) return
      setLoadingInbound(true)
      try {
        const data = await WebhookService.getInboundWebhooks(organizationId)
        setInboundWebhooks(data)
      } catch (error) {
        logger.error("Error fetching inbound webhooks", { error: error instanceof Error ? error.message : String(error) })
        toast.error("Failed to load inbound webhooks")
      } finally {
        setLoadingInbound(false)
      }
    }
    fetchInbound()
  }, [organizationId])

  // Fetch available flows
  useEffect(() => {
    const fetchFlows = async () => {
      if (!organizationId) return
      try {
        const flows = await ChatbotAutomationService.getChatbots(organizationId)
        setAvailableFlows(flows.map(f => ({
          id: f.id,
          name: f.name,
          is_active: f.isActive,
        })))
      } catch (error) {
        logger.error("Error fetching flows", { error: error instanceof Error ? error.message : String(error) })
      }
    }
    fetchFlows()
  }, [organizationId])

  // Auto-select first app service for inbound webhook form
  useEffect(() => {
    if (appServices.length > 0 && !inboundAppServiceId) {
      setInboundAppServiceId(appServices[0].id)
    }
  }, [appServices, inboundAppServiceId])

  // Full form reset
  const resetInboundForm = useCallback(() => {
    setInboundName("")
    setInboundFlowId("")
    setInboundTemplateId("")
    setInboundTemplateName("")
    setInboundActionType("start_flow")
    setInboundAppServiceId(appServices.length > 0 ? appServices[0].id : null)
    setInboundRequireAuth(false)
  }, [appServices])

  // Reset form when dialog closes
  const handleInboundDialogChange = (open: boolean) => {
    setShowCreateInbound(open)
    if (!open) {
      resetInboundForm()
    }
  }

  // Reset destination form when dialog closes
  const handleDestDialogChange = (open: boolean) => {
    setShowCreateDestination(open)
    if (!open) {
      setDestName("")
      setDestUrl("")
      setDestMethod("POST")
      setDestSigningSecret("")
    }
  }

  // Create destination
  const handleCreateDestination = async () => {
    if (!organizationId || !destName || !destUrl) {
      toast.error("Please fill in all required fields")
      return
    }

    if (!WebhookService.isValidWebhookUrl(destUrl)) {
      toast.error("Please enter a valid URL starting with http:// or https://")
      return
    }

    setSavingDest(true)
    try {
      const newDest = await WebhookService.createDestination({
        organization: organizationId,
        name: destName,
        url: destUrl,
        method: destMethod,
        signing_secret: destSigningSecret || undefined,
      })
      setDestinations([...destinations, newDest])
      setShowCreateDestination(false)
      toast.success("Webhook destination created successfully")
    } catch (error) {
      logger.error("Error creating destination", { error: error instanceof Error ? error.message : String(error) })
      toast.error(error instanceof Error ? error.message : "Failed to create webhook destination")
    } finally {
      setSavingDest(false)
    }
  }

  // Create inbound webhook
  const handleCreateInbound = async () => {
    if (!organizationId || !inboundName) {
      toast.error("Please fill in all required fields")
      return
    }

    if (inboundActionType === "start_flow" && !inboundFlowId) {
      toast.error("Please select a chatbot flow")
      return
    }

    if (inboundActionType === "send_template" && !inboundTemplateId) {
      toast.error("Please select a template")
      return
    }

    if (!inboundAppServiceId) {
      toast.error("Please select a WhatsApp number")
      return
    }

    setSavingInbound(true)
    try {
      const newInbound = await WebhookService.createInboundWebhook({
        organization: organizationId,
        name: inboundName,
        action_type: inboundActionType,
        flow: inboundActionType === "start_flow" ? inboundFlowId : undefined,
        template_id: inboundActionType === "send_template" ? inboundTemplateId : undefined,
        template_name: inboundActionType === "send_template" ? inboundTemplateName : undefined,
        app_service: inboundAppServiceId,
        require_auth: inboundRequireAuth,
      })

      // Add to list (use the returned data which has list-compatible fields)
      setInboundWebhooks(prev => [...prev, {
        id: newInbound.id,
        name: newInbound.name,
        slug: newInbound.slug,
        webhook_url: newInbound.webhook_url,
        action_type: newInbound.action_type,
        flow: newInbound.flow,
        flow_name: newInbound.flow_name,
        template_name: newInbound.template_name,
        is_active: newInbound.is_active,
        require_auth: newInbound.require_auth,
        trigger_count: newInbound.trigger_count,
        last_triggered_at: newInbound.last_triggered_at,
      }])

      setShowCreateInbound(false)

      // Show the API key dialog
      setCreatedWebhook(newInbound)

      toast.success("Inbound webhook created successfully")
    } catch (error) {
      logger.error("Error creating inbound webhook", { error: error instanceof Error ? error.message : String(error) })
      toast.error(error instanceof Error ? error.message : "Failed to create inbound webhook")
    } finally {
      setSavingInbound(false)
    }
  }

  // Test inbound webhook
  const handleTestInbound = async (webhook: InboundWebhookListItem) => {
    setTestingId(webhook.id)
    try {
      const samplePayload = WebhookService.generateSamplePayload("phone_number")
      const result = await WebhookService.testInboundWebhook(webhook.id, {
        payload: samplePayload,
      })
      if (result.success) {
        toast.success(result.message || "Webhook test successful")
      } else {
        toast.error(`Test failed: ${result.error || "Unknown error"}`)
      }
    } catch (error) {
      logger.error("Error testing inbound webhook", { error: error instanceof Error ? error.message : String(error) })
      toast.error(error instanceof Error ? error.message : "Failed to test webhook")
    } finally {
      setTestingId(null)
    }
  }

  // View logs
  const handleViewLogs = async (webhookId: string, webhookName: string) => {
    setLogsWebhookId(webhookId)
    setLogsWebhookName(webhookName)
    setLoadingLogs(true)
    try {
      const data = await WebhookService.getInboundWebhookLogs(webhookId, { limit: 50 })
      setLogs(data)
    } catch (error) {
      logger.error("Error fetching logs", { error: error instanceof Error ? error.message : String(error) })
      toast.error("Failed to load webhook logs")
    } finally {
      setLoadingLogs(false)
    }
  }

  // Copy API key from webhook detail
  const handleCopyApiKey = async (webhookId: string) => {
    try {
      const detail = await WebhookService.getInboundWebhook(webhookId)
      await navigator.clipboard.writeText(detail.api_key)
      toast.success("API key copied to clipboard")
    } catch (error) {
      toast.error("Failed to copy API key")
    }
  }

  // Regenerate API key
  const handleRegenerateApiKey = async (webhookId: string) => {
    if (!confirm("Are you sure? The old API key will stop working immediately.")) return

    try {
      const result = await WebhookService.regenerateApiKey(webhookId)
      await navigator.clipboard.writeText(result.api_key)
      toast.success("New API key generated and copied to clipboard")
    } catch (error) {
      logger.error("Error regenerating API key", { error: error instanceof Error ? error.message : String(error) })
      toast.error("Failed to regenerate API key")
    }
  }

  // Test destination
  const handleTestDestination = async (id: string) => {
    setTestingId(id)
    try {
      const result = await WebhookService.testDestination(id)
      if (result.success) {
        toast.success(`Webhook test successful (${result.status_code}, ${result.response_time_ms}ms)`)
      } else {
        toast.error(`Webhook test failed: ${result.error}`)
      }
    } catch (error) {
      logger.error("Error testing destination", { error: error instanceof Error ? error.message : String(error) })
      toast.error("Failed to test webhook")
    } finally {
      setTestingId(null)
    }
  }

  // Toggle destination status
  const handleToggleDestination = async (id: string, currentStatus: boolean) => {
    try {
      await WebhookService.toggleDestination(id, !currentStatus)
      setDestinations(destinations.map(d =>
        d.id === id ? { ...d, is_active: !currentStatus } : d
      ))
      toast.success(currentStatus ? "Webhook destination disabled" : "Webhook destination enabled")
    } catch (error) {
      logger.error("Error toggling destination", { error: error instanceof Error ? error.message : String(error) })
      toast.error("Failed to update webhook status")
    }
  }

  // Delete destination
  const handleDeleteDestination = async (id: string) => {
    if (!confirm("Are you sure you want to delete this webhook destination?")) return

    try {
      await WebhookService.deleteDestination(id)
      setDestinations(destinations.filter(d => d.id !== id))
      toast.success("Webhook destination deleted")
    } catch (error) {
      logger.error("Error deleting destination", { error: error instanceof Error ? error.message : String(error) })
      toast.error("Failed to delete webhook destination")
    }
  }

  // Toggle inbound webhook status
  const handleToggleInbound = async (id: string, currentStatus: boolean) => {
    try {
      await WebhookService.toggleInboundWebhook(id, !currentStatus)
      setInboundWebhooks(inboundWebhooks.map(w =>
        w.id === id ? { ...w, is_active: !currentStatus } : w
      ))
      toast.success(currentStatus ? "Inbound webhook disabled" : "Inbound webhook enabled")
    } catch (error) {
      logger.error("Error toggling inbound webhook", { error: error instanceof Error ? error.message : String(error) })
      toast.error("Failed to update webhook status")
    }
  }

  // Delete inbound webhook
  const handleDeleteInbound = async (id: string) => {
    if (!confirm("Are you sure you want to delete this inbound webhook?")) return

    try {
      await WebhookService.deleteInboundWebhook(id)
      setInboundWebhooks(inboundWebhooks.filter(w => w.id !== id))
      toast.success("Inbound webhook deleted")
    } catch (error) {
      logger.error("Error deleting inbound webhook", { error: error instanceof Error ? error.message : String(error) })
      toast.error("Failed to delete inbound webhook")
    }
  }

  // Copy webhook URL
  const handleCopyUrl = async (url: string) => {
    try {
      await WebhookService.copyWebhookUrl(url)
      toast.success("Webhook URL copied to clipboard")
    } catch (error) {
      toast.error("Failed to copy URL")
    }
  }

  // Format date
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Never"
    return new Date(dateString).toLocaleString()
  }

  // Handle template selection
  const handleTemplateSelect = (templateId: string) => {
    setInboundTemplateId(templateId)
    const template = templates.find(t => t.id === templateId)
    if (template) {
      setInboundTemplateName(template.name)
    }
  }

  // Flatten nested object keys into dot-notation paths
  const flattenKeys = (obj: Record<string, unknown>, prefix = ""): string[] => {
    const keys: string[] = []
    for (const [key, value] of Object.entries(obj)) {
      const path = prefix ? `${prefix}.${key}` : key
      keys.push(path)
      if (value && typeof value === "object" && !Array.isArray(value)) {
        keys.push(...flattenKeys(value as Record<string, unknown>, path))
      } else if (Array.isArray(value) && value.length > 0 && typeof value[0] === "object") {
        // Flatten first array element: attendees.0.email
        keys.push(...flattenKeys(value[0] as Record<string, unknown>, `${path}.0`))
      }
    }
    return keys
  }

  // Open configure mapping dialog
  const handleConfigureMapping = async (webhookId: string) => {
    setConfigLoading(true)
    setConfigPayloadKeys([])
    setConfigMappings([])
    setConfigContactField("")
    setConfigContactFormatter("")
    setConfigCreateContact(true)

    try {
      // Fetch full webhook detail (has current mapping)
      const webhook = await WebhookService.getInboundWebhook(webhookId)
      setConfigWebhook(webhook)

      // Parse contact_match_field — may contain "|formatter"
      const matchField = webhook.contact_match_field || ""
      const [fieldPath, formatter] = matchField.split("|")
      setConfigContactField(fieldPath.trim())
      setConfigContactFormatter(formatter?.trim() || "")
      setConfigCreateContact(webhook.create_contact_if_missing)

      // Load existing mappings
      const existingMapping = webhook.action_type === "send_template"
        ? webhook.template_variable_mapping
        : webhook.flow_variable_mapping

      if (existingMapping && Object.keys(existingMapping).length > 0) {
        setConfigMappings(
          Object.entries(existingMapping).map(([key, value]) => ({ key, value }))
        )
      }

      // Fetch latest log to get a sample payload (non-critical — don't fail if this errors)
      try {
        const logs = await WebhookService.getInboundWebhookLogs(webhookId, { limit: 1 })
        if (logs.length > 0) {
          const fullLog = await WebhookService.getInboundWebhookLog(webhookId, logs[0].id)
          if (fullLog.payload && typeof fullLog.payload === "object") {
            const keys = flattenKeys(fullLog.payload as Record<string, unknown>)
            setConfigPayloadKeys(keys)
          }
        }
      } catch (logError) {
        // Log fetch failed — user can still configure manually
        logger.warn("Could not fetch payload logs", { error: logError instanceof Error ? logError.message : String(logError) })
      }
    } catch (error) {
      logger.error("Error loading webhook config", { error: error instanceof Error ? error.message : String(error) })
      toast.error("Failed to load webhook details")
      setConfigWebhook(null)
    } finally {
      setConfigLoading(false)
    }
  }

  // Save variable mapping
  const handleSaveMapping = async () => {
    if (!configWebhook) return

    if (!configContactField) {
      toast.error("Please select a contact match field")
      return
    }

    const mapping: Record<string, string> = {}
    configMappings.forEach(m => {
      if (m.key && m.value) mapping[m.key] = m.value
    })

    setConfigSaving(true)
    try {
      const variableMapping = configWebhook.action_type === "send_template"
        ? { template_variable_mapping: mapping }
        : { flow_variable_mapping: mapping }

      // Combine contact field + formatter: "attendees.0.phone|strip_plus"
      const contactMatchField = configContactFormatter
        ? `${configContactField}|${configContactFormatter}`
        : configContactField

      await WebhookService.updateInboundWebhook(configWebhook.id, {
        ...variableMapping,
        contact_match_field: contactMatchField,
        create_contact_if_missing: configCreateContact,
      })
      toast.success("Webhook configuration saved")
      setConfigWebhook(null)
    } catch (error) {
      logger.error("Error saving mapping", { error: error instanceof Error ? error.message : String(error) })
      toast.error("Failed to save variable mapping")
    } finally {
      setConfigSaving(false)
    }
  }

  const addConfigMapping = () => {
    setConfigMappings(prev => [...prev, {
      key: configWebhook?.action_type === "send_template" ? String(prev.length + 1) : "",
      value: ""
    }])
  }

  const updateConfigMapping = (index: number, field: "key" | "value", val: string) => {
    setConfigMappings(prev => prev.map((m, i) => i === index ? { ...m, [field]: val } : m))
  }

  const removeConfigMapping = (index: number) => {
    setConfigMappings(prev => prev.filter((_, i) => i !== index))
  }

  return (
    <div className="flex min-h-screen bg-background">
      {/* Left Sidebar Navigation */}
      <aside className="w-64 border-r border-border bg-card">
        <div className="sticky top-0 flex h-screen flex-col">
          <div className="border-b border-border p-6">
            <h1 className="text-2xl font-bold">Settings</h1>
            <Link
              href="/dashboard"
              className="mt-2 flex items-center text-sm text-muted-foreground hover:text-foreground"
            >
              <span>&larr; Go to Dashboard</span>
            </Link>
          </div>

          <div className="border-b border-border p-4">
            <SettingsSearch />
          </div>

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
        <div className="mx-auto max-w-5xl">
          <div className="mb-8">
            <div className="flex items-center gap-3">
              <Webhook className="size-8 text-primary" />
              <div>
                <h2 className="text-3xl font-bold">Webhooks</h2>
                <p className="mt-1 text-muted-foreground">
                  Manage outbound and inbound webhooks for your organization
                </p>
              </div>
            </div>
          </div>

          {!organizationId ? (
            <Alert>
              <AlertDescription>Loading organization...</AlertDescription>
            </Alert>
          ) : (
            <Tabs defaultValue="outbound" className="space-y-6">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="outbound" className="flex items-center gap-2">
                  <ArrowUpFromLine className="size-4" />
                  Outbound Webhooks
                </TabsTrigger>
                <TabsTrigger value="inbound" className="flex items-center gap-2">
                  <ArrowDownToLine className="size-4" />
                  Inbound Webhooks
                </TabsTrigger>
              </TabsList>

              {/* Outbound Webhooks Tab */}
              <TabsContent value="outbound" className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold">Webhook Destinations</h3>
                    <p className="text-sm text-muted-foreground">
                      Send data to external systems like CRM, Make, Zapier, and more
                    </p>
                  </div>
                  <Dialog open={showCreateDestination} onOpenChange={handleDestDialogChange}>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="mr-2 size-4" />
                        Add Destination
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Add Webhook Destination</DialogTitle>
                        <DialogDescription>
                          Create a new endpoint to send webhook data to
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="dest-name">Name</Label>
                          <Input
                            id="dest-name"
                            value={destName}
                            onChange={(e) => setDestName(e.target.value)}
                            placeholder="e.g., Zapier Lead Capture"
                          />
                        </div>
                        <div>
                          <Label htmlFor="dest-url">Webhook URL</Label>
                          <Input
                            id="dest-url"
                            value={destUrl}
                            onChange={(e) => setDestUrl(e.target.value)}
                            placeholder="https://hooks.zapier.com/..."
                          />
                        </div>
                        <div>
                          <Label htmlFor="dest-method">HTTP Method</Label>
                          <Select value={destMethod} onValueChange={(v) => setDestMethod(v as "POST" | "GET" | "PUT" | "PATCH")}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="POST">POST</SelectItem>
                              <SelectItem value="GET">GET</SelectItem>
                              <SelectItem value="PUT">PUT</SelectItem>
                              <SelectItem value="PATCH">PATCH</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="dest-secret">
                            Signing Secret <span className="text-muted-foreground">(optional)</span>
                          </Label>
                          <Input
                            id="dest-secret"
                            value={destSigningSecret}
                            onChange={(e) => setDestSigningSecret(e.target.value)}
                            placeholder="For HMAC-SHA256 signature verification"
                            type="password"
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setShowCreateDestination(false)}>
                          Cancel
                        </Button>
                        <Button onClick={handleCreateDestination} disabled={savingDest}>
                          {savingDest && <Loader2 className="mr-2 size-4 animate-spin" />}
                          Create Destination
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>

                {loadingDestinations ? (
                  <div className="space-y-3">
                    <Skeleton className="h-16 w-full" />
                    <Skeleton className="h-16 w-full" />
                  </div>
                ) : destinations.length === 0 ? (
                  <div className="rounded-lg border border-dashed border-border p-8 text-center">
                    <ArrowUpFromLine className="mx-auto size-12 text-muted-foreground" />
                    <h3 className="mt-4 font-semibold">No webhook destinations</h3>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Create a destination to start sending data to external systems
                    </p>
                  </div>
                ) : (
                  <div className="rounded-lg border border-border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>URL</TableHead>
                          <TableHead>Method</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Stats</TableHead>
                          <TableHead className="w-[100px]"></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {destinations.map((dest) => (
                          <TableRow key={dest.id}>
                            <TableCell className="font-medium">{dest.name}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <code className="max-w-[200px] truncate text-xs">
                                  {WebhookService.formatWebhookUrl(dest.url, 35)}
                                </code>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="size-6"
                                  onClick={() => handleCopyUrl(dest.url)}
                                >
                                  <Copy className="size-3" />
                                </Button>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">{dest.method}</Badge>
                            </TableCell>
                            <TableCell>
                              <Switch
                                checked={dest.is_active}
                                onCheckedChange={() => handleToggleDestination(dest.id, dest.is_active)}
                              />
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2 text-xs">
                                <span className="flex items-center gap-1 text-green-600">
                                  <CheckCircle className="size-3" />
                                  {dest.success_count}
                                </span>
                                <span className="flex items-center gap-1 text-red-600">
                                  <XCircle className="size-3" />
                                  {dest.failure_count}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon">
                                    <MoreHorizontal className="size-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem
                                    onClick={() => handleTestDestination(dest.id)}
                                    disabled={testingId === dest.id}
                                  >
                                    {testingId === dest.id ? (
                                      <Loader2 className="mr-2 size-4 animate-spin" />
                                    ) : (
                                      <Play className="mr-2 size-4" />
                                    )}
                                    Test Webhook
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => handleDeleteDestination(dest.id)}
                                    className="text-red-600"
                                  >
                                    <Trash2 className="mr-2 size-4" />
                                    Delete
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </TabsContent>

              {/* Inbound Webhooks Tab */}
              <TabsContent value="inbound" className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold">Inbound Webhooks</h3>
                    <p className="text-sm text-muted-foreground">
                      Receive triggers from external systems to start flows or send templates
                    </p>
                  </div>

                  {/* Create Inbound Webhook Dialog */}
                  <Dialog open={showCreateInbound} onOpenChange={handleInboundDialogChange}>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="mr-2 size-4" />
                        Create Webhook
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-lg">
                      <DialogHeader>
                        <DialogTitle>Create Inbound Webhook</DialogTitle>
                        <DialogDescription>
                          Create a webhook URL to receive triggers from external systems
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                        <div>
                          <Label htmlFor="inbound-name">Name</Label>
                          <Input
                            id="inbound-name"
                            value={inboundName}
                            onChange={(e) => setInboundName(e.target.value)}
                            placeholder="e.g., Cal.com Booking, New Lead from Website"
                          />
                        </div>

                        <div>
                          <Label htmlFor="inbound-appservice">WhatsApp Number</Label>
                          {loadingAppServices ? (
                            <Skeleton className="h-10 w-full" />
                          ) : appServices.length === 0 ? (
                            <Alert>
                              <AlertDescription>
                                No WhatsApp numbers configured.
                              </AlertDescription>
                            </Alert>
                          ) : (
                            <Select
                              value={inboundAppServiceId?.toString() || ""}
                              onValueChange={(v) => setInboundAppServiceId(parseInt(v))}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select WhatsApp number..." />
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

                        <div>
                          <Label htmlFor="inbound-action">Action Type</Label>
                          <Select value={inboundActionType} onValueChange={(v) => setInboundActionType(v as "start_flow" | "send_template")}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="start_flow">Start Chatbot Flow</SelectItem>
                              <SelectItem value="send_template">Send Template Message</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        {inboundActionType === "start_flow" && (
                          <div>
                            <Label htmlFor="inbound-flow">Chatbot Flow</Label>
                            {availableFlows.length === 0 ? (
                              <Alert>
                                <AlertDescription>
                                  No chatbot flows available. Create one first.
                                </AlertDescription>
                              </Alert>
                            ) : (
                              <Select value={inboundFlowId} onValueChange={setInboundFlowId}>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select a flow..." />
                                </SelectTrigger>
                                <SelectContent>
                                  {availableFlows.map((flow) => (
                                    <SelectItem key={flow.id} value={flow.id}>
                                      <span className="flex items-center gap-2">
                                        {flow.name}
                                        {!flow.is_active && (
                                          <Badge variant="secondary" className="text-xs">
                                            Inactive
                                          </Badge>
                                        )}
                                      </span>
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            )}
                          </div>
                        )}

                        {inboundActionType === "send_template" && (
                          <div>
                            <Label htmlFor="inbound-template">Template</Label>
                            {loadingTemplates ? (
                              <Skeleton className="h-10 w-full" />
                            ) : templates.length === 0 ? (
                              <Alert>
                                <AlertDescription>
                                  No templates available. Select a WhatsApp number first or create templates.
                                </AlertDescription>
                              </Alert>
                            ) : (
                              <Select value={inboundTemplateId} onValueChange={handleTemplateSelect}>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select a template..." />
                                </SelectTrigger>
                                <SelectContent className="max-h-60">
                                  {templates
                                    .filter(t => t.status === "APPROVED")
                                    .map((template) => (
                                      <SelectItem key={template.id} value={template.id}>
                                        <span className="flex items-center gap-2">
                                          {template.name}
                                          <Badge variant="outline" className="text-xs">
                                            {template.category}
                                          </Badge>
                                        </span>
                                      </SelectItem>
                                    ))}
                                </SelectContent>
                              </Select>
                            )}
                            <p className="mt-1 text-xs text-muted-foreground">
                              You can map payload fields to template variables after receiving the first webhook.
                            </p>
                          </div>
                        )}

                        <div className="rounded-lg border border-border p-3 space-y-2">
                          <div className="flex items-center justify-between">
                            <div>
                              <Label>Require API Key</Label>
                              <p className="text-xs text-muted-foreground">
                                Require <code className="text-xs">X-API-Key</code> header for authentication
                              </p>
                            </div>
                            <Switch
                              checked={inboundRequireAuth}
                              onCheckedChange={setInboundRequireAuth}
                            />
                          </div>
                          {inboundRequireAuth && (
                            <p className="text-xs text-muted-foreground bg-muted/50 rounded p-2">
                              An API key will be generated after creation. Add it as a custom header
                              (<code className="text-xs">X-API-Key</code>) in your third-party service (e.g. Cal.com → Custom Headers).
                            </p>
                          )}
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setShowCreateInbound(false)}>
                          Cancel
                        </Button>
                        <Button onClick={handleCreateInbound} disabled={savingInbound}>
                          {savingInbound && <Loader2 className="mr-2 size-4 animate-spin" />}
                          Create Webhook
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>

                {loadingInbound ? (
                  <div className="space-y-3">
                    <Skeleton className="h-16 w-full" />
                    <Skeleton className="h-16 w-full" />
                  </div>
                ) : inboundWebhooks.length === 0 ? (
                  <div className="rounded-lg border border-dashed border-border p-8 text-center">
                    <ArrowDownToLine className="mx-auto size-12 text-muted-foreground" />
                    <h3 className="mt-4 font-semibold">No inbound webhooks</h3>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Create a webhook to receive triggers from external systems
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {inboundWebhooks.map((webhook) => (
                      <div
                        key={webhook.id}
                        className="rounded-lg border border-border bg-card p-4"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3">
                              <h4 className="font-semibold">{webhook.name}</h4>
                              <Badge variant={webhook.is_active ? "default" : "secondary"}>
                                {webhook.is_active ? "Active" : "Inactive"}
                              </Badge>
                              <Badge variant="outline">
                                {webhook.action_type === "start_flow" ? "Start Flow" : "Send Template"}
                              </Badge>
                            </div>
                            {webhook.webhook_url && (
                              <div className="mt-2 flex items-center gap-2">
                                <code className="rounded bg-muted px-2 py-1 text-xs">
                                  {webhook.webhook_url}
                                </code>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="size-6"
                                  onClick={() => handleCopyUrl(webhook.webhook_url)}
                                >
                                  <Copy className="size-3" />
                                </Button>
                              </div>
                            )}
                            <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
                              {webhook.flow_name && (
                                <span>Flow: {webhook.flow_name}</span>
                              )}
                              {webhook.template_name && (
                                <span>Template: {webhook.template_name}</span>
                              )}
                              <span>Triggers: {webhook.trigger_count}</span>
                              <span>Last: {formatDate(webhook.last_triggered_at)}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Switch
                              checked={webhook.is_active}
                              onCheckedChange={() => handleToggleInbound(webhook.id, webhook.is_active)}
                            />
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreHorizontal className="size-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => webhook.webhook_url && handleCopyUrl(webhook.webhook_url)}>
                                  <Copy className="mr-2 size-4" />
                                  Copy URL
                                </DropdownMenuItem>
                                {webhook.require_auth && (
                                  <>
                                    <DropdownMenuItem onClick={() => handleCopyApiKey(webhook.id)}>
                                      <Key className="mr-2 size-4" />
                                      Copy API Key
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleRegenerateApiKey(webhook.id)}>
                                      <RefreshCw className="mr-2 size-4" />
                                      Regenerate API Key
                                    </DropdownMenuItem>
                                  </>
                                )}
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => handleConfigureMapping(webhook.id)}>
                                  <Settings2 className="mr-2 size-4" />
                                  Configure Webhook
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => handleTestInbound(webhook)}
                                  disabled={testingId === webhook.id}
                                >
                                  {testingId === webhook.id ? (
                                    <Loader2 className="mr-2 size-4 animate-spin" />
                                  ) : (
                                    <Play className="mr-2 size-4" />
                                  )}
                                  Test Webhook
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleViewLogs(webhook.id, webhook.name)}>
                                  <Eye className="mr-2 size-4" />
                                  View Logs
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onClick={() => handleDeleteInbound(webhook.id)}
                                  className="text-red-600"
                                >
                                  <Trash2 className="mr-2 size-4" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          )}
        </div>
      </main>

      {/* API Key Display Dialog (shown after creation) */}
      <Dialog open={!!createdWebhook} onOpenChange={(open) => !open && setCreatedWebhook(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Webhook Created Successfully</DialogTitle>
            <DialogDescription>
              {createdWebhook?.require_auth
                ? "Save these credentials. The API key will not be shown again."
                : "Copy the webhook URL and paste it into your third-party service."}
            </DialogDescription>
          </DialogHeader>
          {createdWebhook && (
            <div className="space-y-4">
              <div>
                <Label className="text-xs text-muted-foreground">Webhook URL</Label>
                <div className="mt-1 flex items-center gap-2">
                  <code className="flex-1 rounded bg-muted px-3 py-2 text-xs break-all">
                    {createdWebhook.webhook_url}
                  </code>
                  <Button
                    variant="outline"
                    size="icon"
                    className="shrink-0"
                    onClick={() => handleCopyUrl(createdWebhook.webhook_url)}
                  >
                    <Copy className="size-4" />
                  </Button>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  Paste this URL in your third-party service (e.g. Cal.com, Zapier, Make).
                </p>
              </div>
              {createdWebhook.require_auth && (
                <div>
                  <Label className="text-xs text-muted-foreground">API Key</Label>
                  <div className="mt-1 flex items-center gap-2">
                    <code className="flex-1 rounded bg-muted px-3 py-2 text-xs break-all font-mono">
                      {createdWebhook.api_key}
                    </code>
                    <Button
                      variant="outline"
                      size="icon"
                      className="shrink-0"
                      onClick={async () => {
                        await navigator.clipboard.writeText(createdWebhook.api_key)
                        toast.success("API key copied to clipboard")
                      }}
                    >
                      <Copy className="size-4" />
                    </Button>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Add this as a custom header in your third-party service: <code className="text-xs">X-API-Key: {createdWebhook.api_key}</code>
                  </p>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setCreatedWebhook(null)}>Done</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Logs Viewer Dialog */}
      <Dialog open={!!logsWebhookId} onOpenChange={(open) => !open && setLogsWebhookId(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Webhook Logs: {logsWebhookName}</DialogTitle>
            <DialogDescription>
              Recent webhook trigger history and processing results
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-[60vh] overflow-y-auto">
            {loadingLogs ? (
              <div className="space-y-2">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            ) : logs.length === 0 ? (
              <div className="py-8 text-center text-sm text-muted-foreground">
                No logs yet. Trigger the webhook to see results here.
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Time</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>IP</TableHead>
                    <TableHead>Error</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {logs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="text-xs whitespace-nowrap">
                        {new Date(log.received_at).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Badge className={cn("text-xs", LOG_STATUS_COLORS[log.status] || "")}>
                          {log.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs">
                        {log.processing_time_ms}ms
                      </TableCell>
                      <TableCell className="text-xs font-mono">
                        {log.ip_address}
                      </TableCell>
                      <TableCell className="max-w-[200px] text-xs text-muted-foreground">
                        {log.error_message ? (
                          <span className="line-clamp-2" title={log.error_message}>
                            {log.error_message}
                          </span>
                        ) : (
                          <span className="text-green-600">OK</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setLogsWebhookId(null)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Configure Webhook Mapping Dialog */}
      <Dialog open={!!configWebhook} onOpenChange={(open) => !open && setConfigWebhook(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Configure Webhook</DialogTitle>
            <DialogDescription>
              Set up contact matching and variable mapping using data from the received payload.
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-[60vh] space-y-4 overflow-y-auto pr-2">
            {configLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            ) : (
              <>
                {/* Show detected payload fields */}
                {configPayloadKeys.length > 0 ? (
                  <div>
                    <Label className="text-xs text-muted-foreground">Detected payload fields (from last received data)</Label>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {configPayloadKeys.map((key) => (
                        <Badge
                          key={key}
                          variant="outline"
                          className="cursor-pointer text-xs font-mono hover:bg-accent"
                          onClick={() => {
                            // Auto-add to mapping when clicked
                            const newKey = configWebhook?.action_type === "send_template"
                              ? String(configMappings.length + 1)
                              : key
                            const newValue = configWebhook?.action_type === "send_template"
                              ? key
                              : ""
                            setConfigMappings(prev => [...prev, { key: newKey, value: newValue }])
                          }}
                        >
                          {key}
                        </Badge>
                      ))}
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">Click a field to add it to the mapping below.</p>
                  </div>
                ) : (
                  <Alert>
                    <AlertDescription className="text-xs">
                      No payload data detected yet. Send a test request from your external service first, then come back here to map the fields.
                    </AlertDescription>
                  </Alert>
                )}

                {/* Contact match field */}
                <div className="space-y-2">
                  <Label>Contact Match Field</Label>
                  <p className="text-xs text-muted-foreground">
                    Which payload field identifies the contact? (phone number or email)
                  </p>
                  {configPayloadKeys.length > 0 ? (
                    <Select
                      value={configPayloadKeys.includes(configContactField) ? configContactField : "_custom"}
                      onValueChange={(v) => {
                        if (v !== "_custom") setConfigContactField(v)
                      }}
                    >
                      <SelectTrigger className="h-9">
                        <SelectValue placeholder="Select a payload field..." />
                      </SelectTrigger>
                      <SelectContent className="max-h-48">
                        {configPayloadKeys.map((k) => (
                          <SelectItem key={k} value={k}>
                            <code className="text-xs">{k}</code>
                          </SelectItem>
                        ))}
                        <SelectItem value="_custom">Type custom path...</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : null}
                  {(configPayloadKeys.length === 0 || !configPayloadKeys.includes(configContactField)) && (
                    <Input
                      value={configContactField}
                      onChange={(e) => setConfigContactField(e.target.value)}
                      placeholder="e.g., attendees.0.email or phone_number"
                      className="h-9 text-sm"
                    />
                  )}
                  <div>
                    <Label className="text-xs text-muted-foreground">Formatter (optional)</Label>
                    <Select
                      value={configContactFormatter || "_none"}
                      onValueChange={(v) => setConfigContactFormatter(v === "_none" ? "" : v)}
                    >
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {FORMATTERS.map((f) => (
                          <SelectItem key={f.value || "_none"} value={f.value || "_none"}>
                            <span className="flex items-center gap-2">
                              <span className="text-xs">{f.label}</span>
                              <span className="text-xs text-muted-foreground">{f.description}</span>
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center justify-between rounded-lg border border-border p-3">
                    <div>
                      <Label className="text-sm">Create contact if not found</Label>
                      <p className="text-xs text-muted-foreground">
                        Auto-create a new contact from the payload data
                      </p>
                    </div>
                    <Switch
                      checked={configCreateContact}
                      onCheckedChange={setConfigCreateContact}
                    />
                  </div>
                </div>

                {/* Variable mapping rows */}
                <div>
                  <div className="flex items-center justify-between">
                    <Label>
                      {configWebhook?.action_type === "send_template"
                        ? "Template Variable Mappings"
                        : "Flow Variable Mappings"}
                    </Label>
                    <Button variant="ghost" size="sm" onClick={addConfigMapping} className="h-7 text-xs">
                      <Plus className="mr-1 size-3" /> Add Row
                    </Button>
                  </div>
                  {configWebhook?.action_type === "send_template" ? (
                    <p className="mb-2 text-xs text-muted-foreground">
                      Variable # (1, 2, 3...) &larr; Payload field path
                    </p>
                  ) : (
                    <p className="mb-2 text-xs text-muted-foreground">
                      Payload field path &rarr; Flow variable name
                    </p>
                  )}

                  {configMappings.length === 0 && (
                    <p className="py-4 text-center text-xs text-muted-foreground italic">
                      No mappings configured. Click &quot;Add Row&quot; or click a payload field above.
                    </p>
                  )}

                  {configMappings.map((m, i) => (
                    <div key={i} className="mb-2 flex items-center gap-2">
                      {configWebhook?.action_type === "send_template" ? (
                        <>
                          <Input
                            value={m.key}
                            onChange={(e) => updateConfigMapping(i, "key", e.target.value)}
                            placeholder="Var #"
                            className="h-8 w-16 text-xs"
                          />
                          <span className="text-xs text-muted-foreground">&larr;</span>
                          <Select
                            value={configPayloadKeys.includes(m.value) ? m.value : "_custom"}
                            onValueChange={(v) => {
                              if (v !== "_custom") updateConfigMapping(i, "value", v)
                            }}
                          >
                            <SelectTrigger className="h-8 flex-1 text-xs">
                              <SelectValue placeholder="Select field..." />
                            </SelectTrigger>
                            <SelectContent className="max-h-48">
                              {configPayloadKeys.map((k) => (
                                <SelectItem key={k} value={k}>
                                  <code className="text-xs">{k}</code>
                                </SelectItem>
                              ))}
                              <SelectItem value="_custom">Type custom...</SelectItem>
                            </SelectContent>
                          </Select>
                          {(!configPayloadKeys.includes(m.value)) && (
                            <Input
                              value={m.value}
                              onChange={(e) => updateConfigMapping(i, "value", e.target.value)}
                              placeholder="field.path"
                              className="h-8 flex-1 text-xs"
                            />
                          )}
                        </>
                      ) : (
                        <>
                          <Select
                            value={configPayloadKeys.includes(m.key) ? m.key : "_custom"}
                            onValueChange={(v) => {
                              if (v !== "_custom") updateConfigMapping(i, "key", v)
                            }}
                          >
                            <SelectTrigger className="h-8 flex-1 text-xs">
                              <SelectValue placeholder="Payload field..." />
                            </SelectTrigger>
                            <SelectContent className="max-h-48">
                              {configPayloadKeys.map((k) => (
                                <SelectItem key={k} value={k}>
                                  <code className="text-xs">{k}</code>
                                </SelectItem>
                              ))}
                              <SelectItem value="_custom">Type custom...</SelectItem>
                            </SelectContent>
                          </Select>
                          {(!configPayloadKeys.includes(m.key)) && (
                            <Input
                              value={m.key}
                              onChange={(e) => updateConfigMapping(i, "key", e.target.value)}
                              placeholder="field.path"
                              className="h-8 flex-1 text-xs"
                            />
                          )}
                          <span className="text-xs text-muted-foreground">&rarr;</span>
                          <Input
                            value={m.value}
                            onChange={(e) => updateConfigMapping(i, "value", e.target.value)}
                            placeholder="variable_name"
                            className="h-8 flex-1 text-xs"
                          />
                        </>
                      )}
                      <Button variant="ghost" size="icon" className="size-7 shrink-0" onClick={() => removeConfigMapping(i)}>
                        <XCircle className="size-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfigWebhook(null)}>Cancel</Button>
            <Button onClick={handleSaveMapping} disabled={configSaving}>
              {configSaving && <Loader2 className="mr-2 size-4 animate-spin" />}
              Save Configuration
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
