'use client'

import { useState } from 'react'
import { useOrganization } from "@clerk/nextjs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { Plus } from 'lucide-react'
import { CreateAssistantData } from '@/types/assistant'

interface CreateAssistantDialogProps {
  onAssistantCreated: () => void;
}

export function CreateAssistantDialog({ onAssistantCreated }: CreateAssistantDialogProps) {
  const { organization } = useOrganization()
  const { toast } = useToast()
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    prompt: ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!organization) return

    setIsLoading(true)
    try {
      const data: CreateAssistantData = {
        ...formData,
        organizationId: organization.id
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/assistants/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error('Failed to create assistant')
      }

      toast({
        title: "Success",
        description: "Assistant created successfully",
      })
      setOpen(false)
      onAssistantCreated()
      setFormData({ name: '', prompt: '' })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create assistant",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="h-[240px] w-full border-dashed">
          <Plus className="mr-2 h-5 w-5" />
          Create Assistant
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Assistant</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Input
              placeholder="Assistant name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              required
            />
          </div>
          <div>
            <Textarea
              placeholder="Assistant prompt/instructions"
              value={formData.prompt}
              onChange={(e) => setFormData(prev => ({ ...prev, prompt: e.target.value }))}
              required
              className="min-h-[100px]"
            />
          </div>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Creating..." : "Create Assistant"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}

