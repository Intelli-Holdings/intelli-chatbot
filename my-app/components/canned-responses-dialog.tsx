"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import { useCannedResponses } from "@/hooks/use-canned-responses"
import type { CannedResponse } from "@/types/canned-responses"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { toast } from "sonner"
import {
  Search,
  Plus,
  Trash2,
  Save,
  MessageSquareText,
  Loader2,
  ArrowDownToLine,
  Hash,
  Pencil,
} from "lucide-react"

interface CannedResponsesDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  organizationId: string | undefined
  onInsert: (content: string) => void
}

export function CannedResponsesDialog({
  open,
  onOpenChange,
  organizationId,
  onInsert,
}: CannedResponsesDialogProps) {
  const {
    cannedResponses,
    loading,
    fetchCannedResponses,
    createCannedResponse,
    updateCannedResponse,
    deleteCannedResponse,
    recordUsage,
  } = useCannedResponses(organizationId)

  // Selection & filter state
  const [search, setSearch] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [selectedId, setSelectedId] = useState<number | null>(null)

  // Form state
  const [isCreating, setIsCreating] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [formTitle, setFormTitle] = useState("")
  const [formContent, setFormContent] = useState("")
  const [formShortcut, setFormShortcut] = useState("")
  const [formCategory, setFormCategory] = useState("")
  const [isSaving, setIsSaving] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  // Fetch on open
  useEffect(() => {
    if (open && organizationId) {
      fetchCannedResponses()
    }
  }, [open, organizationId, fetchCannedResponses])

  // Reset when dialog closes
  useEffect(() => {
    if (!open) {
      setSelectedId(null)
      setIsCreating(false)
      setIsEditing(false)
      setShowDeleteConfirm(false)
      setSearch("")
      setSelectedCategory(null)
      resetForm()
    }
  }, [open])

  const resetForm = () => {
    setFormTitle("")
    setFormContent("")
    setFormShortcut("")
    setFormCategory("")
  }

  // Derived data
  const categories = useMemo(() => {
    const cats = new Set<string>()
    cannedResponses.forEach((r) => {
      if (r.category) cats.add(r.category)
    })
    return Array.from(cats).sort()
  }, [cannedResponses])

  const filteredResponses = useMemo(() => {
    return cannedResponses.filter((r) => {
      const matchesSearch =
        !search ||
        r.title.toLowerCase().includes(search.toLowerCase()) ||
        r.content.toLowerCase().includes(search.toLowerCase()) ||
        (r.shortcut && r.shortcut.toLowerCase().includes(search.toLowerCase()))
      const matchesCategory = !selectedCategory || r.category === selectedCategory
      return matchesSearch && matchesCategory
    })
  }, [cannedResponses, search, selectedCategory])

  const selectedResponse = useMemo(
    () => cannedResponses.find((r) => r.id === selectedId) || null,
    [cannedResponses, selectedId]
  )

  // Handlers
  const handleSelect = useCallback(
    (response: CannedResponse) => {
      setSelectedId(response.id)
      setIsCreating(false)
      setIsEditing(false)
      setShowDeleteConfirm(false)
      setFormTitle(response.title)
      setFormContent(response.content)
      setFormShortcut(response.shortcut || "")
      setFormCategory(response.category || "")
    },
    []
  )

  const handleEditClick = () => {
    setIsEditing(true)
  }

  const handleNewClick = () => {
    setSelectedId(null)
    setIsCreating(true)
    resetForm()
  }

  const handleSave = async () => {
    if (!formTitle.trim()) {
      toast.error("Title is required")
      return
    }
    if (!formContent.trim()) {
      toast.error("Content is required")
      return
    }

    setIsSaving(true)
    try {
      const input = {
        title: formTitle.trim(),
        content: formContent.trim(),
        shortcut: formShortcut.trim() || undefined,
        category: formCategory.trim() || undefined,
      }

      if (isCreating) {
        const created = await createCannedResponse(input)
        if (created) {
          toast.success("Response created")
          setIsCreating(false)
          setIsEditing(false)
          setSelectedId(created.id)
        }
      } else if (selectedId) {
        const updated = await updateCannedResponse(selectedId, input)
        if (updated) {
          toast.success("Response updated")
          setIsEditing(false)
        }
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to save")
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeleteClick = () => {
    setShowDeleteConfirm(true)
  }

  const handleDeleteConfirm = async () => {
    if (!selectedId) return
    const success = await deleteCannedResponse(selectedId)
    if (success) {
      toast.success("Response deleted")
      setSelectedId(null)
      setIsEditing(false)
      setShowDeleteConfirm(false)
      resetForm()
    }
  }

  const handleInsert = () => {
    if (!selectedResponse) return
    recordUsage(selectedResponse.id)
    onInsert(selectedResponse.content)
    onOpenChange(false)
  }

  const showForm = isCreating || isEditing

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl p-0 gap-0 overflow-hidden flex flex-col max-h-[85vh]">
        <DialogHeader className="px-6 py-4 border-b shrink-0">
          <DialogTitle>Canned Responses</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-5 flex-1 min-h-0">
          {/* Left Panel — Response List */}
          <div className="col-span-2 border-r flex flex-col min-h-0">
            {/* Search */}
            <div className="p-3 border-b">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  placeholder="Search responses..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-8 h-9 text-sm"
                />
              </div>
            </div>

            {/* Category pills + New button */}
            <div className="px-3 pt-2 pb-1 border-b space-y-2">
              {categories.length > 0 && (
                <div className="flex gap-1 flex-wrap">
                  <button
                    onClick={() => setSelectedCategory(null)}
                    className={`px-2.5 py-1 text-[11px] font-medium rounded-full transition-colors ${
                      selectedCategory === null
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground hover:bg-muted/80"
                    }`}
                  >
                    ALL
                  </button>
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-2.5 py-1 text-[11px] font-medium rounded-full transition-colors ${
                        selectedCategory === cat
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground hover:bg-muted/80"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              )}
              <Button
                variant="outline"
                size="sm"
                className="w-full h-8 text-xs"
                onClick={handleNewClick}
              >
                <Plus className="h-3.5 w-3.5 mr-1.5" />
                New Response
              </Button>
            </div>

            {/* Response list */}
            <ScrollArea className="flex-1">
              {loading ? (
                <div className="flex items-center justify-center h-20">
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                </div>
              ) : filteredResponses.length === 0 ? (
                <div className="flex items-center justify-center h-32">
                  <div className="text-center text-muted-foreground">
                    <MessageSquareText className="h-8 w-8 mx-auto mb-2 opacity-40" />
                    <p className="text-xs">
                      {cannedResponses.length === 0
                        ? "No responses yet"
                        : "No matches"}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="p-2 space-y-0.5">
                  {filteredResponses.map((response) => {
                    const isSelected = selectedId === response.id && !isCreating
                    return (
                      <button
                        key={response.id}
                        className={`w-full text-left px-3 py-2.5 rounded-lg transition-colors ${
                          isSelected
                            ? "bg-primary/10 border-l-2 border-primary"
                            : "hover:bg-muted/50"
                        }`}
                        onClick={() => handleSelect(response)}
                      >
                        <div className="flex items-center gap-1.5">
                          <span className="text-sm font-medium truncate flex-1">
                            {response.title}
                          </span>
                          {response.shortcut && (
                            <Badge variant="secondary" className="text-[10px] px-1.5 py-0 shrink-0">
                              {response.shortcut}
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                          {response.content}
                        </p>
                        {response.usage_count > 0 && (
                          <p className="text-[10px] text-muted-foreground/60 mt-1">
                            Used {response.usage_count} time{response.usage_count !== 1 ? "s" : ""}
                          </p>
                        )}
                      </button>
                    )
                  })}
                </div>
              )}
            </ScrollArea>
          </div>

          {/* Right Panel — Preview or Editor */}
          <div className="col-span-3 flex flex-col min-h-0">
            {!selectedResponse && !isCreating ? (
              /* Empty state */
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center text-muted-foreground">
                  <MessageSquareText className="h-10 w-10 mx-auto mb-3 opacity-40" />
                  <p className="text-sm font-medium">Select or create a response</p>
                  <p className="text-xs mt-1">
                    Choose from the list or click &quot;New Response&quot;
                  </p>
                </div>
              </div>
            ) : showForm ? (
              /* Edit / Create form */
              <>
                <ScrollArea className="flex-1 w-full">
                  <div className="p-4 space-y-4 overflow-hidden">
                    <h4 className="text-sm font-semibold">
                      {isCreating ? "New Response" : "Edit Response"}
                    </h4>

                    <div className="space-y-1.5">
                      <Label className="text-xs font-medium">Title *</Label>
                      <Input
                        placeholder="e.g. Welcome greeting"
                        value={formTitle}
                        onChange={(e) => setFormTitle(e.target.value)}
                        className="h-9 text-sm"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-xs font-medium">Shortcut</Label>
                      <div className="relative">
                        <Hash className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                        <Input
                          placeholder="e.g. /welcome"
                          value={formShortcut}
                          onChange={(e) => setFormShortcut(e.target.value)}
                          className="h-9 text-sm pl-8"
                        />
                      </div>
                      <p className="text-[11px] text-muted-foreground">
                        Optional shortcut for quick access
                      </p>
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-xs font-medium">Category</Label>
                      <Input
                        placeholder="e.g. Greeting, FAQ, Closing"
                        value={formCategory}
                        onChange={(e) => setFormCategory(e.target.value)}
                        className="h-9 text-sm"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-xs font-medium">Content *</Label>
                      <Textarea
                        placeholder="Type your canned response content here..."
                        value={formContent}
                        onChange={(e) => setFormContent(e.target.value)}
                        className="min-h-[120px] text-sm resize-y"
                        rows={5}
                      />
                    </div>

                    {!isCreating && selectedId && showDeleteConfirm && (
                      <div className="flex items-center justify-between gap-2 p-2.5 bg-destructive/10 border border-destructive/20 rounded-lg">
                        <span className="text-xs text-destructive font-medium">Delete this response?</span>
                        <div className="flex items-center gap-1.5">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 text-xs"
                            onClick={() => setShowDeleteConfirm(false)}
                          >
                            Cancel
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            className="h-7 text-xs"
                            onClick={handleDeleteConfirm}
                          >
                            Delete
                          </Button>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-2">
                      {!isCreating && selectedId ? (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={handleDeleteClick}
                        >
                          <Trash2 className="h-3.5 w-3.5 mr-1.5" />
                          Delete
                        </Button>
                      ) : (
                        <div />
                      )}
                      <Button
                        size="sm"
                        onClick={handleSave}
                        disabled={isSaving || !formTitle.trim() || !formContent.trim()}
                      >
                        {isSaving ? (
                          <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                        ) : (
                          <Save className="h-3.5 w-3.5 mr-1.5" />
                        )}
                        {isCreating ? "Create" : "Save"}
                      </Button>
                    </div>
                  </div>
                </ScrollArea>
              </>
            ) : (
              /* Read-only preview */
              <>
                <ScrollArea className="flex-1 w-full">
                  <div className="p-5 space-y-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h4 className="text-base font-semibold truncate">
                          {selectedResponse!.title}
                        </h4>
                        <div className="flex items-center gap-2 mt-1.5">
                          {selectedResponse!.shortcut && (
                            <Badge variant="secondary" className="text-[11px] px-2 py-0.5">
                              {selectedResponse!.shortcut}
                            </Badge>
                          )}
                          {selectedResponse!.category && (
                            <Badge variant="outline" className="text-[11px] px-2 py-0.5">
                              {selectedResponse!.category}
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 text-xs"
                          onClick={handleEditClick}
                        >
                          <Pencil className="h-3.5 w-3.5 mr-1.5" />
                          Edit
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 text-xs text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={handleDeleteClick}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>

                    <div className="bg-muted/50 rounded-lg p-4">
                      <p className="text-sm whitespace-pre-wrap leading-relaxed">
                        {selectedResponse!.content}
                      </p>
                    </div>

                    {selectedResponse!.usage_count > 0 && (
                      <p className="text-[11px] text-muted-foreground/60">
                        Used {selectedResponse!.usage_count} time{selectedResponse!.usage_count !== 1 ? "s" : ""}
                      </p>
                    )}
                  </div>
                </ScrollArea>

                <div className="p-4 border-t shrink-0 space-y-2">
                  {showDeleteConfirm && (
                    <div className="flex items-center justify-between gap-2 p-2.5 bg-destructive/10 border border-destructive/20 rounded-lg">
                      <span className="text-xs text-destructive font-medium">Delete this response?</span>
                      <div className="flex items-center gap-1.5">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 text-xs"
                          onClick={() => setShowDeleteConfirm(false)}
                        >
                          Cancel
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          className="h-7 text-xs"
                          onClick={handleDeleteConfirm}
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                  )}
                  <Button className="w-full" onClick={handleInsert}>
                    <ArrowDownToLine className="h-4 w-4 mr-2" />
                    Use response
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
