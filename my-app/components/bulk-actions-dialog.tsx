"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Spinner } from "@/components/ui/spinner"
import { toast } from "sonner"
import { Trash2 } from "lucide-react"

interface Tag {
  id: number
  name: string
  slug: string
}

interface BulkActionsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  selectedIds: number[]
  tags: Tag[]
  onSuccess: () => void
}

export function BulkActionsDialog({ open, onOpenChange, selectedIds, tags, onSuccess }: BulkActionsDialogProps) {
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [action, setAction] = useState<"add" | "remove" | "delete">("add")

  const handleTagToggle = (slug: string) => {
    setSelectedTags((prev) => (prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug]))
  }

  const handleExecuteAction = async () => {
    try {
      setIsLoading(true)

      if (action === "delete") {
        const response = await fetch("/api/contacts/bulk-delete", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ids: selectedIds }),
        })

        if (!response.ok) throw new Error("Bulk delete failed")

        toast.success(`${selectedIds.length} contacts deleted`)
      } else if (action === "add") {
        if (selectedTags.length === 0) {
          toast.error("Please select at least one tag")
          return
        }

        const response = await fetch("/api/contacts/bulk-add-tags", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ids: selectedIds, tag_slugs: selectedTags }),
        })

        if (!response.ok) throw new Error("Bulk add tags failed")

        toast.success(`Tags added to ${selectedIds.length} contacts`)
      } else if (action === "remove") {
        if (selectedTags.length === 0) {
          toast.error("Please select at least one tag")
          return
        }

        const response = await fetch("/api/contacts/bulk-remove-tags", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ids: selectedIds, tag_slugs: selectedTags }),
        })

        if (!response.ok) throw new Error("Bulk remove tags failed")

        toast.success(`Tags removed from ${selectedIds.length} contacts`)
      }

      setSelectedTags([])
      setAction("add")
      onOpenChange(false)
      onSuccess()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Action failed")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Bulk Actions</DialogTitle>
          <DialogDescription>Perform actions on {selectedIds.length} selected contacts</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-3">
            <Label>Select Action</Label>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <input
                  type="radio"
                  id="action-add"
                  value="add"
                  checked={action === "add"}
                  onChange={(e) => setAction(e.target.value as "add")}
                  disabled={isLoading}
                />
                <Label htmlFor="action-add" className="cursor-pointer font-normal">
                  Add Tags
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="radio"
                  id="action-remove"
                  value="remove"
                  checked={action === "remove"}
                  onChange={(e) => setAction(e.target.value as "remove")}
                  disabled={isLoading}
                />
                <Label htmlFor="action-remove" className="cursor-pointer font-normal">
                  Remove Tags
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="radio"
                  id="action-delete"
                  value="delete"
                  checked={action === "delete"}
                  onChange={(e) => setAction(e.target.value as "delete")}
                  disabled={isLoading}
                />
                <Label htmlFor="action-delete" className="cursor-pointer font-normal">
                  Delete Contacts
                </Label>
              </div>
            </div>
          </div>

          {action !== "delete" && (
            <div className="space-y-2">
              <Label>Select Tags</Label>
              <div className="space-y-2 max-h-[200px] overflow-y-auto border rounded-md p-2">
                {tags.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No tags available</p>
                ) : (
                  tags.map((tag) => (
                    <div key={tag.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`tag-${tag.id}`}
                        checked={selectedTags.includes(tag.slug)}
                        onCheckedChange={() => handleTagToggle(tag.slug)}
                        disabled={isLoading}
                      />
                      <Label htmlFor={`tag-${tag.id}`} className="cursor-pointer font-normal">
                        {tag.name}
                      </Label>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          <div className="flex gap-2 justify-end pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
              Cancel
            </Button>
            <Button
              onClick={handleExecuteAction}
              disabled={isLoading}
              variant={action === "delete" ? "destructive" : "default"}
              className="gap-2"
            >
              {isLoading && <Spinner className="w-4 h-4" />}
              {action === "delete" ? (
                <>
                  <Trash2 className="w-4 h-4" />
                  Delete
                </>
              ) : (
                `${action === "add" ? "Add" : "Remove"} Tags`
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
