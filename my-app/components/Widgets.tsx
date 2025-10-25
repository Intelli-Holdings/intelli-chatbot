"use client"
import { useState, useEffect } from "react"
import type React from "react"

import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { useOrganizationList } from "@clerk/nextjs"
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { Loader, ExternalLink, Pen, Eye, EyeOff, Loader2, Bot, PlusCircle, Trash2 } from "lucide-react"
import { DeploymentDialog } from "@/components/deployment-dialog"
import { formatDate } from "@/utils/date"
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useRouter } from "next/navigation"
import useActiveOrganizationId from "@/hooks/use-organization-id"

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
}

const Widgets = () => {
  const [widgets, setWidgets] = useState<Widget[]>([])
  const [loading, setLoading] = useState(false)
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
      fetchWidgets(selectedOrganizationId)
    }
  }, [selectedOrganizationId])

  const fetchWidgets = async (orgId: string) => {
    setLoading(true)
    try {
      console.log(`[Widgets] Fetching widgets for organization: ${orgId}`)

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
      console.log(`[Widgets] Successfully fetched ${data.length || 0} widgets`)
      console.log("[Widgets] Widget data:", data)
      setWidgets(data)
    } catch (error) {
      console.error("[Widgets] Error fetching widgets:", error)
      toast.error(`Failed to fetch widgets: ${error instanceof Error ? error.message : "Unknown error"}`)
    } finally {
      setLoading(false)
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

    setLoading(true)

    // Optimistic update: Remove widget from UI immediately
    setWidgets((prevWidgets) => prevWidgets.filter((w) => w.id !== widgetToDeleteId))

    // Close dialog immediately for better UX
    setIsDeleteDialogOpen(false)
    const deletedWidget = widgetToDelete
    setWidgetToDelete(null)

    try {
      console.log(`[Widgets] Deleting widget: ${deletedWidget.widget_key}`)
      const response = await fetch(`/api/widgets/widget/${deletedWidget.widget_key}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || "Failed to delete widget")
      }

      toast.success("Widget deleted successfully!")
      console.log("[Widgets] Widget deleted, refreshing list...")

      // Refresh the widget list to ensure consistency with backend
      await fetchWidgets(selectedOrganizationId)
    } catch (error) {
      console.error("[Widgets] Error deleting widget:", error)
      toast.error(`Failed to delete widget: ${error instanceof Error ? error.message : "Unknown error"}`)

      // Revert optimistic update on error
      await fetchWidgets(selectedOrganizationId)
    } finally {
      setLoading(false)
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

    setLoading(true)

    const formData = new FormData()
    // Use selectedOrganizationId from hook instead of editWidget.organization_id
    formData.append("organization_id", selectedOrganizationId)
    formData.append("assistant_id", editWidget.assistant.id)
    formData.append("widget_name", editWidget.widget_name)
    formData.append("website_url", editWidget.website_url)
    formData.append("brand_color", brandColor)

    if (avatarFile) {
      formData.append("avatar_url", avatarFile)
    }

    // Log FormData contents for debugging
    console.log("[Widgets] Update payload:")
    for (const [key, value] of Array.from(formData.entries())) {
      console.log(`  ${key}:`, value instanceof File ? `File(${value.name})` : value)
    }

    try {
      console.log(`[Widgets] Updating widget: ${editWidget.widget_key}`)

      // Optimistic update: Update widget in UI immediately
      const optimisticWidget = {
        ...editWidget,
        widget_name: editWidget.widget_name,
        website_url: editWidget.website_url,
        brand_color: brandColor,
      }
      setWidgets((prevWidgets) =>
        prevWidgets.map((w) => (w.id === editWidget.id ? optimisticWidget : w))
      )

      const response = await fetch(`/api/widgets/widget/${editWidget.widget_key}`, {
        method: "PUT",
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || "Failed to update widget")
      }

      const updatedData = await response.json()
      console.log("[Widgets] Widget updated successfully:", updatedData)

      toast.success("Widget updated successfully!")

      // Reset edit state
      setIsEditDialogOpen(false)
      setEditWidget(null)
      setAvatarFile(null)
      setAvatarUrl(null)

      // Refresh the widget list to show actual updated data from server
      console.log("[Widgets] Refreshing widget list after update...")
      await fetchWidgets(selectedOrganizationId)
    } catch (error) {
      console.error("[Widgets] Error updating widget:", error)
      toast.error(`Failed to update widget: ${error instanceof Error ? error.message : "Unknown error"}`)

      // Revert optimistic update on error
      await fetchWidgets(selectedOrganizationId)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateWidget = () => {
    router.push("/dashboard/playground")
  }

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <label className="block text-sm font-semibold text-foreground">Organization</label>
        {userMemberships && userMemberships.data && userMemberships.data.length > 1 && (
          <div className="w-full max-w-xs">
            <Select value={selectedOrganizationId} onValueChange={setSelectedOrganizationId}>
              <SelectTrigger className="h-11">
                <SelectValue placeholder="Select an organization" />
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
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-96">
          <Loader className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          <Card
            className="h-[280px] border-dashed border-2 hover:border-primary/50 hover:bg-accent/30 cursor-pointer flex items-center justify-center transition-all duration-200 rounded-xl group"
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
              className="h-[280px] flex flex-col rounded-xl hover:shadow-lg transition-shadow duration-200 border-border/60"
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Bot className="h-5 w-5 text-primary" />
                    </div>
                    <CardTitle className="text-lg leading-tight">{widget.widget_name}</CardTitle>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex-grow space-y-3 pb-3">
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
                        setWidgets(widgets.map((w) => (w.id === widget.id ? { ...w, showKey: !w.showKey } : w)))
                      }}
                    >
                      {widget.showKey ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                    </Button>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground pt-1">Created {formatDate(widget.created_at)}</p>
              </CardContent>
              <CardFooter className="flex gap-2 pt-3 border-t border-border/40">
                <Button
                  className="flex-1 h-9 bg-transparent"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setSelectedWidget({
                      key: widget.widget_key,
                      url: widget.website_url,
                    })
                  }
                >
                  <span className="text-xs font-medium">Deploy</span>
                </Button>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-9 w-9 p-0 bg-transparent"
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
                        className="h-9 w-9 p-0 text-destructive hover:text-destructive hover:bg-destructive/10 bg-transparent"
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
          ))}
        </div>
      )}

      {widgets.length === 0 && !loading && (
        <div className="text-center py-16 px-4">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
            <Bot className="h-8 w-8 text-muted-foreground" />
          </div>
          <p className="text-lg font-semibold text-foreground mb-2">No widgets found</p>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            Create your first widget to start building intelligent experiences for your website.
          </p>
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
          <DialogContent className="sm:max-w-[480px] rounded-xl">
            <DialogHeader className="space-y-2">
              <DialogTitle className="text-xl font-semibold">Update Widget</DialogTitle>
              <DialogDescription className="text-sm">
                Update your widget configuration and appearance settings.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleUpdateWidget} className="space-y-5 pt-2">
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
              <div className="flex gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1 h-11 bg-transparent"
                  onClick={() => setIsEditDialogOpen(false)}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button type="submit" className="flex-1 h-11" disabled={loading}>
                  {loading ? (
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
              disabled={loading}
            >
              Cancel
            </Button>
            <Button variant="destructive" className="flex-1 h-11" onClick={confirmDeleteWidget} disabled={loading}>
              {loading ? (
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
    </div>
  )
}

export default Widgets
