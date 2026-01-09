"use client"
import { useState, useEffect } from "react"
import type React from "react"

import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useOrganizationList } from "@clerk/nextjs"
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import {
  Loader,
  ExternalLink,
  Pen,
  Eye,
  EyeOff,
  Loader2,
  Bot,
  PlusCircle,
  Trash2,
  Rocket,
  LayoutGrid,
  List,
} from "lucide-react"
import { DeploymentDialog } from "@/components/deployment-dialog"
import { formatDate } from "@/utils/date"
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { useRouter } from "next/navigation"
import useActiveOrganizationId from "@/hooks/use-organization-id"
import WidgetPreview from "@/components/WidgetPreview"

interface Widget {
  showKey: any
  id: string
  widget_name: string
  widget_key: string
  website_url: string
  created_at: string
  updated_at: string
  organization: string
  assistant: {
    id: string
    name: string
    assistant_id: string
    prompt: string
    created_at: string
    updated_at: string
  }
  organization_id: string
  avatar_url: string
  brand_color: string
  greeting_message: string
  help_text: string
  // Enhanced styling fields
  widget_position: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left'
  widget_size: 'small' | 'medium' | 'large'
  header_color: string
  visitor_message_color: string
  business_message_color: string
  button_text: string
  font_family: string
  font_size: number
  border_radius: number
  chat_window_width: number
  chat_window_height: number
  enable_sound: boolean
  show_powered_by: boolean
  animation_style: string
}

type WidgetCacheEntry = {
  widgets: Widget[]
  fetchedAt: number
}

type WidgetsProps = {
  onCreateWidget?: () => void
}

const widgetsCache = new Map<string, WidgetCacheEntry>()

const getCachedWidgets = (organizationId: string) => widgetsCache.get(organizationId)

const setWidgetsCache = (organizationId: string, widgets: Widget[]) => {
  if (!organizationId) return
  widgetsCache.set(organizationId, { widgets, fetchedAt: Date.now() })
}

const Widgets = ({ onCreateWidget }: WidgetsProps) => {
  const [widgets, setWidgets] = useState<Widget[]>([])
  const [isFetchingWidgets, setIsFetchingWidgets] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isBulkDeleting, setIsBulkDeleting] = useState(false)
  const [selectedOrganizationId, setSelectedOrganizationId] = useState("")
  const [selectedWidget, setSelectedWidget] = useState<{
    key: string
    url: string
  } | null>(null)
  const [editWidget, setEditWidget] = useState<Widget | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [widgetToDelete, setWidgetToDelete] = useState<Widget | null>(null)
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [brandColor, setBrandColor] = useState<string>("")
  const [previewOpen, setPreviewOpen] = useState(true)
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")

  // Bulk delete states
  const [selectedWidgets, setSelectedWidgets] = useState<Set<string>>(new Set())
  const [isBulkDeleteDialogOpen, setIsBulkDeleteDialogOpen] = useState(false)

  const router = useRouter()

  // Use the hook to auto-select organization
  const organizationId = useActiveOrganizationId()

  const { userMemberships, isLoaded } = useOrganizationList({
    userMemberships: { infinite: true },
  })

  // Auto-select organization when it's loaded
  useEffect(() => {
    if (organizationId) {
      setSelectedOrganizationId(organizationId)
    }
  }, [organizationId])

  useEffect(() => {
    if (selectedOrganizationId) {
      const cached = getCachedWidgets(selectedOrganizationId)
      if (cached) {
        setWidgets(cached.widgets)
        fetchWidgets(selectedOrganizationId, { showLoader: false })
      } else {
        fetchWidgets(selectedOrganizationId)
      }
      // Clear selections when organization changes
      setSelectedWidgets(new Set())
    }
  }, [selectedOrganizationId])

  const fetchWidgets = async (orgId: string, options: { showLoader?: boolean } = {}) => {
    const { showLoader = true } = options
    if (showLoader) setIsFetchingWidgets(true)
    try {

      // Add timestamp to prevent browser caching
      const timestamp = new Date().getTime()
      const response = await fetch(`/api/widgets/organization/${orgId}?t=${timestamp}`, {
        cache: "no-store",
        headers: {
          "Cache-Control": "no-cache",
        },
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      setWidgets(data)
      setWidgetsCache(orgId, data)
    } catch (error) {
      console.error("[Widgets] Error fetching widgets:", error)
      toast.error(`Failed to fetch widgets: ${error instanceof Error ? error.message : "Unknown error"}`)
    } finally {
      if (showLoader) setIsFetchingWidgets(false)
    }
  }

  const handleEditWidget = (widget: Widget) => {
    setEditWidget(widget)
    setBrandColor(widget.brand_color || "#007fff")
    setAvatarUrl(widget.avatar_url || null)
    setIsEditDialogOpen(true)
  }

  const handleDeleteWidget = (widget: Widget) => {
    setWidgetToDelete(widget)
    setIsDeleteDialogOpen(true)
  }

  const confirmDeleteWidget = async () => {
    if (!widgetToDelete) return

    const widgetToDeleteId = widgetToDelete.id
    const previousWidgets = widgets
    const previousSelectedWidgets = new Set(selectedWidgets)
    const orgIdAtDelete = selectedOrganizationId

    setIsDeleting(true)

    // Optimistic update: Remove widget from UI immediately
    setWidgets((prevWidgets) => {
      const nextWidgets = prevWidgets.filter((w) => w.id !== widgetToDeleteId)
      setWidgetsCache(selectedOrganizationId, nextWidgets)
      return nextWidgets
    })
    setSelectedWidgets((prevSelected) => {
      if (!prevSelected.has(widgetToDeleteId)) return prevSelected
      const nextSelected = new Set(prevSelected)
      nextSelected.delete(widgetToDeleteId)
      return nextSelected
    })

    // Close dialog immediately for better UX
    setIsDeleteDialogOpen(false)
    const deletedWidget = widgetToDelete
    setWidgetToDelete(null)

    try {
      console.log(`[Widgets] Deleting widget`)
      const response = await fetch(`/api/widgets/widget/${deletedWidget.widget_key}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || "Failed to delete widget")
      }

      toast.success("Widget deleted successfully!")
    } catch (error) {
      console.error("[Widgets] Error deleting widget:", error)
      toast.error(`Failed to delete widget: ${error instanceof Error ? error.message : "Unknown error"}`)

      // Revert optimistic update on error
      if (orgIdAtDelete === selectedOrganizationId) {
        setWidgets(previousWidgets)
        setWidgetsCache(selectedOrganizationId, previousWidgets)
        setSelectedWidgets(previousSelectedWidgets)
      }
    } finally {
      setIsDeleting(false)
    }
  }

  const handleAvatarUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file && (file.type === "image/jpeg" || file.type === "image/png")) {
      setAvatarFile(file) // Store the actual file
      // Create a preview URL for the UI
      const reader = new FileReader()
      reader.onload = (e) => {
        setAvatarUrl(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleUpdateWidget = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editWidget) return

    // Validate organization ID is available
    if (!selectedOrganizationId) {
      toast.error("Organization ID is required. Please refresh the page.");
      return;
    }

    setIsUpdating(true)

    const formData = new FormData()
    // Use selectedOrganizationId from hook instead of editWidget.organization_id
    formData.append("organization_id", selectedOrganizationId)
    formData.append("assistant_id", editWidget.assistant.id)
    formData.append("widget_name", editWidget.widget_name)
    formData.append("website_url", editWidget.website_url)
    formData.append("brand_color", brandColor)
    formData.append("greeting_message", editWidget.greeting_message || "")
    formData.append("help_text", editWidget.help_text || "")

    // Enhanced styling fields
    formData.append("widget_position", editWidget.widget_position)
    formData.append("widget_size", editWidget.widget_size)
    formData.append("header_color", editWidget.header_color)
    formData.append("visitor_message_color", editWidget.visitor_message_color)
    formData.append("business_message_color", editWidget.business_message_color)
    formData.append("button_text", editWidget.button_text)
    formData.append("font_family", editWidget.font_family)
    formData.append("font_size", editWidget.font_size.toString())
    formData.append("border_radius", editWidget.border_radius.toString())
    formData.append("chat_window_width", editWidget.chat_window_width.toString())
    formData.append("chat_window_height", editWidget.chat_window_height.toString())
    formData.append("enable_sound", editWidget.enable_sound.toString())
    formData.append("show_powered_by", editWidget.show_powered_by.toString())
    formData.append("animation_style", editWidget.animation_style)

    if (avatarFile) {
      formData.append("avatar_url", avatarFile)
    }

    try {
      console.log(`[Widgets] Updating widget`)

      // Optimistic update: Update widget in UI immediately
      const optimisticWidget = {
        ...editWidget,
        widget_name: editWidget.widget_name,
        website_url: editWidget.website_url,
        brand_color: brandColor,
      }
      setWidgets((prevWidgets) => {
        const nextWidgets = prevWidgets.map((w) => (w.id === editWidget.id ? optimisticWidget : w))
        setWidgetsCache(selectedOrganizationId, nextWidgets)
        return nextWidgets
      })

      const response = await fetch(`/api/widgets/widget/${editWidget.widget_key}`, {
        method: "PUT",
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || "Failed to update widget")
      }

      const updatedData = await response.json()

      toast.success("Widget updated successfully!")

      // Reset edit state
      setIsEditDialogOpen(false)
      setEditWidget(null)
      setAvatarFile(null)
      setAvatarUrl(null)

      // Refresh the widget list to show actual updated data from server
      console.log("[Widgets] Refreshing widget list after update...")
      await fetchWidgets(selectedOrganizationId, { showLoader: false })
    } catch (error) {
      console.error("[Widgets] Error updating widget:", error)
      toast.error(`Failed to update widget: ${error instanceof Error ? error.message : "Unknown error"}`)

      // Revert optimistic update on error
      await fetchWidgets(selectedOrganizationId, { showLoader: false })
    } finally {
      setIsUpdating(false)
    }
  }

  const handleCreateWidget = () => {
    if (onCreateWidget) {
      onCreateWidget()
      return
    }
    router.push("/dashboard/widgets")
  }

  // Bulk delete handlers
  const toggleWidgetSelection = (widgetId: string) => {
    const newSelection = new Set(selectedWidgets)
    if (newSelection.has(widgetId)) {
      newSelection.delete(widgetId)
    } else {
      newSelection.add(widgetId)
    }
    setSelectedWidgets(newSelection)
  }

  const toggleSelectAll = () => {
    if (selectedWidgets.size === widgets.length) {
      setSelectedWidgets(new Set())
    } else {
      setSelectedWidgets(new Set(widgets.map(w => w.id)))
    }
  }

  const handleBulkDelete = () => {
    if (selectedWidgets.size === 0) {
      toast.error("Please select at least one widget to delete")
      return
    }
    setIsBulkDeleteDialogOpen(true)
  }

  const confirmBulkDelete = async () => {
    if (selectedWidgets.size === 0) return

    const widgetIdsToDelete = Array.from(selectedWidgets)
    const widgetsToDelete = widgets.filter(w => widgetIdsToDelete.includes(w.id))
    const previousWidgets = widgets
    const previousSelectedWidgets = new Set(selectedWidgets)
    const orgIdAtDelete = selectedOrganizationId

    setIsBulkDeleting(true)
    setIsBulkDeleteDialogOpen(false)

    // Optimistic update
    setWidgets(prevWidgets => {
      const nextWidgets = prevWidgets.filter(w => !widgetIdsToDelete.includes(w.id))
      setWidgetsCache(selectedOrganizationId, nextWidgets)
      return nextWidgets
    })
    setSelectedWidgets(new Set())

    try {
      // Delete widgets in parallel
      const deletePromises = widgetsToDelete.map(widget =>
        fetch(`/api/widgets/widget/${widget.widget_key}`, {
          method: "DELETE",
        })
      )

      const results = await Promise.allSettled(deletePromises)

      const failedWidgetIds: string[] = []
      results.forEach((result, index) => {
        if (result.status === "fulfilled") {
          if (!result.value.ok) {
            failedWidgetIds.push(widgetsToDelete[index].id)
          }
        } else {
          failedWidgetIds.push(widgetsToDelete[index].id)
        }
      })

      if (failedWidgetIds.length > 0) {
        toast.error(`Failed to delete ${failedWidgetIds.length} widget(s).`)
        if (orgIdAtDelete === selectedOrganizationId) {
          const successfulIds = widgetIdsToDelete.filter((id) => !failedWidgetIds.includes(id))
          const nextWidgets = previousWidgets.filter((w) => !successfulIds.includes(w.id))
          setWidgets(nextWidgets)
          setWidgetsCache(selectedOrganizationId, nextWidgets)
          setSelectedWidgets(new Set(failedWidgetIds))
        }
      } else {
        toast.success(`Successfully deleted ${widgetsToDelete.length} widget(s)!`)
      }
    } catch (error) {
      console.error("[Widgets] Error during bulk delete:", error)
      toast.error(`Failed to delete widgets: ${error instanceof Error ? error.message : "Unknown error"}`)

      // Revert optimistic update on error
      if (orgIdAtDelete === selectedOrganizationId) {
        setWidgets(previousWidgets)
        setWidgetsCache(selectedOrganizationId, previousWidgets)
        setSelectedWidgets(previousSelectedWidgets)
      }
    } finally {
      setIsBulkDeleting(false)
    }
  }

  return (
    <div className="space-y-6">
      {userMemberships && userMemberships.data && userMemberships.data.length > 1 && (
        <div className="w-full max-w-xs">
          <Select value={selectedOrganizationId} onValueChange={setSelectedOrganizationId}>
            <SelectTrigger className="h-9 text-xs">
              <SelectValue placeholder="Select organization" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {userMemberships?.data?.map((membership) => (
                  <SelectItem key={membership.organization.id} value={membership.organization.id}>
                    {membership.organization.name}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-end gap-3" />

      {isFetchingWidgets ? (
        <div className="flex items-center justify-center h-96">
          <Loader className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="rounded-xl border border-border/60 bg-white overflow-hidden">
          <ScrollArea className="h-[calc(100vh-340px)]">
            {widgets.length > 0 && (
              <div className="px-4 py-2 border-b border-border/60 bg-muted/30">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={toggleSelectAll}
                      className="h-7 px-2 text-xs"
                    >
                      {selectedWidgets.size === widgets.length && widgets.length > 0
                        ? "Clear all"
                        : "Select all"}
                    </Button>
                    {selectedWidgets.size > 0 && (
                      <span className="text-xs text-muted-foreground">
                        {selectedWidgets.size} selected
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center border border-[#e9edef] rounded-md bg-white">
                      <Button
                        variant={viewMode === "grid" ? "default" : "ghost"}
                        size="sm"
                        onClick={() => setViewMode("grid")}
                        className={`h-7 px-2 rounded-r-none ${
                          viewMode === "grid"
                            ? "!bg-[#007fff] hover:!bg-[#0067d6] !text-white"
                            : "hover:bg-[#f0f2f5] text-[#667781]"
                        }`}
                      >
                        <LayoutGrid className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant={viewMode === "list" ? "default" : "ghost"}
                        size="sm"
                        onClick={() => setViewMode("list")}
                        className={`h-7 px-2 rounded-l-none ${
                          viewMode === "list"
                            ? "!bg-[#007fff] hover:!bg-[#0067d6] !text-white"
                            : "hover:bg-[#f0f2f5] text-[#667781]"
                        }`}
                      >
                        <List className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                    {selectedWidgets.size > 0 && (
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={handleBulkDelete}
                        className="h-7 px-2 text-xs"
                      >
                        <Trash2 className="h-3.5 w-3.5 mr-1.5" />
                        Delete Selected
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            )}
            {viewMode === "grid" ? (
              <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                <Card
                  className="h-[220px] border-dashed border-2 hover:border-primary/50 hover:bg-accent/30 cursor-pointer flex items-center justify-center transition-all duration-200 rounded-xl group"
                  onClick={handleCreateWidget}
                >
                  <div className="flex flex-col items-center justify-center text-muted-foreground group-hover:text-foreground transition-colors">
                    <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-3 group-hover:bg-primary/20 transition-colors">
                      <PlusCircle className="h-7 w-7 text-primary" />
                    </div>
                    <p className="font-semibold text-base">Create New Widget</p>
                    <p className="text-xs text-muted-foreground mt-1">Get started with a new chatbot</p>
                  </div>
                </Card>

                {widgets?.map((widget) => (
                  <Card
                    key={widget.id}
                    className={`relative h-[220px] flex flex-col rounded-xl hover:shadow-lg transition-all duration-200 ${
                      selectedWidgets.has(widget.id)
                        ? 'border-primary border-2 ring-2 ring-primary/20'
                        : 'border-border/60'
                    }`}
                  >
                    <TooltipProvider>
                      <div className="absolute top-3 right-3 flex flex-col gap-2">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 w-8 p-0 bg-white/90"
                              onClick={() =>
                                setSelectedWidget({
                                  key: widget.widget_key,
                                  url: widget.website_url,
                                })
                              }
                            >
                              <Rocket className="h-3.5 w-3.5" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Deploy widget</TooltipContent>
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 w-8 p-0 bg-white/90"
                              onClick={() => handleEditWidget(widget)}
                            >
                              <Pen className="h-3.5 w-3.5" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Edit widget</TooltipContent>
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10 bg-white/90"
                              onClick={() => handleDeleteWidget(widget)}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Delete widget</TooltipContent>
                        </Tooltip>
                      </div>
                    </TooltipProvider>
                    <CardHeader className="pb-3 pr-14">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-3 flex-1">
                          <input
                            type="checkbox"
                            checked={selectedWidgets.has(widget.id)}
                            onChange={() => toggleWidgetSelection(widget.id)}
                            onClick={(e) => e.stopPropagation()}
                            className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer flex-shrink-0"
                          />
                          <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                            <Bot className="h-5 w-5 text-primary" />
                          </div>
                          <CardTitle className="text-lg leading-tight">{widget.widget_name}</CardTitle>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="flex-grow space-y-3 pb-3 pr-14">
                      <div className="space-y-1">
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Website</p>
                        <a
                          href={widget.website_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-primary hover:underline flex items-center gap-1.5 group/link"
                        >
                          <span className="truncate max-w-[200px]">
                            {widget.website_url.length > 30
                              ? widget.website_url.substring(0, 30) + "..."
                              : widget.website_url}
                          </span>
                          <ExternalLink className="h-3.5 w-3.5 flex-shrink-0 group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5 transition-transform" />
                        </a>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Widget Key</p>
                        <div className="flex items-center gap-2">
                          <code className="text-xs bg-muted px-2 py-1 rounded-md font-mono break-all flex-1">
                            {widget.showKey ? widget.widget_key : widget.widget_key.slice(0, 12) + "..."}
                          </code>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0 flex-shrink-0"
                            onClick={(e) => {
                              e.stopPropagation()
                              setWidgets((prev) =>
                                prev.map((w) => (w.id === widget.id ? { ...w, showKey: !w.showKey } : w))
                              )
                            }}
                          >
                            {widget.showKey ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                          </Button>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground pt-1">Created {formatDate(widget.created_at)}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="p-4 space-y-4">
                {widgets.length === 0 ? (
                  <div className="px-4 py-10 text-center text-sm text-muted-foreground">
                    No widgets yet.
                    <div className="mt-3">
                      <Button variant="outline" size="sm" onClick={handleCreateWidget}>
                        <PlusCircle className="h-4 w-4 mr-2" />
                        Create Widget
                      </Button>
                    </div>
                  </div>
                ) : (
                  widgets.map((widget) => (
                    <Card
                      key={widget.id}
                      className={`relative border-border/60 ${
                        selectedWidgets.has(widget.id)
                          ? "border-primary border-2 ring-1 ring-primary/20 bg-primary/5"
                          : "bg-white"
                      }`}
                    >
                      <TooltipProvider>
                        <div className="absolute top-3 right-3 flex flex-col gap-2">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-8 w-8 p-0 bg-white/90"
                                onClick={() =>
                                  setSelectedWidget({
                                    key: widget.widget_key,
                                    url: widget.website_url,
                                  })
                                }
                              >
                                <Rocket className="h-3.5 w-3.5" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Deploy widget</TooltipContent>
                          </Tooltip>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-8 w-8 p-0 bg-white/90"
                                onClick={() => handleEditWidget(widget)}
                              >
                                <Pen className="h-3.5 w-3.5" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Edit widget</TooltipContent>
                          </Tooltip>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10 bg-white/90"
                                onClick={() => handleDeleteWidget(widget)}
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Delete widget</TooltipContent>
                          </Tooltip>
                        </div>
                      </TooltipProvider>
                      <CardContent className="p-4 space-y-3 pr-14">
                        <div className="flex items-start gap-3">
                          <input
                            type="checkbox"
                            checked={selectedWidgets.has(widget.id)}
                            onChange={() => toggleWidgetSelection(widget.id)}
                            className="w-4 h-4 mt-1 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
                          />
                          <div className="flex items-center gap-3 min-w-0 flex-1">
                            <div className="w-9 h-9 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                              <Bot className="h-4 w-4 text-primary" />
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-semibold truncate">{widget.widget_name}</p>
                              <p className="text-xs text-muted-foreground truncate">
                                {widget.assistant?.name || "Assistant"}
                              </p>
                            </div>
                          </div>
                          <span className="text-xs text-muted-foreground whitespace-nowrap">
                            {formatDate(widget.created_at)}
                          </span>
                        </div>

                        <div className="grid gap-3 sm:grid-cols-2">
                          <div className="space-y-1">
                            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">Website</p>
                            <a
                              href={widget.website_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm text-primary hover:underline flex items-center gap-1.5 min-w-0"
                            >
                              <span className="truncate">
                                {widget.website_url.length > 34
                                  ? `${widget.website_url.substring(0, 34)}...`
                                  : widget.website_url}
                              </span>
                              <ExternalLink className="h-3.5 w-3.5 flex-shrink-0" />
                            </a>
                          </div>
                          <div className="space-y-1">
                            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">Widget Key</p>
                            <div className="flex items-center gap-2 min-w-0">
                              <code className="text-xs bg-muted px-2 py-1 rounded-md font-mono break-all flex-1">
                                {widget.showKey ? widget.widget_key : `${widget.widget_key.slice(0, 12)}...`}
                              </code>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 w-7 p-0 flex-shrink-0"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  setWidgets((prev) =>
                                    prev.map((w) => (w.id === widget.id ? { ...w, showKey: !w.showKey } : w))
                                  )
                                }}
                              >
                                {widget.showKey ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                      <CardFooter className="flex items-center gap-2 border-t border-border/40 px-4 py-3">
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 px-3"
                          onClick={() =>
                            setSelectedWidget({
                              key: widget.widget_key,
                              url: widget.website_url,
                            })
                          }
                        >
                          Deploy
                        </Button>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-8 w-8 p-0"
                                onClick={() => handleEditWidget(widget)}
                              >
                                <Pen className="h-3.5 w-3.5" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Edit Widget</TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                                onClick={() => handleDeleteWidget(widget)}
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Delete Widget</TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </CardFooter>
                    </Card>
                  ))
                )}
              </div>
            )}
          </ScrollArea>
        </div>
      )}

      {selectedWidget && (
        <DeploymentDialog
          widgetKey={selectedWidget.key}
          websiteUrl={selectedWidget.url}
          onClose={() => setSelectedWidget(null)}
        />
      )}

      {editWidget && (
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-[650px] max-h-[90vh] overflow-y-auto rounded-xl">
            <DialogHeader className="space-y-2">
              <DialogTitle className="text-xl font-semibold">Update Widget</DialogTitle>
              <DialogDescription className="text-sm">
                Update your widget configuration and appearance settings.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleUpdateWidget} className="space-y-5 pt-2">
              <Tabs defaultValue="basic" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="basic">Basic</TabsTrigger>
                  <TabsTrigger value="styling">Styling</TabsTrigger>
                  <TabsTrigger value="advanced">Advanced</TabsTrigger>
                  <TabsTrigger value="preview">Preview</TabsTrigger>
                </TabsList>

                <TabsContent value="basic" className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label htmlFor="widget_name" className="text-sm font-semibold">
                      Widget Name
                    </Label>
                    <Input
                      id="widget_name"
                      className="h-11"
                      value={editWidget.widget_name}
                      onChange={(e) => setEditWidget({ ...editWidget, widget_name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="website_url" className="text-sm font-semibold">
                      Website URL
                    </Label>
                    <Input
                      id="website_url"
                      className="h-11"
                      value={editWidget.website_url}
                      onChange={(e) => setEditWidget({ ...editWidget, website_url: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="greeting_message" className="text-sm font-semibold">
                      Greeting Message
                    </Label>
                    <Textarea
                      id="greeting_message"
                      className="min-h-[80px]"
                      value={editWidget.greeting_message}
                      onChange={(e) => setEditWidget({ ...editWidget, greeting_message: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="help_text" className="text-sm font-semibold">
                      Help Text
                    </Label>
                    <Input
                      id="help_text"
                      className="h-11"
                      value={editWidget.help_text}
                      onChange={(e) => setEditWidget({ ...editWidget, help_text: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="button_text" className="text-sm font-semibold">
                      Button Text
                    </Label>
                    <Input
                      id="button_text"
                      className="h-11"
                      value={editWidget.button_text}
                      onChange={(e) => setEditWidget({ ...editWidget, button_text: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="avatar_url" className="text-sm font-semibold">
                      Avatar Image
                    </Label>
                    <Input
                      id="avatar_url"
                      type="file"
                      className="h-11 cursor-pointer"
                      accept="image/jpeg, image/png"
                      onChange={handleAvatarUpload}
                    />
                    {avatarUrl && (
                      <div className="flex items-center gap-3 pt-2">
                        <img
                          src={avatarUrl || "/placeholder.svg"}
                          alt="Avatar Preview"
                          className="w-14 h-14 rounded-lg object-cover border-2 border-border"
                        />
                        <p className="text-xs text-muted-foreground">Preview</p>
                      </div>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="styling" className="space-y-4 mt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="widget_position" className="text-sm font-semibold">
                        Widget Position
                      </Label>
                      <Select
                        value={editWidget.widget_position}
                        onValueChange={(value) =>
                          setEditWidget({ ...editWidget, widget_position: value as any })
                        }
                      >
                        <SelectTrigger className="h-11">
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
                      <Label htmlFor="widget_size" className="text-sm font-semibold">
                        Widget Size
                      </Label>
                      <Select
                        value={editWidget.widget_size}
                        onValueChange={(value) => setEditWidget({ ...editWidget, widget_size: value as any })}
                      >
                        <SelectTrigger className="h-11">
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
                    <Label htmlFor="brand_color" className="text-sm font-semibold">
                      Brand Color
                    </Label>
                    <div className="flex gap-3 items-center">
                      <Input
                        id="brand_color"
                        type="color"
                        className="h-11 w-20 cursor-pointer"
                        value={brandColor}
                        onChange={(e) => setBrandColor(e.target.value)}
                      />
                      <Input
                        type="text"
                        className="h-11 flex-1 font-mono text-sm"
                        value={brandColor}
                        onChange={(e) => setBrandColor(e.target.value)}
                        placeholder="#007fff"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="header_color" className="text-sm font-semibold">
                      Header Color
                    </Label>
                    <div className="flex gap-3 items-center">
                      <Input
                        id="header_color"
                        type="color"
                        className="h-11 w-20 cursor-pointer"
                        value={editWidget.header_color}
                        onChange={(e) => setEditWidget({ ...editWidget, header_color: e.target.value })}
                      />
                      <Input
                        type="text"
                        className="h-11 flex-1 font-mono text-sm"
                        value={editWidget.header_color}
                        onChange={(e) => setEditWidget({ ...editWidget, header_color: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="visitor_message_color" className="text-sm font-semibold">
                        Visitor Message Color
                      </Label>
                      <Input
                        id="visitor_message_color"
                        type="color"
                        className="h-11 cursor-pointer"
                        value={editWidget.visitor_message_color}
                        onChange={(e) =>
                          setEditWidget({ ...editWidget, visitor_message_color: e.target.value })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="business_message_color" className="text-sm font-semibold">
                        Business Message Color
                      </Label>
                      <Input
                        id="business_message_color"
                        type="color"
                        className="h-11 cursor-pointer"
                        value={editWidget.business_message_color}
                        onChange={(e) =>
                          setEditWidget({ ...editWidget, business_message_color: e.target.value })
                        }
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="font_size" className="text-sm font-semibold">
                        Font Size (px)
                      </Label>
                      <Input
                        id="font_size"
                        type="number"
                        className="h-11"
                        value={editWidget.font_size}
                        onChange={(e) => setEditWidget({ ...editWidget, font_size: Number(e.target.value) })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="border_radius" className="text-sm font-semibold">
                        Border Radius (px)
                      </Label>
                      <Input
                        id="border_radius"
                        type="number"
                        className="h-11"
                        value={editWidget.border_radius}
                        onChange={(e) =>
                          setEditWidget({ ...editWidget, border_radius: Number(e.target.value) })
                        }
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="font_family" className="text-sm font-semibold">
                      Font Family
                    </Label>
                    <Input
                      id="font_family"
                      className="h-11"
                      value={editWidget.font_family}
                      onChange={(e) => setEditWidget({ ...editWidget, font_family: e.target.value })}
                      placeholder="Arial, sans-serif"
                    />
                  </div>
                </TabsContent>

                <TabsContent value="advanced" className="space-y-4 mt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="chat_window_width" className="text-sm font-semibold">
                        Window Width (px)
                      </Label>
                      <Input
                        id="chat_window_width"
                        type="number"
                        className="h-11"
                        value={editWidget.chat_window_width}
                        onChange={(e) =>
                          setEditWidget({ ...editWidget, chat_window_width: Number(e.target.value) })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="chat_window_height" className="text-sm font-semibold">
                        Window Height (px)
                      </Label>
                      <Input
                        id="chat_window_height"
                        type="number"
                        className="h-11"
                        value={editWidget.chat_window_height}
                        onChange={(e) =>
                          setEditWidget({ ...editWidget, chat_window_height: Number(e.target.value) })
                        }
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="animation_style" className="text-sm font-semibold">
                      Animation Style
                    </Label>
                    <Input
                      id="animation_style"
                      className="h-11"
                      value={editWidget.animation_style}
                      onChange={(e) => setEditWidget({ ...editWidget, animation_style: e.target.value })}
                      placeholder="slide"
                    />
                  </div>

                  <div className="flex items-center justify-between space-x-2 py-2">
                    <Label htmlFor="enable_sound" className="text-sm font-semibold cursor-pointer">
                      Enable Notification Sounds
                    </Label>
                    <Switch
                      id="enable_sound"
                      checked={editWidget.enable_sound}
                      onCheckedChange={(checked) => setEditWidget({ ...editWidget, enable_sound: checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between space-x-2 py-2">
                    <Label htmlFor="show_powered_by" className="text-sm font-semibold cursor-pointer">
                      Show &quot;Powered by Intelli&quot;
                    </Label>
                    <Switch
                      id="show_powered_by"
                      checked={editWidget.show_powered_by}
                      onCheckedChange={(checked) =>
                        setEditWidget({ ...editWidget, show_powered_by: checked })
                      }
                    />
                  </div>
                </TabsContent>

                <TabsContent value="preview" className="space-y-4 mt-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-semibold">Widget State</Label>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">Closed</span>
                        <Switch
                          checked={previewOpen}
                          onCheckedChange={setPreviewOpen}
                        />
                        <span className="text-xs text-muted-foreground">Open</span>
                      </div>
                    </div>
                    <WidgetPreview
                      widget={{
                        widget_name: editWidget.widget_name,
                        avatar_url: avatarUrl || editWidget.avatar_url,
                        brand_color: brandColor,
                        greeting_message: editWidget.greeting_message,
                        help_text: editWidget.help_text,
                        button_text: editWidget.button_text,
                        widget_position: editWidget.widget_position,
                        widget_size: editWidget.widget_size,
                        header_color: editWidget.header_color,
                        visitor_message_color: editWidget.visitor_message_color,
                        business_message_color: editWidget.business_message_color,
                        font_family: editWidget.font_family,
                        font_size: editWidget.font_size,
                        border_radius: editWidget.border_radius,
                        chat_window_width: editWidget.chat_window_width,
                        chat_window_height: editWidget.chat_window_height,
                        enable_sound: editWidget.enable_sound,
                        show_powered_by: editWidget.show_powered_by,
                        animation_style: editWidget.animation_style
                      }}
                      isOpen={previewOpen}
                    />
                  </div>
                </TabsContent>
              </Tabs>

              <div className="flex gap-3 pt-2 border-t">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1 h-11 bg-transparent"
                  onClick={() => setIsEditDialogOpen(false)}
                  disabled={isUpdating}
                >
                  Cancel
                </Button>
                <Button type="submit" className="flex-1 h-11" disabled={isUpdating}>
                  {isUpdating ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Updating...
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      )}

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[440px] rounded-xl">
          <DialogHeader className="space-y-2">
            <DialogTitle className="text-xl font-semibold">Delete Widget</DialogTitle>
            <DialogDescription className="text-sm leading-relaxed">
              Are you sure you want to delete{" "}
              <span className="font-semibold text-foreground">&ldquo;{widgetToDelete?.widget_name}&rdquo;</span>? This
              action cannot be undone and will permanently remove all associated data.
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              className="flex-1 h-11 bg-transparent"
              onClick={() => {
                setIsDeleteDialogOpen(false)
                setWidgetToDelete(null)
              }}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button variant="destructive" className="flex-1 h-11" onClick={confirmDeleteWidget} disabled={isDeleting}>
              {isDeleting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Widget
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Bulk Delete Confirmation Dialog */}
      <Dialog open={isBulkDeleteDialogOpen} onOpenChange={setIsBulkDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[500px] rounded-xl">
          <DialogHeader className="space-y-2">
            <DialogTitle className="text-xl font-semibold">Delete Multiple Widgets</DialogTitle>
            <DialogDescription className="text-sm leading-relaxed">
              Are you sure you want to delete{" "}
              <span className="font-semibold text-foreground">{selectedWidgets.size} widget{selectedWidgets.size > 1 ? 's' : ''}</span>?
              This action cannot be undone and will permanently remove all associated data.
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-[200px] overflow-y-auto bg-muted/50 rounded-lg p-3 my-2">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Widgets to be deleted:</p>
            <ul className="space-y-1">
              {widgets
                .filter(w => selectedWidgets.has(w.id))
                .map(widget => (
                  <li key={widget.id} className="text-sm flex items-center gap-2">
                    <Trash2 className="h-3 w-3 text-destructive" />
                    <span className="font-medium">{widget.widget_name}</span>
                    <span className="text-xs text-muted-foreground">({widget.website_url})</span>
                  </li>
                ))}
            </ul>
          </div>
          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              className="flex-1 h-11 bg-transparent"
              onClick={() => setIsBulkDeleteDialogOpen(false)}
              disabled={isBulkDeleting}
            >
              Cancel
            </Button>
            <Button variant="destructive" className="flex-1 h-11" onClick={confirmBulkDelete} disabled={isBulkDeleting}>
              {isBulkDeleting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete {selectedWidgets.size} Widget{selectedWidgets.size > 1 ? 's' : ''}
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default Widgets
