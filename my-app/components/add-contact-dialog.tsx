"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Spinner } from "@/components/ui/spinner"
import { TagInput } from "@/components/contacts-tag-input"
import useActiveOrganizationId from "@/hooks/use-organization-id"
import { toast } from "sonner"
import { Plus } from "lucide-react"

interface Tag {
  id: number
  name: string
  slug: string
}

interface AddContactDialogProps {
  tags: Tag[]
  onSuccess: () => void
  onTagsChange: () => void
}

export function AddContactDialog({ tags, onSuccess, onTagsChange }: AddContactDialogProps) {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    fullname: "",
    email: "",
    phone: "",
    information_source: "manual",
  })
  const [selectedTags, setSelectedTags] = useState<Tag[]>([])
  const organizationId = useActiveOrganizationId()

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
    if (!organizationId) return

    // Validate required fields
    if (!formData.phone) {
      toast.error("Phone number is required")
      return
    }

    try {
      setIsLoading(true)

      const payload = {
        ...formData,
        organization: organizationId,
        tag_slugs: selectedTags.map((tag) => tag.slug),
      }

      const response = await fetch("/api/contacts/contacts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to create contact")
      }

      toast.success("Contact created successfully")

      // Reset form
      setFormData({
        fullname: "",
        email: "",
        phone: "",
        information_source: "manual",
      })
      setSelectedTags([])
      setOpen(false)
      onSuccess()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to create contact")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="bg-[#007fff] hover:bg-[#007fff]/90 gap-2">
          <Plus className="h-4 w-4" />
          Add Contact
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add New Contact</DialogTitle>
          <DialogDescription>Create a new contact manually. Phone number is required.</DialogDescription>
        </DialogHeader>
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
              Phone Number <span className="text-destructive">*</span>
            </Label>
            <Input
              id="phone"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="+1234567890"
              disabled={isLoading}
              required
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
            <Label htmlFor="tags">Tags (Optional)</Label>
            <TagInput
              selectedTags={selectedTags}
              availableTags={tags}
              onTagsChange={setSelectedTags}
              onCreateTag={handleCreateTag}
              placeholder="Type to search or create tags..."
            />
          </div>

          <div className="flex gap-2 justify-end pt-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading} className="gap-2">
              {isLoading && <Spinner className="w-4 h-4" />}
              Create Contact
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
