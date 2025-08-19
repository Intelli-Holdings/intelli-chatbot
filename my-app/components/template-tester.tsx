import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Send, TestTube, AlertCircle, Phone, Video, Search, MoreVertical, CheckCheck } from "lucide-react"
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
  onSendTest: (templateName: string, phoneNumber: string, parameters: string[], languageCode: string) => Promise<boolean>
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
      const success = await onSendTest(
        selectedTemplate.name,
        phoneNumber,
        parameters,
        selectedTemplate.language // Pass the template's language code
      )
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

  const replaceVariables = (text: string): string => {
    let result = text
    parameters.forEach((param, index) => {
      const placeholder = `{{${index + 1}}}`
      result = result.replace(placeholder, param || `[Variable ${index + 1}]`)
    })
    // Replace any remaining placeholders
    result = result.replace(/\{\{(\d+)\}\}/g, '[Variable $1]')
    return result
  }

  const getCurrentTime = () => {
    const now = new Date();
    return now.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  }

  const renderWhatsAppPreview = () => {
    if (!selectedTemplate) return null

    const headerComponent = selectedTemplate.components?.find(c => c.type === 'HEADER')
    const bodyComponent = selectedTemplate.components?.find(c => c.type === 'BODY')
    const footerComponent = selectedTemplate.components?.find(c => c.type === 'FOOTER')
    const buttonsComponent = selectedTemplate.components?.find(c => c.type === 'BUTTONS')

    return (
      <div className="mt-6">
        <Label className="mb-3 block">WhatsApp Preview</Label>
        <div className="w-full max-w-md mx-auto rounded-lg overflow-hidden shadow-xl">
          {/* WhatsApp Header */}
          <div className="bg-[#008069] text-white">
            <div className="flex items-center justify-between p-3">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                  <svg viewBox="0 0 24 24" className="w-6 h-6 text-gray-600">
                    <path fill="currentColor" d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                  </svg>
                </div>
                <div className="flex-1">
                  <div className="font-medium text-base">Test Recipient</div>
                  <div className="text-xs opacity-80">
                    {phoneNumber || 'Enter phone number'}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button className="p-2 hover:bg-black/10 rounded-full transition-colors">
                  <Video className="h-5 w-5" />
                </button>
                <button className="p-2 hover:bg-black/10 rounded-full transition-colors">
                  <Phone className="h-5 w-5" />
                </button>
                <button className="p-2 hover:bg-black/10 rounded-full transition-colors">
                  <MoreVertical className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
          
          {/* Chat Area */}
          <div 
            className="min-h-[400px] max-h-[500px] overflow-y-auto"
            style={{ 
              background: '#e5ddd5',
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23d4d4d8' fill-opacity='0.15'%3E%3Cpath d='M50 50c0-5.5 4.5-10 10-10s10 4.5 10 10-4.5 10-10 10c-5.5 0-10-4.5-10-10zm10-7c-3.9 0-7 3.1-7 7s3.1 7 7 7 7-3.1 7-7-3.1-7-7-7zm-30 7c0-5.5 4.5-10 10-10s10 4.5 10 10-4.5 10-10 10c-5.5 0-10-4.5-10-10zm10-7c-3.9 0-7 3.1-7 7s3.1 7 7 7 7-3.1 7-7-3.1-7-7-7zM10 50c0-5.5 4.5-10 10-10s10 4.5 10 10-4.5 10-10 10c-5.5 0-10-4.5-10-10zm10-7c-3.9 0-7 3.1-7 7s3.1 7 7 7 7-3.1 7-7-3.1-7-7-7z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
            }}
          >
            <div className="p-4 space-y-3">
              {/* Encryption Notice */}
              <div className="flex justify-center mb-4">
                <div 
                  className="text-xs px-3 py-1 rounded-full"
                  style={{ 
                    backgroundColor: '#fef8c7',
                    color: '#54656f'
                  }}
                >
                  🔒 Messages are end-to-end encrypted
                </div>
              </div>
              
              {/* Template Message - Incoming from Business */}
              <div className="flex justify-start">
                <div 
                  className="relative max-w-[75%]"
                  style={{ marginLeft: '8px' }}
                >
                  <div 
                    className="rounded-lg shadow-sm"
                    style={{ 
                      backgroundColor: '#ffffff',
                      borderTopLeftRadius: '7px',
                      borderTopRightRadius: '7px',
                      borderBottomRightRadius: '7px',
                      borderBottomLeftRadius: '0px'
                    }}
                  >
                    <div className="px-3 pt-2 pb-1">
                      {/* Header */}
                      {headerComponent && (
                        <div className="mb-2">
                          {headerComponent.format === 'TEXT' && headerComponent.text && (
                            <div className="font-semibold text-[#111b21] text-sm">
                              {replaceVariables(headerComponent.text)}
                            </div>
                          )}
                          {headerComponent.format === 'IMAGE' && (
                            <div className="bg-gray-200 rounded-md h-32 w-full mb-2 flex items-center justify-center">
                              <svg className="w-12 h-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                            </div>
                          )}
                          {headerComponent.format === 'VIDEO' && (
                            <div className="bg-gray-900 rounded-md h-32 w-full mb-2 flex items-center justify-center">
                              <svg className="w-12 h-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                            </div>
                          )}
                          {headerComponent.format === 'DOCUMENT' && (
                            <div className="bg-gray-100 rounded-md p-3 mb-2 flex items-center gap-2">
                              <svg className="w-8 h-8 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                              <span className="text-sm text-gray-700">Document.pdf</span>
                            </div>
                          )}
                        </div>
                      )}
                      
                      {/* Body */}
                      {bodyComponent && bodyComponent.text && (
                        <div 
                          className="text-[#111b21] text-[14px] leading-[19px] whitespace-pre-wrap"
                          style={{ wordBreak: 'break-word' }}
                        >
                          {replaceVariables(bodyComponent.text)}
                        </div>
                      )}
                      
                      {/* Footer */}
                      {footerComponent && footerComponent.text && (
                        <div className="text-xs text-[#667781] mt-2">
                          {footerComponent.text}
                        </div>
                      )}
                      
                      {/* Buttons */}
                      {buttonsComponent?.buttons && buttonsComponent.buttons.length > 0 && (
                        <div className="mt-3 -mx-3 px-3 border-t border-gray-200 pt-2 space-y-1">
                          {buttonsComponent.buttons.map((button: any, index: number) => (
                            <div 
                              key={index}
                              className="w-full py-2 text-center text-[#00a5f4] text-sm font-medium hover:bg-gray-50 rounded cursor-pointer transition-colors flex items-center justify-center gap-1"
                            >
                              {button.type === 'URL' && (
                                <>
                                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                  </svg>
                                  {button.text}
                                </>
                              )}
                              {button.type === 'PHONE_NUMBER' && (
                                <>
                                  <Phone className="w-4 h-4" />
                                  {button.text}
                                </>
                              )}
                              {button.type === 'QUICK_REPLY' && button.text}
                            </div>
                          ))}
                        </div>
                      )}
                      
                      <div className="flex items-center justify-end gap-1 mt-1">
                        <span className="text-[11px] text-[#667781]">
                          {getCurrentTime()}
                        </span>
                        <CheckCheck className="w-4 h-4 text-[#53bdeb]" />
                      </div>
                    </div>
                  </div>
                  {/* Message tail */}
                  <div 
                    className="absolute -left-2 top-0 w-3 h-3"
                    style={{
                      background: '#ffffff',
                      clipPath: 'polygon(100% 0, 100% 100%, 0 0)'
                    }}
                  />
                </div>
              </div>

              {/* Status Badge */}
              <div className="flex justify-center mt-4">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-[#00a884] text-white">
                    {selectedTemplate.category} Template
                  </span>
                  {isSending && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      Sending...
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Control Panel */}
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
              placeholder="254712345678"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className="font-mono"
            />
            <div className="text-xs text-muted-foreground mt-1">
              Include country code without plus sign (e.g., 254 for Kenya, 233 for Ghana)
            </div>
          </div>

          {parameters.length > 0 && (
            <div className="space-y-2">
              <Label>Template Parameters</Label>
              {parameters.map((param, index) => (
                <div key={index}>
                  <Label htmlFor={`param-${index}`} className="text-sm text-muted-foreground">
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

      {/* WhatsApp Preview */}
      <div>
        {renderWhatsAppPreview()}
      </div>
    </div>
  )
}