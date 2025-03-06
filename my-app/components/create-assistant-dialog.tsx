"use client"

import { useState, useEffect } from "react"
import { useOrganizationList } from "@clerk/nextjs"
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Plus } from "lucide-react"
import { toast } from "sonner"
import {
  Trophy,
  Sparkles,
  Rocket,
  Zap,
  Users,
  Building2,
  MessageSquare,
  Globe,
  Mail,
  Loader2, 
  Clipboard, 
  ClipboardCheck, 
  Info,
} from 'lucide-react';

interface CreateAssistantDialogProps {
  onAssistantCreated: () => void
}

export function CreateAssistantDialog({ onAssistantCreated }: CreateAssistantDialogProps) {
  const { userMemberships, isLoaded } = useOrganizationList({
    userMemberships: {
      infinite: true,
    },
  })

  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    prompt: "",
    organization_id: "",
  })
  const [selectedOrganizationId, setSelectedOrganizationId] = useState<string>("")

  useEffect(() => {
    if (isLoaded && userMemberships?.data?.length > 0 && !selectedOrganizationId) {
      setSelectedOrganizationId(userMemberships.data[0].organization.id)
    }
  }, [isLoaded, userMemberships, selectedOrganizationId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedOrganizationId) {
      console.log("Submission blocked: No organization selected")
      toast.error("Please select an organization")
      return
    }

    setIsLoading(true)
    try {
      const data = {
        name: formData.name,
        prompt: formData.prompt,
        organization_id: selectedOrganizationId,
      }

      console.log("Submitting data to backend:", data)

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/assistants/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        console.error("Assistant creation failed:", {
          status: response.status,
          statusText: response.statusText,
        })
        throw new Error("Failed to create assistant")
      }

      toast.success(
        "Assistant created successfully; Please visit the playground to create a widget with this assistant",
      )
      setOpen(false)
      onAssistantCreated()
      setFormData({ name: "", prompt: "", organization_id: "" })
    } catch (error) {
      console.error("Error creating assistant:", error)
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
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Organization</label>
            <Select value={selectedOrganizationId} onValueChange={(value) => setSelectedOrganizationId(value)}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select an organization" />
              </SelectTrigger>
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
          </div>
          <div>
            <Input
              placeholder="Assistant name"
              value={formData.name}
              onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
              required
            />
          </div>
          <div>
            <Textarea
              placeholder="Assistant prompt/instructions"
              value={formData.prompt}
              onChange={(e) => setFormData((prev) => ({ ...prev, prompt: e.target.value }))}
              required
              className="min-h-[100px]"
            />
          </div>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Creating..." : "Create Assistant"}
          </Button>
        </form>
        <DialogFooter>
        <div className="flex items-center justify-between mt-1">
                          <div>
                            {/* Show Example Button */}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                              const exampleText = document.getElementById('example-prompt-text');
                              const button = e.currentTarget;
                              if (exampleText) {
                                const isHidden = exampleText.classList.toggle('hidden');
                                // Update button text based on visibility state
                                button.textContent = isHidden ? 'Show Example Instructions' : 'Hide Example Instructions';
                              }
                              }}
                            >
                              Show Example Instructions
                            </Button>
                            
                            {/* Hidden Example Text */}
                            <div id="example-prompt-text" className="hidden text-xs text-gray-500 mt-2 p-3 border rounded-md bg-gray-50 max-w-[600px]">
                              Example: &quot;You are a customer support assistant for [Your Company Name], a  [briefly describe your business, e.g., &quot;subscription-based meal kit service&quot;]. Your role is to help customers with [key services, e.g., &quot;order changes, recipe questions, and account issues&quot;] while being [tone, e.g., &quot;approachable, professional, or upbeat&quot;]. Always align with our brand voice below.&quot; 
        
                              <p className="font-medium mt-1">Brand Voice & Style</p>
                              - Tone: [e.g., &quot;Friendly but concise. Use simple language and occasional emojis like &quot;]
                              - Avoid/Never: [e.g., &quot;Technical jargon. Never say &quot;That is not my job.&quot;]  
                              - Key phrases: [e.g., &quot;We&quot;ve got your back!&quot;, &quot;Let me help you with that.&quot;]  
        
                              <p className="font-medium mt-1">Services & Solutions</p>
                              - What we offer: [e.g., &quot;Weekly meal kits with pre-portioned ingredients and step-by-step recipes. Customizable plans for dietary needs.&quot;] 
        
                              <p className="font-medium mt-1">Resources</p>
                              - Use these resources: Answer questions using the attached [knowledge base/FAQs, e.g., &quot;Recipe_Guide_2024.pdf&quot; or &quot;Delivery_Schedule.csv&quot;]. If unsure, say: [fallback message, e.g., &quot;I&quot;ll need to check with the team! For faster help, visit [Help Page Link]  
        
                              <p className="font-medium mt-1">Example Interactions</p>
                              - Good response:  
                              User: &quot;How do I skip a delivery?&quot;*  
                              Assistant: *&quot;No problem! Go to &quot;Manage Deliveries&quot; in your account settings and select the week you&quot;d like to skip. Need a hand? I can guide you step by step! &quot;
                              -Avoid: [e.g., &quot;You have to do it yourself in the app.&quot;] 
        
                              <p className="font-medium mt-1">Response Rules</p>
                              - Keep answers under [length, e.g., &quot;2–3 sentences or bullet points&quot;].  
                              - For [specific scenarios, e.g., &quot;recipe substitutions&quot;], follow this script: [e.g., &quot;1. Ask about dietary needs. 2. Suggest alternatives (e.g., almond milk for dairy). 3. Link to our substitution guide.&quot;] 
                              &quot;
                            </div>
                          </div>
                          
                          {/* Copy Button with Icon - updated to copy full example text */}
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => {
                              const button = e.currentTarget;
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
        - For [specific scenarios, e.g., "recipe substitutions"], follow this script: [e.g., "1. Ask about dietary needs. 2. Suggest alternatives (e.g., almond milk for dairy). 3. Link to our substitution guide."]`;
                              
                              navigator.clipboard.writeText(fullExampleText)
                                .then(() => {
                                  // Change icon to check mark
                                  const icon = button.querySelector('svg');
                                  if (icon) {
                                    icon.innerHTML = '<path d="M20 6L9 17l-5-5"/>';
                                    icon.setAttribute('stroke', 'currentColor');
                                    icon.setAttribute('fill', 'none');
                                    icon.setAttribute('stroke-width', '2');
                                    icon.setAttribute('stroke-linecap', 'round');
                                    icon.setAttribute('stroke-linejoin', 'round');
                                  }
                                  
                                  toast.success("Example prompt copied to clipboard");
                                  
                                  // Reset after 2 seconds
                                  setTimeout(() => {
                                    if (icon) {
                                      icon.innerHTML = '<path d="M16 4h2a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/><path d="M8 10h8"/><path d="M8 14h8"/><path d="M8 18h8"/>';
                                    }
                                  }, 2000);
                                });
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
