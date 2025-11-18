"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Spinner } from "@/components/ui/spinner"
import { TagInput } from "@/components/contacts-tag-input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import useActiveOrganizationId from "@/hooks/use-organization-id"
import { toast } from "sonner"

interface Tag {
  id: number
  name: string
  slug: string
}

interface Contact {
  id: number
  fullname: string
  email: string
  phone: string
  tags: Tag[]
  created_at: string
  information_source?: string
}

interface EditContactDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  contact: Contact | null
  tags: Tag[]
  onSuccess: () => void
  onTagsChange: () => void
}

export function EditContactDialog({ open, onOpenChange, contact, tags, onSuccess, onTagsChange }: EditContactDialogProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [editMode, setEditMode] = useState<"partial" | "full">("partial")
  const [formData, setFormData] = useState({
    fullname: "",
    email: "",
    phone: "",
    information_source: "",
  })
  const [selectedTags, setSelectedTags] = useState<Tag[]>([])
  const organizationId = useActiveOrganizationId()

  // Initialize form data when contact changes or dialog opens
  useEffect(() => {
    if (contact && open) {
      setFormData({
        fullname: contact.fullname || "",
        email: contact.email || "",
        phone: contact.phone || "",
        information_source: contact.information_source || "",
      })
      setSelectedTags(contact.tags || [])
    }
  }, [contact, open])

  const handleCreateTag = async (tagName: string): Promise<Tag> => {
    const response = await fetch("/api/contacts/tags", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: tagName,
        organization: organizationId,
      }),
    })

    if (!response.ok) throw new Error("Failed to create tag")

    const newTag = await response.json()
    onTagsChange()
    return newTag
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!contact || !organizationId) return

    try {
      setIsLoading(true)

      let payload: any
      let method: string

      if (editMode === "partial") {
        // PATCH - Partial update
        method = "PATCH"
        payload = {}

        // Only include fields that have changed
        if (formData.fullname !== contact.fullname) payload.fullname = formData.fullname
        if (formData.email !== contact.email) payload.email = formData.email
        if (formData.phone !== contact.phone) payload.phone = formData.phone
        if (formData.information_source !== contact.information_source) payload.information_source = formData.information_source

        // Check if tags changed
        const currentTagSlugs = contact.tags.map(t => t.slug).sort()
        const newTagSlugs = selectedTags.map(t => t.slug).sort()
        if (JSON.stringify(currentTagSlugs) !== JSON.stringify(newTagSlugs)) {
          payload.tag_slugs = selectedTags.map((tag) => tag.slug)
        }

        // If nothing changed, don't make the request
        if (Object.keys(payload).length === 0) {
          toast.info("No changes to save")
          setIsLoading(false)
          return
        }
      } else {
        // PUT - Full update
        method = "PUT"

        // Validate required fields for full update
        if (!formData.phone) {
          toast.error("Phone number is required for full update")
          setIsLoading(false)
          return
        }

        payload = {
          fullname: formData.fullname,
          email: formData.email,
          phone: formData.phone,
          information_source: formData.information_source,
          organization: organizationId,
          tag_slugs: selectedTags.map((tag) => tag.slug),
        }
      }

      const response = await fetch(`/api/contacts/contacts/${contact.id}`, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to update contact")
      }

      toast.success("Contact updated successfully")

      // Close dialog and refresh immediately
      onOpenChange(false)

      // Call onSuccess to refresh the contacts list
      onSuccess()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update contact")
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = () => {
    onOpenChange(false)
    // Reset form to original values
    if (contact) {
      setFormData({
        fullname: contact.fullname || "",
        email: contact.email || "",
        phone: contact.phone || "",
        information_source: contact.information_source || "",
      })
      setSelectedTags(contact.tags || [])
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Edit Contact</DialogTitle>
          <DialogDescription>
            Update contact information. Choose between partial or full update.
          </DialogDescription>
        </DialogHeader>

        <Tabs value={editMode} onValueChange={(value) => setEditMode(value as "partial" | "full")} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="partial">Partial Update</TabsTrigger>
            <TabsTrigger value="full">Full Update</TabsTrigger>
          </TabsList>

          <TabsContent value="partial" className="mt-4">
            <div className="text-sm text-muted-foreground mb-4">
              Update only the fields you want to change. Other fields will remain unchanged.
            </div>
          </TabsContent>

          <TabsContent value="full" className="mt-4">
            <div className="text-sm text-muted-foreground mb-4">
              All fields will be updated. Phone number is required for full update.
            </div>
          </TabsContent>
        </Tabs>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fullname">Full Name</Label>
            <Input
              id="fullname"
              value={formData.fullname}
              onChange={(e) => setFormData({ ...formData, fullname: e.target.value })}
              placeholder="John Doe"
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">
              Phone Number {editMode === "full" && <span className="text-destructive">*</span>}
            </Label>
            <Input
              id="phone"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="+1234567890"
              disabled={isLoading}
              required={editMode === "full"}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="john.doe@example.com"
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="source">Information Source</Label>
            <Input
              id="source"
              value={formData.information_source}
              onChange={(e) => setFormData({ ...formData, information_source: e.target.value })}
              placeholder="e.g., website, referral, event"
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="tags">Tags</Label>
            <TagInput
              selectedTags={selectedTags}
              availableTags={tags}
              onTagsChange={setSelectedTags}
              onCreateTag={handleCreateTag}
              placeholder="Type to search or create tags..."
            />
          </div>

          <div className="flex gap-2 justify-end pt-2">
            <Button type="button" variant="outline" onClick={handleCancel} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading} className="gap-2">
              {isLoading && <Spinner className="w-4 h-4" />}
              {editMode === "partial" ? "Update Fields" : "Update All"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
