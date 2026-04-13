"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form"
import { Spinner } from "@/components/ui/spinner"
import { TagInput } from "@/components/contacts-tag-input"
import useActiveOrganizationId from "@/hooks/use-organization-id"
import { toast } from "sonner"
import { Plus } from "lucide-react"
import { addContactSchema, type AddContactFormData } from "@/lib/validations/forms"

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
  const [selectedTags, setSelectedTags] = useState<Tag[]>([])
  const organizationId = useActiveOrganizationId()

  const form = useForm<AddContactFormData>({
    resolver: zodResolver(addContactSchema),
    defaultValues: {
      fullname: "",
      email: "",
      phone: "",
      information_source: "manual",
    },
  })

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

  const onSubmit = async (data: AddContactFormData) => {
    if (!organizationId) return

    try {
      setIsLoading(true)

      const payload = {
        ...data,
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

      form.reset()
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
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="fullname"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input placeholder="John Doe" disabled={isLoading} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Phone Number <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="+234XXXXXXXXXX" disabled={isLoading} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="john.doe@example.com" disabled={isLoading} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="information_source"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Information Source</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., website, referral, event" disabled={isLoading} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-2">
              <FormLabel>Tags (Optional)</FormLabel>
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
        </Form>
      </DialogContent>
    </Dialog>
  )
}
