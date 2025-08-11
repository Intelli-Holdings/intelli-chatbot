import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Send, TestTube, AlertCircle } from "lucide-react"
import { toast } from "sonner"

interface WhatsAppTemplate {
  id: string;
  name: string;
  category: string;
  status: string;
  language: string;
  components: any[];
}

interface TemplateTestProps {
  templates: WhatsAppTemplate[]
  onSendTest: (templateName: string, phoneNumber: string, parameters: string[]) => Promise<boolean>
  loading?: boolean
}

export function TemplateTester({ templates, onSendTest, loading }: TemplateTestProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<WhatsAppTemplate | null>(null)
  const [phoneNumber, setPhoneNumber] = useState("")
  const [parameters, setParameters] = useState<string[]>([])
  const [isSending, setIsSending] = useState(false)

  const handleTemplateSelect = (templateId: string) => {
    const template = templates.find(t => t.id === templateId)
    setSelectedTemplate(template || null)
    
    if (template) {
      // Extract parameter count from template components
      const paramCount = getParameterCount(template)
      setParameters(new Array(paramCount).fill(""))
    }
  }

  const getParameterCount = (template: WhatsAppTemplate): number => {
    let count = 0
    template.components?.forEach(component => {
      if (component.text) {
        const matches = component.text.match(/\{\{\d+\}\}/g)
        if (matches) {
          const maxParam = Math.max(...matches.map((m: any) => parseInt(m.replace(/[{}]/g, ''))))
          count = Math.max(count, maxParam)
        }
      }
    })
    return count
  }

  const handleSendTest = async () => {
    if (!selectedTemplate || !phoneNumber) {
      toast.error("Please select a template and enter a phone number")
      return
    }

    if (!phoneNumber.match(/^\+?[1-9]\d{1,14}$/)) {
      toast.error("Please enter a valid phone number")
      return
    }

    setIsSending(true)
    try {
      const success = await onSendTest(selectedTemplate.name, phoneNumber, parameters)
      if (success) {
        toast.success("Test message sent successfully!")
        setPhoneNumber("")
        setParameters([])
        setSelectedTemplate(null)
      }
    } catch (error) {
      toast.error("Failed to send test message")
    } finally {
      setIsSending(false)
    }
  }

  const renderTemplatePreview = () => {
    if (!selectedTemplate) return null

    return (
      <div className="mt-4 p-4 bg-muted/30 rounded-lg">
        <h4 className="font-medium mb-2">Template Preview:</h4>
        <div className="space-y-2">
          {selectedTemplate.components?.map((component, index) => (
            <div key={index} className="text-sm">
              <Badge variant="outline" className="mb-1">
                {component.type}
              </Badge>
              {component.text && (
                <div className="bg-white p-2 rounded border">
                  {component.text}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TestTube className="h-5 w-5" />
          Template Tester
        </CardTitle>
        <CardDescription>
          Test your WhatsApp templates by sending them to a phone number
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="template-select">Select Template</Label>
          <Select value={selectedTemplate?.id || ""} onValueChange={handleTemplateSelect}>
            <SelectTrigger>
              <SelectValue placeholder="Choose a template to test" />
            </SelectTrigger>
            <SelectContent>
              {templates.filter(t => t.status === 'APPROVED').map((template) => (
                <SelectItem key={template.id} value={template.id}>
                  <div className="flex items-center justify-between w-full">
                    <span>{template.name}</span>
                    <Badge variant="outline" className="ml-2">
                      {template.category}
                    </Badge>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          {templates.filter(t => t.status === 'APPROVED').length === 0 && (
            <div className="text-sm text-muted-foreground mt-2 flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              No approved templates available for testing
            </div>
          )}
        </div>

        <div>
          <Label htmlFor="phone-number">Phone Number</Label>
          <Input
            id="phone-number"
            type="tel"
            placeholder="+1234567890"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            className="font-mono"
          />
          <div className="text-xs text-muted-foreground mt-1">
            Include country code (e.g., +1 for US, +44 for UK)
          </div>
        </div>

        {parameters.length > 0 && (
          <div className="space-y-2">
            <Label>Template Parameters</Label>
            {parameters.map((param, index) => (
              <div key={index}>
                <Label htmlFor={`param-${index}`} className="text-sm">
                  Parameter {index + 1}
                </Label>
                <Input
                  id={`param-${index}`}
                  value={param}
                  onChange={(e) => {
                    const newParams = [...parameters]
                    newParams[index] = e.target.value
                    setParameters(newParams)
                  }}
                  placeholder={`Value for {{${index + 1}}}`}
                />
              </div>
            ))}
          </div>
        )}

        {renderTemplatePreview()}

        <Button 
          onClick={handleSendTest}
          disabled={!selectedTemplate || !phoneNumber || isSending || loading}
          className="w-full"
        >
          {isSending ? (
            <>
              <TestTube className="h-4 w-4 mr-2 animate-spin" />
              Sending Test...
            </>
          ) : (
            <>
              <Send className="h-4 w-4 mr-2" />
              Send Test Message
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  )
}
