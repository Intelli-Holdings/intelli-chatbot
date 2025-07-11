"use client"

import React, { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"

interface Assistant {
  id: number
  name: string
  prompt: string
  assistant_id: string
  organization: string
  organization_id: string
}

interface EditAssistantDialogProps {
  isOpen: boolean
  onClose: () => void
  assistant: Assistant | null
  onAssistantUpdated: (updatedAssistants: Assistant[]) => void
  assistants: Assistant[]
}

export function EditAssistantDialog({
  isOpen,
  onClose,
  assistant,
  onAssistantUpdated,
  assistants,
}: EditAssistantDialogProps) {
  const [editedAssistant, setEditedAssistant] = useState<Assistant | null>(assistant)
  const [isEditing, setIsEditing] = useState(false)

  // Update local state when the assistant prop changes
  React.useEffect(() => {
    setEditedAssistant(assistant)
  }, [assistant])

  const handleEditAssistant = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!editedAssistant) return

    setIsEditing(true)

    // Backend Payload
    const payload = {
      id: editedAssistant.id,
      name: editedAssistant.name,
      prompt: editedAssistant.prompt,
      assistant_id: editedAssistant.assistant_id,
      organization: editedAssistant.organization,
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/assistants/${editedAssistant.id}/`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const errorData = await response.json()
        console.error("Error response:", errorData)
        throw new Error(errorData.detail || "Failed to edit assistant")
      }

      const updatedData = await response.json()
      const updatedAssistants = assistants.map((a) => (a.id === updatedData.id ? updatedData : a))

      onAssistantUpdated(updatedAssistants)
      toast.success("Assistant updated successfully!")
      onClose()
    } catch (error) {
      console.error("Error editing assistant:", error)
      toast.error("Failed to edit assistant. Please try again.")
    } finally {
      setIsEditing(false)
    }
  }

  if (!editedAssistant) return null

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Assistant</DialogTitle>
          <DialogDescription>Make changes to your assistant&apos;s configuration.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleEditAssistant} className="space-y-4">
          <Input
            value={editedAssistant.name}
            onChange={(e) => setEditedAssistant((prev) => (prev ? { ...prev, name: e.target.value } : null))}
            placeholder="Assistant Name"
            required
          />
          <Textarea
            value={editedAssistant.prompt}
            onChange={(e) => setEditedAssistant((prev) => (prev ? { ...prev, prompt: e.target.value } : null))}
            placeholder="Prompt"
            required
            className="min-h-[100px]"
          />
          <Input
            value={editedAssistant.assistant_id}
            onChange={(e) => setEditedAssistant((prev) => (prev ? { ...prev, assistant_id: e.target.value } : null))}
            placeholder="Assistant ID"
            required
          />
          <Button type="submit" disabled={isEditing}>
            {isEditing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Editing...
              </>
            ) : (
              "Save Changes"
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}