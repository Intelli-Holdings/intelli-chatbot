"use client"

import { useState } from "react"
import { Check, Send } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import DashboardHeader from "@/components/dashboard-header"
import TemplatePreview from "@/components/template-preview"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

// Mock templates data
const mockTemplates = [
  {
    id: "1",
    name: "order_confirmation",
    category: "UTILITY",
    status: "APPROVED",
    language: "en_US",
    components: {
      header: {
        type: "TEXT",
        text: "Order Confirmation",
        format: "TEXT",
        example: "",
      },
      body: {
        text: "Thank you for your order, {{1}}! Your order #{{2}} has been confirmed and will be shipped soon. Your estimated delivery date is {{3}}.",
        examples: [["", "", ""]],
      },
      footer: {
        text: "Reply to this message for support",
      },
      buttons: [],
    },
  },
  {
    id: "2",
    name: "appointment_reminder",
    category: "UTILITY",
    status: "APPROVED",
    language: "en_US",
    components: {
      header: {
        type: "TEXT",
        text: "Appointment Reminder",
        format: "TEXT",
        example: "",
      },
      body: {
        text: "Hi {{1}}, this is a reminder that you have an appointment scheduled for {{2}} at {{3}}. Please reply YES to confirm or NO to reschedule.",
        examples: [["", "", ""]],
      },
      footer: {
        text: "",
      },
      buttons: [],
    },
  },
]

export default function SendMessagePage() {
  const [selectedTemplate, setSelectedTemplate] = useState("")
  const [phoneNumber, setPhoneNumber] = useState("")
  const [variables, setVariables] = useState<string[]>([])
  const [isSending, setIsSending] = useState(false)
  const [sendResult, setSendResult] = useState<{ success: boolean; message: string } | null>(null)

  const template = mockTemplates.find((t) => t.id === selectedTemplate)

  const handleTemplateChange = (templateId: string) => {
    setSelectedTemplate(templateId)

    // Reset variables when template changes
    const template = mockTemplates.find((t) => t.id === templateId)
    if (template) {
      // Extract variable count from body text
      const matches = template.components.body.text.match(/\{\{[0-9]+\}\}/g) || []
      const uniqueVars = Array.from(new Set(matches.map((m) => m.replace(/[{}]/g, "")))).sort()
      setVariables(Array(uniqueVars.length).fill(""))
    } else {
      setVariables([])
    }
  }

  const handleVariableChange = (index: number, value: string) => {
    const newVariables = [...variables]
    newVariables[index] = value
    setVariables(newVariables)
  }

  const handleSendTest = async () => {
    if (!template || !phoneNumber) return

    setIsSending(true)
    setSendResult(null)

    try {
      // In a real app, this would call the WhatsApp Cloud API
      console.log("Sending test message:", {
        template: template.name,
        phoneNumber,
        variables,
      })

      // Mock API call
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // Mock success
      setSendResult({
        success: true,
        message: "Test message sent successfully!",
      })
    } catch (error) {
      console.error("Error sending test message:", error)
      setSendResult({
        success: false,
        message: "Failed to send test message. Please try again.",
      })
    } finally {
      setIsSending(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <DashboardHeader />
      <main className="flex-1 container py-6">
        <h1 className="text-2xl font-bold mb-6">Send Test Message</h1>

        <div className="grid md:grid-cols-[1fr_350px] gap-6">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Select Template</CardTitle>
                <CardDescription>Choose a template to send as a test message</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="template">Template</Label>
                  <Select value={selectedTemplate} onValueChange={handleTemplateChange}>
                    <SelectTrigger id="template">
                      <SelectValue placeholder="Select a template" />
                    </SelectTrigger>
                    <SelectContent>
                      {mockTemplates.map((template) => (
                        <SelectItem key={template.id} value={template.id}>
                          {template.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {template && (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle>Recipient</CardTitle>
                    <CardDescription>Enter the phone number to send the test message to</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        placeholder="+1234567890"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                      />
                      <p className="text-xs text-muted-foreground">
                        Enter the full phone number with country code (e.g., +1 for US)
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Template Variables</CardTitle>
                    <CardDescription>Fill in the values for the template variables</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {variables.length === 0 ? (
                      <p className="text-sm text-muted-foreground">This template doesn&apos;t have any variables.</p>
                    ) : (
                      variables.map((variable, index) => (
                        <div key={index} className="space-y-2">
                          <Label htmlFor={`var-${index}`}>
                            Variable {index + 1}
                          </Label>
                          <Input 
                            id={`var-${index}`}
                            placeholder={`Value for {{${index + 1}}}`}
                            value={variable}
                            onChange={(e) => handleVariableChange(index, e.target.value)}
                          />
                        </div>
                      ))
                    )}
                  </CardContent>
                  <CardFooter>
                    <Button className="w-full gap-2" onClick={handleSendTest} disabled={isSending || !phoneNumber}>
                      {isSending ? (
                        "Sending..."
                      ) : (
                        <>
                          <Send className="h-4 w-4" />
                          Send Test Message
                        </>
                      )}
                    </Button>
                  </CardFooter>
                </Card>

                {sendResult && (
                  <Alert variant={sendResult.success ? "default" : "destructive"}>
                    <AlertTitle>
                      {sendResult.success ? (
                        <div className="flex items-center gap-2">
                          <Check className="h-4 w-4" />
                          Success
                        </div>
                      ) : (
                        "Error"
                      )}
                    </AlertTitle>
                    <AlertDescription>{sendResult.message}</AlertDescription>
                  </Alert>
                )}
              </>
            )}
          </div>

          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Preview</CardTitle>
                <CardDescription>How your message will appear to the recipient</CardDescription>
              </CardHeader>
              <CardContent>
                {template ? (
                  <TemplatePreview template={template} variables={variables} />
                ) : (
                  <div className="text-center p-6 text-muted-foreground">Select a template to see preview</div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Tips</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li>• Test messages count toward your messaging limits</li>
                  <li>• Only approved templates can be sent</li>
                  <li>• The recipient must have opted in to receive messages</li>
                  <li>• Variables will be replaced with the values you provide</li>
                  <li>• Use a real phone number that can receive WhatsApp messages</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
