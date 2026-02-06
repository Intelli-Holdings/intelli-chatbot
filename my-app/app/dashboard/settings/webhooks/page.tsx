"use client"

import { useState, useEffect } from "react"
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
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Switch } from "@/components/ui/switch"
import {
  ArrowDownToLine,
  ArrowUpFromLine,
  CheckCircle,
  Copy,
  Loader2,
  MoreHorizontal,
  Play,
  Plus,
  Trash2,
  XCircle,
  Webhook,
} from "lucide-react"
import { toast } from "sonner"

const settingsNavigation = [
  { title: "General", href: "/dashboard/settings" },
  { title: "Automation", href: "/dashboard/settings/automation" },
  { title: "Custom Fields", href: "/dashboard/settings/custom-fields" },
  { title: "Escalation Events", href: "/dashboard/settings/escalation-events" },
  { title: "Webhooks", href: "/dashboard/settings/webhooks" },
]

interface ChatbotFlowOption {
  id: string
  name: string
  is_active: boolean
}

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
  const [inboundContactField, setInboundContactField] = useState("phone_number")
  const [inboundCreateContact, setInboundCreateContact] = useState(true)
  const [inboundRequireAuth, setInboundRequireAuth] = useState(true)
  const [savingInbound, setSavingInbound] = useState(false)

  // Fetch destinations
  useEffect(() => {
    const fetchDestinations = async () => {
      if (!organizationId) return
      setLoadingDestinations(true)
      try {
        const data = await WebhookService.getDestinations(organizationId)
        setDestinations(data)
      } catch (error) {
        console.error("Error fetching webhook destinations:", error)
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
        console.error("Error fetching inbound webhooks:", error)
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
        console.error("Error fetching flows:", error)
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
      setDestName("")
      setDestUrl("")
      setDestMethod("POST")
      setDestSigningSecret("")
      toast.success("Webhook destination created successfully")
    } catch (error) {
      console.error("Error creating destination:", error)
      toast.error("Failed to create webhook destination")
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
        contact_match_field: inboundContactField,
        create_contact_if_missing: inboundCreateContact,
        require_auth: inboundRequireAuth,
      })
      setInboundWebhooks([...inboundWebhooks, newInbound])
      setShowCreateInbound(false)
      resetInboundForm()
      toast.success("Inbound webhook created successfully")
    } catch (error) {
      console.error("Error creating inbound webhook:", error)
      toast.error("Failed to create inbound webhook")
    } finally {
      setSavingInbound(false)
    }
  }

  const resetInboundForm = () => {
    setInboundName("")
    setInboundFlowId("")
    setInboundTemplateId("")
    setInboundTemplateName("")
    setInboundActionType("start_flow")
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
      console.error("Error testing destination:", error)
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
      console.error("Error toggling destination:", error)
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
      console.error("Error deleting destination:", error)
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
      console.error("Error toggling inbound webhook:", error)
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
      console.error("Error deleting inbound webhook:", error)
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
                      Send data to external systems like Zapier, Make, CRMs, and more
                    </p>
                  </div>
                  <Dialog open={showCreateDestination} onOpenChange={setShowCreateDestination}>
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
                          <Select value={destMethod} onValueChange={(v) => setDestMethod(v as any)}>
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
                  <Dialog open={showCreateInbound} onOpenChange={setShowCreateInbound}>
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
                            placeholder="e.g., New Lead from Website"
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
                          <Select value={inboundActionType} onValueChange={(v) => setInboundActionType(v as any)}>
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
                                <SelectContent>
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
                          </div>
                        )}

                        <div>
                          <Label htmlFor="inbound-contact">Contact Match Field</Label>
                          <Select value={inboundContactField} onValueChange={setInboundContactField}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="phone_number">phone_number</SelectItem>
                              <SelectItem value="email">email</SelectItem>
                              <SelectItem value="customer.phone">customer.phone</SelectItem>
                              <SelectItem value="contact.phone">contact.phone</SelectItem>
                            </SelectContent>
                          </Select>
                          <p className="mt-1 text-xs text-muted-foreground">
                            Field in payload to match against contacts
                          </p>
                        </div>

                        <div className="flex items-center justify-between rounded-lg border border-border p-3">
                          <div>
                            <Label>Create contact if missing</Label>
                            <p className="text-xs text-muted-foreground">
                              Automatically create a new contact if not found
                            </p>
                          </div>
                          <Switch
                            checked={inboundCreateContact}
                            onCheckedChange={setInboundCreateContact}
                          />
                        </div>

                        <div className="flex items-center justify-between rounded-lg border border-border p-3">
                          <div>
                            <Label>Require API Key</Label>
                            <p className="text-xs text-muted-foreground">
                              Require X-API-Key header for authentication
                            </p>
                          </div>
                          <Switch
                            checked={inboundRequireAuth}
                            onCheckedChange={setInboundRequireAuth}
                          />
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
    </div>
  )
}
