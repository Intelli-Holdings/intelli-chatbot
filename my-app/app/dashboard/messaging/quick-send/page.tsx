"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Send, User, Users, CheckCircle2, AlertCircle, ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { useWhatsAppTemplates } from "@/hooks/use-whatsapp-templates"
import { useAppServices } from "@/hooks/use-app-services"
import useActiveOrganizationId from "@/hooks/use-organization-id"

type SendMode = "single" | "group"
type Step = "template" | "parameters" | "recipients"

export default function QuickSendPage() {
  const router = useRouter()
  const organizationId = useActiveOrganizationId()
  const { appServices, selectedAppService } = useAppServices()
  const { templates, loading: templatesLoading } = useWhatsAppTemplates(selectedAppService)

  const [sendMode, setSendMode] = useState<SendMode>("single")
  const [currentStep, setCurrentStep] = useState<Step>("template")
  const [selectedTemplate, setSelectedTemplate] = useState<string>("")
  const [phoneNumber, setPhoneNumber] = useState("")
  const [parameters, setParameters] = useState<Record<string, string>>({})
  const [sending, setSending] = useState(false)

  const handleTemplateSelect = (templateId: string) => {
    setSelectedTemplate(templateId)
    setCurrentStep("parameters")
  }

  const handleParametersComplete = () => {
    setCurrentStep("recipients")
  }

  const handleSend = async () => {
    if (sendMode === "single" && !phoneNumber) {
      toast.error("Please enter a phone number")
      return
    }

    setSending(true)
    try {
      // Simulate sending
      await new Promise(resolve => setTimeout(resolve, 1500))

      toast.success(
        sendMode === "single"
          ? `Message sent to ${phoneNumber}`
          : "Messages sent to selected group"
      )

      // Reset form
      setCurrentStep("template")
      setSelectedTemplate("")
      setPhoneNumber("")
      setParameters({})
    } catch (error) {
      toast.error("Failed to send message")
    } finally {
      setSending(false)
    }
  }

  const approvedTemplates = templates?.filter(t => t.status === "APPROVED") || []
  const selectedTemplateData = approvedTemplates.find(t => t.id === selectedTemplate)

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.back()}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Quick Send</h1>
          <p className="text-muted-foreground">
            Send a message immediately to a contact or for testing
          </p>
        </div>
      </div>

      {/* Send Mode Selection */}
      <Card>
        <CardHeader>
          <CardTitle>What would you like to do?</CardTitle>
          <CardDescription>Choose how you want to send your message</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <Card
              className={`cursor-pointer transition-all ${
                sendMode === "single"
                  ? "border-blue-500 border-2 bg-blue-50/50"
                  : "hover:border-gray-300"
              }`}
              onClick={() => setSendMode("single")}
            >
              <CardHeader>
                <User className="h-8 w-8 text-blue-500" />
                <CardTitle className="mt-4">Single Contact</CardTitle>
                <CardDescription>
                  Send a test message or contact one person
                </CardDescription>
              </CardHeader>
            </Card>

            <Card
              className={`cursor-pointer transition-all ${
                sendMode === "group"
                  ? "border-blue-500 border-2 bg-blue-50/50"
                  : "hover:border-gray-300"
              }`}
              onClick={() => setSendMode("group")}
            >
              <CardHeader>
                <Users className="h-8 w-8 text-purple-500" />
                <CardTitle className="mt-4">Group / Segment</CardTitle>
                <CardDescription>
                  Send to a saved audience or list
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </CardContent>
      </Card>

      {/* Progress Steps */}
      <div className="flex items-center justify-center gap-2">
        <div className={`flex items-center gap-2 ${currentStep === "template" ? "text-blue-600" : currentStep !== "template" ? "text-green-600" : "text-gray-400"}`}>
          {currentStep !== "template" ? (
            <CheckCircle2 className="h-5 w-5" />
          ) : (
            <div className="h-5 w-5 rounded-full border-2 border-current flex items-center justify-center">
              <div className="h-2 w-2 rounded-full bg-current" />
            </div>
          )}
          <span className="font-medium">Choose Template</span>
        </div>
        <div className="h-0.5 w-12 bg-gray-300" />
        <div className={`flex items-center gap-2 ${currentStep === "parameters" ? "text-blue-600" : currentStep === "recipients" ? "text-green-600" : "text-gray-400"}`}>
          {currentStep === "recipients" ? (
            <CheckCircle2 className="h-5 w-5" />
          ) : (
            <div className="h-5 w-5 rounded-full border-2 border-current flex items-center justify-center">
              {currentStep === "parameters" && <div className="h-2 w-2 rounded-full bg-current" />}
            </div>
          )}
          <span className="font-medium">Personalize</span>
        </div>
        <div className="h-0.5 w-12 bg-gray-300" />
        <div className={`flex items-center gap-2 ${currentStep === "recipients" ? "text-blue-600" : "text-gray-400"}`}>
          <div className="h-5 w-5 rounded-full border-2 border-current flex items-center justify-center">
            {currentStep === "recipients" && <div className="h-2 w-2 rounded-full bg-current" />}
          </div>
          <span className="font-medium">Send</span>
        </div>
      </div>

      {/* Step 1: Template Selection */}
      {currentStep === "template" && (
        <Card>
          <CardHeader>
            <CardTitle>Step 1: Choose a Template</CardTitle>
            <CardDescription>
              Select an approved WhatsApp template to send
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {templatesLoading ? (
              <div className="text-center py-8 text-muted-foreground">
                Loading templates...
              </div>
            ) : approvedTemplates.length === 0 ? (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  No approved templates found. Please create and approve templates first.
                </AlertDescription>
              </Alert>
            ) : (
              <div className="grid gap-3">
                {approvedTemplates.map((template) => (
                  <Card
                    key={template.id}
                    className={`cursor-pointer transition-all ${
                      selectedTemplate === template.id
                        ? "border-blue-500 border-2"
                        : "hover:border-gray-300"
                    }`}
                    onClick={() => handleTemplateSelect(template.id)}
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-base">{template.name}</CardTitle>
                          <CardDescription className="mt-1">
                            {template.category} • {template.language}
                          </CardDescription>
                        </div>
                        <Badge variant="secondary" className="bg-green-100 text-green-800">
                          {template.status}
                        </Badge>
                      </div>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Step 2: Parameters */}
      {currentStep === "parameters" && (
        <Card>
          <CardHeader>
            <CardTitle>Step 2: Personalize Message</CardTitle>
            <CardDescription>
              Fill in the template parameters
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {selectedTemplateData && (
              <div className="space-y-4">
                <Alert>
                  <AlertDescription>
                    Template: <strong>{selectedTemplateData.name}</strong>
                  </AlertDescription>
                </Alert>

                {/* Mock parameter inputs - will be dynamic based on template */}
                <div className="space-y-3">
                  <div className="space-y-2">
                    <Label htmlFor="param1">Customer Name</Label>
                    <Input
                      id="param1"
                      placeholder="Enter customer name"
                      value={parameters.name || ""}
                      onChange={(e) => setParameters({ ...parameters, name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="param2">Order Number</Label>
                    <Input
                      id="param2"
                      placeholder="Enter order number"
                      value={parameters.orderNumber || ""}
                      onChange={(e) => setParameters({ ...parameters, orderNumber: e.target.value })}
                    />
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setCurrentStep("template")}>
                    Back
                  </Button>
                  <Button onClick={handleParametersComplete}>
                    Continue to Recipients
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Step 3: Recipients & Send */}
      {currentStep === "recipients" && (
        <Card>
          <CardHeader>
            <CardTitle>Step 3: {sendMode === "single" ? "Enter Recipient" : "Select Audience"}</CardTitle>
            <CardDescription>
              {sendMode === "single"
                ? "Enter the phone number to send to"
                : "Choose a segment or contact list"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {sendMode === "single" ? (
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+1234567890"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                />
                <p className="text-sm text-muted-foreground">
                  Include country code (e.g., +1 for US)
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                <Label htmlFor="segment">Select Segment</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a segment or list" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="vip">VIP Customers (1,247 contacts)</SelectItem>
                    <SelectItem value="inactive">Inactive Users (876 contacts)</SelectItem>
                    <SelectItem value="new">New Signups (234 contacts)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Preview */}
            <Alert>
              <AlertDescription>
                <div className="space-y-1">
                  <p className="font-medium">Ready to send:</p>
                  <p>Template: {selectedTemplateData?.name}</p>
                  <p>Recipient(s): {sendMode === "single" ? phoneNumber || "Not set" : "Selected segment"}</p>
                </div>
              </AlertDescription>
            </Alert>

            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setCurrentStep("parameters")}>
                Back
              </Button>
              <Button onClick={handleSend} disabled={sending || (sendMode === "single" && !phoneNumber)}>
                {sending ? (
                  <>
                    <span className="mr-2">Sending...</span>
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Send Now
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
