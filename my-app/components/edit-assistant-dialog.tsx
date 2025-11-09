"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useAuth } from "@clerk/nextjs"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import useActiveOrganizationId from "@/hooks/use-organization-id"

interface Assistant {
  id: number
  name: string
  prompt: string
  assistant_id: string
  organization: string
  organization_id: string
  type: string
  created_at: string
  updated_at: string
}

interface EditAssistantDialogProps {
  isOpen: boolean
  onClose: () => void
  assistant: Assistant | null
  onAssistantUpdated: (assistants: Assistant[]) => void
  assistants: Assistant[]
}

export function EditAssistantDialog({
  isOpen,
  onClose,
  assistant,
  onAssistantUpdated,
  assistants,
}: EditAssistantDialogProps) {
  const { getToken } = useAuth()
  const organizationId = useActiveOrganizationId()
  const [name, setName] = useState("")
  const [prompt, setPrompt] = useState("")
  const [assistantId, setAssistantId] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (assistant) {
      setName(assistant.name)
      setPrompt(assistant.prompt)
      setAssistantId(assistant.assistant_id)
    }
  }, [assistant])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!assistant || !name.trim() || !prompt.trim() || !assistantId.trim()) {
      toast.error("Please fill in all fields")
      return
    }

    if (!organizationId) {
      toast.error("No organization selected")
      return
    }

    setIsLoading(true)
    try {
      console.log(`[v0] Editing assistant ${assistant.id} for organization: ${organizationId}`)

      // Get the session token
      const token = await getToken()

      const response = await fetch(`/api/assistants/${organizationId}/${assistant.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          id: assistant.id,
          name: name.trim(),
          prompt: prompt.trim(),
          assistant_id: assistantId.trim(),
          organization: assistant.organization,
        }),
      })

      console.log(`[v0] Edit assistant response status: ${response.status}`)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || "Failed to update assistant")
      }

      const updatedData = await response.json()
      console.log(`[v0] Successfully updated assistant:`, updatedData)

      const updatedAssistants = assistants.map((a) => (a.id === updatedData.id ? updatedData : a))

      toast.success("Assistant updated successfully!")
      onAssistantUpdated(updatedAssistants)
      onClose()
    } catch (error) {
      console.error("[v0] Error updating assistant:", error)
      toast.error(`Failed to update assistant: ${error instanceof Error ? error.message : "Unknown error"}`)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Assistant</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit-name">Name</Label>
            <Input
              id="edit-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter assistant name"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-prompt">Prompt</Label>
            <Textarea
              id="edit-prompt"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Enter assistant prompt"
              rows={4}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-assistant-id">Assistant ID</Label>
            <Input
              id="edit-assistant-id"
              value={assistantId}
              onChange={(e) => setAssistantId(e.target.value)}
              placeholder="Enter assistant ID"
              required
            />
          </div>
          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Updating..." : "Update Assistant"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
