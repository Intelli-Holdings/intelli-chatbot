"use client"

import { useState, useEffect } from "react"
import { useOrganizationList, useAuth } from "@clerk/nextjs"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form"
import { Plus, Loader2, Clipboard } from "lucide-react"
import { toast } from "sonner"
import { logger } from "@/lib/logger"
import { createAssistantSchema, type CreateAssistantFormData } from "@/lib/validations/forms"

interface CreateAssistantDialogProps {
  onAssistantCreated: () => void
}

export function CreateAssistantDialog({ onAssistantCreated }: CreateAssistantDialogProps) {
  const { getToken } = useAuth()
  const { userMemberships, isLoaded } = useOrganizationList({
    userMemberships: {
      infinite: true,
    },
  })

  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<CreateAssistantFormData>({
    resolver: zodResolver(createAssistantSchema),
    defaultValues: {
      name: "",
      prompt: "",
      organization_id: "",
    },
  })

  useEffect(() => {
    if (isLoaded && userMemberships?.data?.length > 0 && !form.getValues("organization_id")) {
      form.setValue("organization_id", userMemberships.data[0].organization.id)
    }
  }, [isLoaded, userMemberships, form])

  const onSubmit = async (data: CreateAssistantFormData) => {
    setIsLoading(true)
    try {
      logger.info("Submitting data to backend:", { data })

      const token = await getToken()

      const response = await fetch(`/api/assistants/${data.organization_id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        logger.error("Assistant creation failed:", {
          status: response.status,
          statusText: response.statusText,
        })
        throw new Error("Failed to create assistant")
      }

      toast.success(
        "Assistant created successfully; Please visit the widgets page to create a widget with this assistant",
      )
      setOpen(false)
      onAssistantCreated()
      form.reset()
    } catch (error) {
      logger.error("Error creating assistant:", {
        error: error instanceof Error ? error.message : String(error),
      })
      toast.error("Failed to create assistant")
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
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="organization_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Organization</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select an organization" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectGroup>
                        {isLoaded &&
                          userMemberships?.data?.map((membership) => (
                            <SelectItem key={membership.organization.id} value={membership.organization.id}>
                              {membership.organization.name}
                            </SelectItem>
                          ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Assistant name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="prompt"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Instructions</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Assistant prompt/instructions" className="min-h-[100px]" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Assistant"
              )}
            </Button>
          </form>
        </Form>
        <DialogFooter>
          <div className="flex items-center justify-between mt-1">
            <div>
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  const exampleText = document.getElementById("example-prompt-text")
                  const button = e.currentTarget
                  if (exampleText) {
                    const isHidden = exampleText.classList.toggle("hidden")
                    button.textContent = isHidden ? "Show Example Instructions" : "Hide Example Instructions"
                  }
                }}
              >
                Show Example Instructions
              </Button>

              <div
                id="example-prompt-text"
                className="hidden text-xs text-gray-500 mt-2 p-3 border rounded-md bg-gray-50 max-w-[600px]"
              >
                Example: &quot;You are a customer support assistant for [Your Company Name], a [briefly describe your
                business, e.g., &quot;subscription-based meal kit service&quot;]. Your role is to help customers with
                [key services, e.g., &quot;order changes, recipe questions, and account issues&quot;] while being [tone,
                e.g., &quot;approachable, professional, or upbeat&quot;]. Always align with our brand voice
                below.&quot;
                <p className="font-medium mt-1">Brand Voice &amp; Style</p>
                - Tone: [e.g., &quot;Friendly but concise. Use simple language and occasional emojis like &quot;]
                <br />
                - Avoid/Never: [e.g., &quot;Technical jargon. Never say &quot;That is not my job.&quot;]
                <br />- Key phrases: [e.g., &quot;We&quot;ve got your back!&quot;, &quot;Let me help you with
                that.&quot;]
                <p className="font-medium mt-1">Services &amp; Solutions</p>- What we offer: [e.g., &quot;Weekly meal
                kits with pre-portioned ingredients and step-by-step recipes. Customizable plans for dietary
                needs.&quot;]
                <p className="font-medium mt-1">Resources</p>- Use these resources: Answer questions using the attached
                [knowledge base/FAQs, e.g., &quot;Recipe_Guide_2024.pdf&quot; or &quot;Delivery_Schedule.csv&quot;]. If
                unsure, say: [fallback message, e.g., &quot;I&quot;ll need to check with the team! For faster help,
                visit [Help Page Link]
                <p className="font-medium mt-1">Example Interactions</p>- Good response:
                <br />
                User: &quot;How do I skip a delivery?&quot;
                <br />
                Assistant: &quot;No problem! Go to &quot;Manage Deliveries&quot; in your account settings and select the
                week you&quot;d like to skip. Need a hand? I can guide you step by step!&quot;
                <br />
                -Avoid: [e.g., &quot;You have to do it yourself in the app.&quot;]
                <p className="font-medium mt-1">Response Rules</p>- Keep answers under [length, e.g., &quot;2-3
                sentences or bullet points&quot;].
                <br />- For [specific scenarios, e.g., &quot;recipe substitutions&quot;], follow this script: [e.g.,
                &quot;1. Ask about dietary needs. 2. Suggest alternatives (e.g., almond milk for dairy). 3. Link to our
                substitution guide.&quot;]
              </div>
            </div>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                const fullExampleText = `You are a customer support assistant for [Your Company Name], a [briefly describe your business, e.g., "subscription-based meal kit service"]. Your role is to help customers with [key services, e.g., "order changes, recipe questions, and account issues"] while being [tone, e.g., "approachable, professional, or upbeat"]. Always align with our brand voice below.

Brand Voice & Style
- Tone: [e.g., "Friendly but concise. Use simple language and occasional emojis like "]
- Avoid/Never: [e.g., "Technical jargon. Never say "That is not my job."]
- Key phrases: [e.g., "We've got your back!", "Let me help you with that."]

Services & Solutions
- What we offer: [e.g., "Weekly meal kits with pre-portioned ingredients and step-by-step recipes. Customizable plans for dietary needs."]

Resources
- Use these resources: Answer questions using the attached [knowledge base/FAQs, e.g., "Recipe_Guide_2024.pdf" or "Delivery_Schedule.csv"]. If unsure, say: [fallback message, e.g., "I'll need to check with the team! For faster help, visit [Help Page Link]

Example Interactions
- Good response:
User: "How do I skip a delivery?"
Assistant: "No problem! Go to "Manage Deliveries" in your account settings and select the week you'd like to skip. Need a hand? I can guide you step by step!"
-Avoid: [e.g., "You have to do it yourself in the app."]

Response Rules
- Keep answers under [length, e.g., "2–3 sentences or bullet points"].
- For [specific scenarios, e.g., "recipe substitutions"], follow this script: [e.g., "1. Ask about dietary needs. 2. Suggest alternatives (e.g., almond milk for dairy). 3. Link to our substitution guide."]`

                navigator.clipboard.writeText(fullExampleText).then(() => {
                  toast.success("Example prompt copied to clipboard")
                })
              }}
              title="Copy example prompt"
            >
              <Clipboard className="h-4 w-4" />
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
