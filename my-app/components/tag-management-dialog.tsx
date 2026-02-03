"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Spinner } from "@/components/ui/spinner"
import { toast } from "@/hooks/use-toast"
import useActiveOrganizationId from "@/hooks/use-organization-id"
import { Trash2 } from "lucide-react"

interface Tag {
  id: number
  name: string
  slug: string
}

interface TagManagementDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  tags: Tag[]
  onTagsChange: () => void
  embedded?: boolean
}

export function TagManagementDialog({ open, onOpenChange, tags, onTagsChange, embedded }: TagManagementDialogProps) {
  const [tagName, setTagName] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const organizationId = useActiveOrganizationId()

  const handleCreateTag = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!tagName.trim() || !organizationId) return

    try {
      setIsLoading(true)
      const response = await fetch("/api/contacts/tags", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: tagName,
          organization: organizationId,
        }),
      })

      if (!response.ok) throw new Error("Failed to create tag")

      toast({
        title: "Success",
        description: "Tag created successfully",
      })

      setTagName("")
      onTagsChange()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create tag",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteTag = async (tagId: number) => {
    if (!confirm("Are you sure you want to delete this tag?")) return

    try {
      const response = await fetch(`/api/contacts/tags/${tagId}`, {
        method: "DELETE",
      })

      if (!response.ok) throw new Error("Failed to delete tag")

      toast({
        title: "Success",
        description: "Tag deleted successfully",
      })

      onTagsChange()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete tag",
        variant: "destructive",
      })
    }
  }

  const content = (
    <div className="space-y-4">
      <form onSubmit={handleCreateTag} className="space-y-3">
        <div className="space-y-2">
          <Label htmlFor="tag-name">New Tag Name</Label>
          <Input
            id="tag-name"
            value={tagName}
            onChange={(e) => setTagName(e.target.value)}
            placeholder="e.g., VIP Customer, Premium, etc."
            disabled={isLoading}
          />
        </div>
        <Button type="submit" disabled={!tagName.trim() || isLoading} className="w-full gap-2">
          {isLoading && <Spinner className="w-4 h-4" />}
          Create Tag
        </Button>
      </form>

      <div className="space-y-2">
        <Label>Existing Tags</Label>
        <div className="space-y-2 max-h-[300px] overflow-y-auto">
          {tags.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">No tags created yet</p>
          ) : (
            tags.map((tag) => (
              <div key={tag.id} className="flex items-center justify-between p-2 rounded-md border bg-card">
                <Badge variant="secondary">{tag.name}</Badge>
                <Button
                  onClick={() => handleDeleteTag(tag.id)}
                  variant="ghost"
                  size="sm"
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )

  if (embedded) {
    return content
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Manage Tags</DialogTitle>
          <DialogDescription>Create and manage tags to categorize your contacts</DialogDescription>
        </DialogHeader>
        {content}
      </DialogContent>
    </Dialog>
  )
}
